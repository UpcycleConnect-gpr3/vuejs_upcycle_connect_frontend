# Intégration Stripe — abonnements

Le frontend ne peut PAS créer un paiement seul : ça nécessite la clé secrète
Stripe (`sk_...`) qui ne doit jamais être exposée au navigateur. Le front se
contente d'appeler ton backend, qui crée la session et écoute le webhook.

## Flux

```
1. Front  : clic "S'abonner"  → POST /billing/checkout-session { price_id }
2. Backend: crée la Checkout Session (clé secrète) → renvoie { url }
3. Front  : window.location = url   (page de paiement hébergée par Stripe)
4. Stripe : encaisse → redirige vers success_url / cancel_url
5. Stripe : appelle POST /billing/webhook (checkout.session.completed)
6. Backend: enregistre en BDD "payé / abonnement actif"  ← source de vérité
```

La page front `/billing/success` interroge ensuite
`GET /billing/checkout-session/:id` pour afficher l'état réel (payé ou en
attente de confirmation du webhook).

## Ce que le front envoie / attend

- `POST {VITE_BILLING_URL}/billing/checkout-session`
  body : `{ price_id, mode: "subscription", success_url, cancel_url }`
  réponse : `{ "success": true, "data": { "url": "https://checkout.stripe.com/..." } }`
- `GET {VITE_BILLING_URL}/billing/checkout-session/:id`
  réponse : `{ "success": true, "data": { "status": "paid" | "pending" | "unpaid" | "failed" } }`
- Le JWT est envoyé dans l'en-tête `Authorization` (token brut, sans `Bearer `),
  donc le backend identifie l'utilisateur depuis le token.

## Variables d'environnement

Frontend (`.env`) :
```
VITE_BILLING_URL=http://localhost:4343
VITE_STRIPE_PRICE_PRO=price_xxx
VITE_STRIPE_PRICE_BUSINESS=price_xxx
```

Backend :
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx   # donné par `stripe listen` ou le dashboard
```

## Backend Go (stripe-go/v76) — handlers de référence

```go
package billing

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/webhook"
)

func init() { stripe.Key = os.Getenv("STRIPE_SECRET_KEY") }

type apiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

func writeJSON(w http.ResponseWriter, code int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(apiResponse{Success: code < 400, Data: data})
}

// POST /billing/checkout-session
func CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PriceID    string `json:"price_id"`
		Mode       string `json:"mode"`
		SuccessURL string `json:"success_url"`
		CancelURL  string `json:"cancel_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.PriceID == "" {
		writeJSON(w, http.StatusBadRequest, "invalid payload")
		return
	}

	userID := r.Context().Value("user_id").(string) // récupéré via ton middleware JWT

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(stripe.CheckoutSessionModeSubscription),
		SuccessURL: stripe.String(body.SuccessURL),
		CancelURL:  stripe.String(body.CancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(body.PriceID), Quantity: stripe.Int64(1)},
		},
		ClientReferenceID: stripe.String(userID), // pour relier la session à l'utilisateur
	}
	// Évite de recréer un client Stripe à chaque fois :
	// params.Customer = stripe.String(stripeCustomerIDForUser(userID))

	s, err := session.New(params)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"url": s.URL})
}

// GET /billing/checkout-session/:id
func GetCheckoutSession(w http.ResponseWriter, r *http.Request) {
	id := /* extrais l'id de l'URL selon ton routeur */ ""
	s, err := session.Get(id, nil)
	if err != nil {
		writeJSON(w, http.StatusNotFound, "not found")
		return
	}
	status := "pending"
	switch s.PaymentStatus {
	case stripe.CheckoutSessionPaymentStatusPaid:
		status = "paid"
	case stripe.CheckoutSessionPaymentStatusUnpaid:
		status = "unpaid"
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": status})
}

// POST /billing/webhook   (route SANS auth JWT, vérifiée par la signature Stripe)
func Webhook(w http.ResponseWriter, r *http.Request) {
	payload, _ := io.ReadAll(r.Body)
	event, err := webhook.ConstructEvent(
		payload, r.Header.Get("Stripe-Signature"), os.Getenv("STRIPE_WEBHOOK_SECRET"),
	)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		var s stripe.CheckoutSession
		_ = json.Unmarshal(event.Data.Raw, &s)
		// ← ICI : écris en BDD que l'utilisateur s.ClientReferenceID est abonné.
		//   subscriptions(user_id, stripe_customer_id, stripe_subscription_id,
		//                 price_id, status='active')
	case "customer.subscription.deleted",
		"customer.subscription.updated":
		// mets à jour le statut (annulé, impayé, etc.)
	}
	w.WriteHeader(http.StatusOK)
}
```

## Test en local

```bash
# 1. installe le CLI Stripe puis connecte-toi
stripe login

# 2. relaie les webhooks vers ton backend (te donne le whsec_... à mettre en env)
stripe listen --forward-to localhost:4343/billing/webhook

# 3. côté front, mets un vrai price_... dans VITE_STRIPE_PRICE_PRO et lance bun dev
# 4. utilise la carte de test 4242 4242 4242 4242, date future, CVC quelconque
```

## Points d'attention

- La route `/billing/webhook` ne doit PAS passer par le middleware JWT
  (Stripe n'envoie pas ton token) ; elle est authentifiée par la signature.
- N'accorde JAMAIS l'abonnement depuis la page `success` seule : c'est le
  webhook qui fait foi (l'utilisateur peut fermer l'onglet avant le retour).
- Le webhook peut être reçu plusieurs fois → rends l'écriture idempotente
  (upsert sur `stripe_subscription_id`).
