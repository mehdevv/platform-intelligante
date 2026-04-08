# Synthèse produit — Plateforme d’intelligence de marché (AEM)

Source : `AEM_Market_Intelligence_Platform_Technical_Sheet.html` (Mars 2026, MVP V1.0).

## Positionnement

- Inspiré de Statista & Mordor Intelligence ; cible B2B (entreprises, chercheurs, institutions).
- Modèle : SaaS abonnements + achats à l’unité.
- Marché cible explicite : Algérie et contexte régional (paiements CIB / BaridiPay mentionnés).

## Stack cible (référence)

React SPA, Supabase (auth, PostgreSQL, RLS), Cloudflare (R2, CDN), recherche FTS, RAG (pgvector), Stripe/CIB, Recharts/D3, Vite + Tailwind, emails Resend/SendGrid.

## Plans commerciaux (référence)

- **Simple** : quota rapports, lecture en ligne, pas dashboard avancé / export / IA.
- **Premium** : accès étendu, dashboard, KPIs, exports, IA type « Statista AI », alertes.
- **Corporate** : sièges, licences, facturation groupe, support prioritaire, études sur mesure.

## Modules fonctionnels majeurs (hors simple catalogue)

- Moteur de recherche full-text + facettes + historique (RGPD).
- Paywall / aperçu gratuit / viewer sécurisé / filigrane.
- Back-office admin (CRUD rapports, import, promotions, analytics, audit).
- Veille & actualités (blog, agenda, newsletter, alertes).
- Agent IA RAG sur rapports (respect du paywall).
- Simulateur méthodologique (`/methodologie`).
- Espace corporate (`/corporate`).

## Identité visuelle (extrait charte dans la fiche technique)

- Couleurs : bleu grisé `#4B5B72`, azur `#197F94`, gris `#A5ADBA`, fond `#EBECF1`, header/sombres `#1a2332`.
- Typographies : **League Spartan** (titres), **Libre Baskerville** italic (accents éditoriaux), **DM Sans** (corps / UI).
- Ton : formel, expert, contemporain, B2B haute valeur.
