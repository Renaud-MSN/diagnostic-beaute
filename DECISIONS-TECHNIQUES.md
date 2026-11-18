# Diagnostic Beauté Expert – socle (développement, non publié)

- Application autonome, 2 fichiers : index.html + catalogue.js + logo.png, icônes (180, 192, 512), og.png (aperçu de partage), manifest.webmanifest. Aucune connexion à Shopify, aucun jeton, aucun secret.
- Catalogue intégré, généré par build_catalogue.py depuis l'API Admin (lecture seule) : 178 produits (179 moins la bougie Holidermie), brouillons inclus, composition conservée en entier (jamais résumée).
- Champs de conseil (types de peau, précautions) = null : non évaluables tant que Marie-Sophie n'a pas validé.
- Stockage : IndexedDB par appareil, export JSON. Cinq natures de données séparées dans chaque enregistrement : reponsesDeclarees, observationsProfessionnelles, catalogue, propositionsMoteur, modificationsProfessionnelles.
- Moteur : non branché (aucune recommandation générée). Allergies : 3 états (aucune connue / oui / je ne sais pas).
- Questions actives : statut « Proposé » de l'étape 5. En attente de Marie-Sophie, non affichées : D5, E3, E5, E6, F2, F4, F5, H1. C2 affichée, à valider. Cheveux et Lèvres masqués.
- Non touché : diagnostic olfactif, thème Shopify, boutique.
