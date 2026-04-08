# Researcha — contexte produit & design

Ce dossier centralise la documentation de référence pour l’équipe (specs, charte AEM, inventaire des pages, écarts à combler). Les tokens couleur utilisables en code sont dupliqués dans `aem-design-tokens.json` ; l’application React applique la même palette via `src/theme.js`.

**Document consolidé (planification système / LLM)** : `PLATFORM_MASTER_CONTEXT_FOR_SYSTEM_PLANNING.md` — vue d’ensemble détaillée du produit, routes, stack, écarts et pistes d’architecture pour générer roadmaps et specs (ex. Claude).

**Fichiers**

| Fichier | Rôle |
|--------|------|
| `source-documents.md` | Quels documents ont été consultés dans le workspace |
| `product-spec-summary.md` | Synthèse fonctionnelle (fiche technique HTML AEM) |
| `aem-design-tokens.json` | Tokens couleur, typo, rayons (charte numérique) |
| `site-inventory-and-gaps.md` | Pages existantes vs manquantes, routes cibles |
| `design-audit-2026-04.md` | Audit UI, incohérences corrigées ou à traiter |
| `design-premium-recommendations.md` | Formes, motion, premium — pistes produit |
| `design-system-v2.md` | Shell clair, pas de glow, imagerie réelle, app dashboard/admin |
| `dashboard-admin-routes.md` | Cartographie `/dashboard/*` et `/admin/*` — **fonctionnalités cibles**, état actuel, et **design des sections** (layouts, cartes, tableaux, `EmptyState`) par page |
| `SUPABASE_SETUP.md` | Clés API, schéma SQL (`../supabase/migrations/`), premier admin, variables `VITE_*` |

Dernière mise à jour : avril 2026.
