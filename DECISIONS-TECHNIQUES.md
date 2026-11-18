# Diagnostic Beauté Expert – socle (développement, non publié)

- Application autonome, 2 fichiers : index.html + catalogue.js + accueil.html (page d’accueil), logo.png, icônes (180, 192, 512), og.png (aperçu de partage), manifest.webmanifest. Aucune connexion à Shopify, aucun jeton, aucun secret.
- Catalogue intégré, généré par build_catalogue.py depuis l'API Admin (lecture seule) : 178 produits (179 moins la bougie Holidermie), brouillons inclus, composition conservée en entier (jamais résumée).
- Champs de conseil (types de peau, précautions) = null : non évaluables tant que Marie-Sophie n'a pas validé.
- Stockage : IndexedDB par appareil, export JSON. Cinq natures de données séparées dans chaque enregistrement : reponsesDeclarees, observationsProfessionnelles, catalogue, propositionsMoteur, modificationsProfessionnelles.
- Moteur : non branché (aucune recommandation générée). Allergies : 3 états (aucune connue / oui / je ne sais pas).
- Questions actives : statut « Proposé » de l'étape 5. En attente de Marie-Sophie, non affichées : D5, E3, E5, E6, F2, F4, F5, H1. C2 affichée, à valider. Cheveux et Lèvres masqués.
- Non touché : diagnostic olfactif, thème Shopify, boutique.

## Moteur v0.1 (18/11/2026)
- moteur.js : règles explicites ; seules les données « Validé » comptent, « À confirmer » n'est utilisé qu'en mode test (adresse …/index.html?test=1) ; « Inconnu » n'est jamais favorable.
- conseil.js (généré par build_conseil.py depuis le tableau Visage) : préoccupations proposées = termes validés retrouvés mot pour mot dans les fiches, statut « À confirmer » ; types de peau et précautions = « Inconnu ».
- Univers actif : Visage seul. Corps, Mains, Bucco-dentaire : « correspondances non établies », aucune recommandation. Cheveux et Lèvres masqués. Compléments alimentaires exclus.
- Allergies : correspondance exacte (accents et casse ignorés) avec un ingrédient listé ; produit exclu quel que soit son score. Composition partielle : « compatibilité non vérifiée ».
- Brouillons exclus (décision du 18/11). Produits indisponibles proposés avec la mention « Indisponible ». Budget non utilisé (tranches à définir).
- Paramètres provisoires à valider : 3 essentiels et 3 complémentaires maximum par univers ; départage à égalité = ordre alphabétique (aucune règle métier).
- Un seul bouton de démarrage (décision du 18/11) ; « Retirer de la proposition » disponible pour tous, journalisé. Ajout et remplacement : non développés.
- Données conservées séparément : propositionsMoteur (proposition initiale) et modificationsProfessionnelles.

## Mise à jour 18/11/2026 – données validées
- « Tout est validé » (Renaud, au nom de Marie-Sophie) : le fichier global de validation alimente conseil.js (build_conseil.py). Toute information renseignée = « Validé » ; information absente = « Inconnu » (jamais favorable).
- Univers actifs : Visage, Corps, Mains, Bucco-dentaire (préoccupations par univers). Cheveux et Lèvres masqués. Le mode test (?test=1) reste disponible.
- Types de peau et précautions : texte de la marque affiché sur chaque fiche produit ; non utilisé comme règle d'exclusion ni de score (aucune règle validée). Les mentions commençant par « Aucun… » ne sont pas affichées.
- Limites connues : correspondance des préoccupations établie par repérage de termes dans les fiches (106 produits sur 178 ont au moins une préoccupation) ; à égalité, ordre alphabétique ; plafond de 3 produits essentiels et 3 complémentaires par univers (provisoire).

## Décisions du 18/11/2026 (Renaud) – départage, routine, plafond, PDF
- Départage à pertinence égale : le produit dont le texte de la marque cite le type de peau de la cliente (ou « tous types de peau ») passe devant ; sans information il reste après ; puis ordre alphabétique. Aucun produit n'est exclu pour cette raison.
- Plafond par univers : 4 produits essentiels et 2 complémentaires.
- Ordre d'application : par rôle du produit (sous-catégorie Shopify) : nettoyant, gel douche et savons, dentifrice, tonique, sérum et huile, contour des yeux, crème, protection solaire, gommage et masque, accessoires en dernier. Cet ordre est une proposition standard à faire valider par Marie-Sophie ; un produit sans sous-catégorie est placé en dernier.
- PDF : profil beauté, réponses, routine numérotée (essentiel ou complémentaire), justification, usage, précautions de la marque, mention « Indisponible ». Les types de peau cités par la marque restent à l'écran, hors PDF.
