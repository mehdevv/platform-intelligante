# Audit design — avril 2026

## Problèmes identifiés (avant correction)

1. **Charte AEM non appliquée** : thème MUI utilisait bleu `#003399` et orange `#FF6600`, typographies Public Sans / Playfair Display — en contradiction avec la charte (bleu grisé + azur, League Spartan / Libre Baskerville / DM Sans).
2. **Marque incohérente** : libellé « DataVault » alors que le dépôt et le produit cible sont « Researcha » / intelligence de marché AEM.
3. **Double pile CSS** : MUI + Tailwind avec couleurs différentes dans `tailwind.config.js` — risque de dérive lors des classes utilitaires.
4. **Copy métier** : plusieurs écrans décrivent un produit de stockage sécurisé au lieu d’une plateforme de rapports et données sectorielles.
5. **Footer** : copyright 2024 et entité « DataVault Intelligence Inc. » non alignés AEM / 2026.

## Actions réalisées dans le code (cette passe)

- Mise à jour de `src/theme.js`, `tailwind.config.js`, `index.html` (polices + titre document).
- Alignement des couleurs d’accent sur l’**azur** pour CTA et éléments interactifs forts.
- Remplacement progressif des hex legacy et du branding **Researcha** sur les composants listés dans le diff.
- `index.css` : dégradé graphiques basé sur la palette AEM.

## Pistes suivantes (non obligatoires dans cette itération)

- Introduire `useTheme()` ou tokens importés pour éviter les hex en dur dans les pages les plus longues (`HomePage`).
- Brancher i18n FR/EN et harmoniser les routes (`/reports` vs `/rapports`).
- Remplacer l’icône générique « Storage » par un logotype SVG AEM / Researcha lorsque le fichier officiel sera fourni.
- Réécrire les sections Pricing / FAQ / hero avec la terminologie du cahier des charges dès que le PDF sera disponible dans le repo.
