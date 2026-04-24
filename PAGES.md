# vuejs_upcycle_connect_frontend — Pages

Site public / marketing de UpcycleConnect.

Accès : `http://upcycle-front.localhost` (Docker) ou `http://localhost:5173`

## Routes

| Chemin | Composant | Description |
|---|---|---|
| `/` | `HomePage` | Landing — hero, feature, partnership, contact |
| `/service` | `ServicePage` | Liste des services (6 cartes) + CTA |
| `/resources` | `ResourcesPage` | Guides, tutoriels, case studies |
| `/about` | `AboutPage` | Mission + équipe |
| `/pricing` | `PricingPage` | 3 plans (Basic / Pro / Business) + tarifs complémentaires |
| `/forum` | `ForumPage` | News / articles forum |

## API backend liée

Ce frontend est principalement vitrine (pas d'intégration API lourde). Routes potentielles :
- Auth redirigé vers `auth-front.localhost` (voir vuejs_auth_frontend)
- Forum consomme `go_forum_backend` (categories, talks, messages)

## CSS architecture

- `src/css/components/` — structure des éléments (button, pricing, etc.)
- `src/css/styles/` — variants/couleurs via custom properties
- `src/css/layouts/` — layouts composés (header, section, form, etc.)
- `src/css/themes/base.css` — design tokens (colors, spacing, font-sizes)
