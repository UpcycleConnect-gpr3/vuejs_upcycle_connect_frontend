# vuejs_upcycle_connect_frontend — Pages

Site public / vitrine UpcycleConnect.
Authentification → redirige vers `vuejs_auth_frontend`.

Accès : `http://upcycle-front.localhost` (Docker) ou `http://localhost:5173`

## Routes

### Vitrine

| Chemin | Composant | Description | Liens |
|---|---|---|---|
| `/` | `HomePage` | Hero display, 3 features accent-bar, feature split, partnership, contact | [docker](http://upcycle-front.localhost/) · [local](http://localhost:5173/) |
| `/service` | `ServicePage` | 4 service blocks alternés grid-2 + CTA | [docker](http://upcycle-front.localhost/service) · [local](http://localhost:5173/service) |
| `/resources` | `ResourcesPage` | Grid de 6 ressources avec badge type + image | [docker](http://upcycle-front.localhost/resources) · [local](http://localhost:5173/resources) |
| `/about` | `AboutPage` | Mission split + grid-4 team members | [docker](http://upcycle-front.localhost/about) · [local](http://localhost:5173/about) |
| `/pricing` | `PricingPage` | 3 plans (Basic/Pro featured/Business) + 3 stats boxes + CTA | [docker](http://upcycle-front.localhost/pricing) · [local](http://localhost:5173/pricing) |

### Forum

| Chemin | Composant | Description | Liens |
|---|---|---|---|
| `/forum` | `ForumIndexPage` | Liste discussions + recherche + filtres catégories | [docker](http://upcycle-front.localhost/forum) · [local](http://localhost:5173/forum) |
| `/forum/new` | `ForumNewPage` | Form création (catégorie + titre + contenu markdown) | [docker](http://upcycle-front.localhost/forum/new) · [local](http://localhost:5173/forum/new) |
| `/forum/:id` | `ForumDetailPage` | Détail talk + reactions + replies + form reply | [docker](http://upcycle-front.localhost/forum/1) · [local](http://localhost:5173/forum/1) |

### Dashboard particulier (`/dashboard/*`)

Espace personnel post-auth. Sidebar 260px sticky avec 3 sections (Mon activité / Découvrir / Mon profil).

| Chemin | Composant | Description | Liens |
|---|---|---|---|
| `/dashboard` | `IndexPage` | Vue d'ensemble : score + stats + alertes + prochains rdv + conseils | [docker](http://upcycle-front.localhost/dashboard) · [local](http://localhost:5173/dashboard) |
| `/dashboard/listings` | `ListingsPage` | Mes annonces (don/vente). Modal wizard 3 steps (infos → photos → récap) | [docker](http://upcycle-front.localhost/dashboard/listings) · [local](http://localhost:5173/dashboard/listings) |
| `/dashboard/listings/new` | `ListingsPage` | Ouvre directement le wizard | [docker](http://upcycle-front.localhost/dashboard/listings/new) · [local](http://localhost:5173/dashboard/listings/new) |
| `/dashboard/deposits` | `DepositsPage` | Dépôts conteneur. Modal nouvelle demande + modal code 6 chiffres + QR | [docker](http://upcycle-front.localhost/dashboard/deposits) · [local](http://localhost:5173/dashboard/deposits) |
| `/dashboard/deposits/new` | `DepositsPage` | Form rapide pour demander un dépôt | [docker](http://upcycle-front.localhost/dashboard/deposits/new) · [local](http://localhost:5173/dashboard/deposits/new) |
| `/dashboard/advice` | `AdvicePage` | Espace Conseils — articles publiés par staff. Featured + grid filtrable, bookmarks | [docker](http://upcycle-front.localhost/dashboard/advice) · [local](http://localhost:5173/dashboard/advice) |
| `/dashboard/advice/:id` | `AdviceDetailPage` | Lecture article + auteur + related | [docker](http://upcycle-front.localhost/dashboard/advice/1) · [local](http://localhost:5173/dashboard/advice/1) |
| `/dashboard/catalog` | `CatalogPage` | Catalogue services/formations/événements achetables | [docker](http://upcycle-front.localhost/dashboard/catalog) · [local](http://localhost:5173/dashboard/catalog) |
| `/dashboard/catalog/:id` | `CatalogDetailPage` | Détail + slots + sticky CTA + modal checkout → confirmation | [docker](http://upcycle-front.localhost/dashboard/catalog/1) · [local](http://localhost:5173/dashboard/catalog/1) |
| `/dashboard/score` | `ScorePage` | Upcycling Score : jauge SVG + breakdown + chart historique + badges | [docker](http://upcycle-front.localhost/dashboard/score) · [local](http://localhost:5173/dashboard/score) |
| `/dashboard/planning` | `PlanningPage` | Planning perso. Liste groupée par mois + export ICS + modal détail | [docker](http://upcycle-front.localhost/dashboard/planning) · [local](http://localhost:5173/dashboard/planning) |
| `/dashboard/orders` | `OrdersPage` | Historique commandes + factures PDF | [docker](http://upcycle-front.localhost/dashboard/orders) · [local](http://localhost:5173/dashboard/orders) |

### Composants dashboard (`src/components/`)

- **`DashboardLayout.vue`** — sidebar 260px (3 sections, icônes Phosphor) + main + onboarding
- **`AppModal.vue`** — modal teleporté backdrop blur, esc/click outside, slots header/body/footer, sizes small/medium/large
- **`DashboardOnboarding.vue`** — overlay tutoriel 5 steps. Spotlight via `box-shadow: 0 0 0 9999px` sur élément ciblé `data-tour="..."`. Persiste `localStorage.uc_onboarded`

## Composants partagés (`src/components/`)

- **`AppHeader.vue`** — Logo lime + nav + Sign up/Log in
- **`AppFooter.vue`** — 2 colonnes Product/Resources + copyright

## Design tokens

Fond `#1F2021`, cards `#142726` (green-800), accents lime `#D8FF4F`, no-radius, Inter 400-900.
