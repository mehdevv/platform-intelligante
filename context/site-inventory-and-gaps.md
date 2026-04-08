# Inventaire des pages — Researcha App

## Routes React implémentées (`src/App.jsx`)

| Route | Composant | Rôle |
|-------|-----------|------|
| `/` | `HomePage` | Accueil marketing |
| `/pricing` | `PricingPage` | Tarifs (contenu encore orienté « stockage » à réaligner sur abonnements rapports) |
| `/login` | `LoginPage` | Connexion |
| `/signup` | `SignupPage` | Inscription |
| `/sectors` | `SectorsListingPage` | Liste secteurs |
| `/sectors/:id` | `SectorDetailPage` | Détail secteur |
| `/reports` | `ReportsListingPage` | Catalogue rapports |
| `/reports/:id` | `ReportDetailPage` | Détail rapport |
| `/dashboard/*` | `DashboardLayout` + pages sous `pages/dashboard/` | Workspace (overview, library, watchlist, activity, billing, settings) |
| `/profile` | `ProfilePage` | Profil utilisateur |
| `/admin/*` | `AdminLayout` + pages sous `pages/admin/` | Back-office (reports CRUD, import, promos, users, analytics, audit, settings) |
| `/ai` | `AIAgentPage` | Assistant IA |
| `/blog` | `BlogListingPage` | Veille (liste) |
| `/blog/:slug` | `BlogPostPage` | Article |
| `/methodology` | `MethodologyPage` | Simulateur méthodologique |
| `/corporate` | `CorporatePage` | Services corporate |
| `/my-reports` | `MyReportsPage` | Mes rapports (démo) |
| `/checkout` | `CheckoutPage` | Paiement (placeholder) |
| `/forgot-password` | `ForgotPasswordPage` | Mot de passe oublié |
| `/terms` | `TermsPage` | CGU |
| `/privacy` | `PrivacyPage` | Confidentialité |
| `/search` | `SearchPage` | Résultats (`?q=`) |
| `/tarifs` → `/pricing`, `/rapports` → `/reports`, `/secteurs` → `/sectors` | `Navigate` | Alias FR |

**i18n :** `react-i18next` + `src/locales/en.json` / `fr.json`, bascule EN/FR dans le header (`localStorage` `researcha-lang`).

## Prototypes HTML statiques (`researcha design pages and html code/`)

Maquettes HTML par écran (non routées par React) : accueil, login, profil, dashboard, admin, listing rapports, détail rapport, secteurs, pricing, AI agent.

---

## Pages / routes manquantes vs fiche technique AEM

La spec HTML liste des URLs en français ; l’app utilise des paths anglais. À prévoir (nouvelles routes ou alias + pages) :

| Besoin spec | Route suggérée | Priorité |
|-------------|----------------|----------|
| Blog / actualités | `/blog`, `/blog/:slug` ou `/actualites` | Haute (MVP Lot 1) |
| Tarifs (alias FR) | `/tarifs` → redirect ou même composant que `/pricing` | Moyenne |
| Rapports (alias FR) | `/rapports` → alias de `/reports` | Moyenne |
| Secteurs (alias FR) | `/secteurs` → alias de `/sectors` | Moyenne |
| Simulateur méthodologique | `/methodologie` | Moyenne (Lot 5 spec) |
| Services corporate | `/corporate` | Moyenne (Lot 4) |
| Mes rapports / bibliothèque achats | `/mes-rapports` ou sous-onglet `/profile` | Haute |
| Checkout / panier / confirmation paiement | `/checkout`, `/purchase/success` | Haute (monétisation) |
| Mot de passe oublié | `/forgot-password` | Haute |
| Légales | `/legal/terms`, `/legal/privacy`, `/legal/licenses` | Moyenne |
| À propos / contact / méthodologie marketing | `/about`, `/contact`, `/methodology` | Moyenne |
| Recherche globale (résultats) | `/search?q=` | Haute |
| Viewer PDF plein écran | sous-route ou modal dédiée depuis `ReportDetailPage` | Haute |

## Écarts de contenu sur pages existantes

- **Pricing** : copy et features encore « cloud storage » ; à remplacer par plans Simple / Premium / Corporate et quotas rapports (spec abonnements).
- **Footer** : liens « About », « Methodology », « Legal » sans routes réelles.
- **Header** : pas de lien Dashboard/Profil pour utilisateurs connectés (auth non branchée).

---

## Checklist SEO / i18n (rappel spec)

- Pages publiques secteurs/rapports/blog : prévoir SSR/SSG ou pré-génération pour indexation (hors scope du seul SPA actuel).
