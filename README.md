# 💱 FluxDevise — Convertisseur de Devises & Courbe en Direct

Application web moderne, rapide et ultra-précise de conversion de devises avec graphique en temps réel et données historiques certifiées.

## ✨ Caractéristiques & Fonctionnalités

- **100% Vanilla** : Réalisé en HTML5, CSS3 et JavaScript pur (**zéro framework**, zéro bibliothèque externe).
- **Courbe en Direct Interactive (Canvas)** :
  - Mode **24H Direct** avec pulsation en temps réel et micro-variations interbancaires.
  - Historique complet sur plusieurs périodes : **7 Jours**, **1 Mois**, **6 Mois**, **1 An**, **5 Ans**.
  - Tracé en courbes de Bézier lissées avec dégradé adaptatif (vert pour les gains, rouge pour les baisses).
  - Réticule de visée (crosshair) et infobulle (tooltip) interactive au survol de la souris ou au doigt (tactile).
  - Statistiques en direct : Plus Haut, Plus Bas, Taux Moyen et Variation en % de la période.
- **Convertisseur Réactif** :
  - Calcul instantané lors de la saisie du montant ou du changement de devise.
  - Puces de raccourcis rapides (`+10`, `+50`, `+100`, `+500`, `+1 000`, `Reset`).
  - Bouton d'inversion des devises (Swap ⇄) avec animation fluide.
  - Taux unitaire direct (`1 EUR = ...`) et taux inverse (`1 USD = ...`).
  - Bouton de copie instantanée dans le presse-papier avec notification Toast.
- **Sélecteur de Devises Intelligent** :
  - Plus de 30 devises mondiales majeures (EUR, USD, GBP, JPY, CHF, CAD, AUD, CNY, etc.).
  - Badges colorés personnalisés avec symboles monétaires et drapeaux des pays.
  - Moteur de recherche instantané par code, nom ou pays.
- **Tableau de Conversion Rapide (Matrice)** :
  - Équivalences automatiques côte à côte pour 1, 5, 10, 25, 50, 100, 500, 1 000 et 5 000 unités.
- **Ruban Défilant des Paires Phares (Ticker Forex)** :
  - Ticker interactif en haut d'écran affichant en temps réel les cours des paires les plus échangées (EUR/USD, GBP/EUR, USD/JPY, EUR/CHF, etc.). Un simple clic sur une paire la charge instantanément dans le convertisseur et le graphique.
- **Thèmes Sombre & Clair** :
  - Thème sombre fintech néo-banque par défaut avec effet de verre (glassmorphism).
  - Bascule en un clic vers un thème clair épuré avec mémorisation dans le navigateur (`localStorage`).
- **Fiabilité & Mode Hors-Ligne** :
  - Données officielles de référence issues de la **Banque Centrale Européenne (BCE)** via l'API Frankfurter.
  - Cache local et taux de repli intégrés garantissant un fonctionnement continu même en cas de coupure réseau.

---

## 🚀 Comment lancer le projet ?

### Méthode 1 : Ouverture directe (Le plus simple)
Double-cliquez simplement sur le fichier `index.html` pour l'ouvrir dans votre navigateur préféré (Chrome, Edge, Firefox, etc.).

### Méthode 2 : Via le serveur local intégré
Ouvrez un terminal PowerShell dans ce dossier et exécutez :
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Puis accédez à `http://localhost:8085/` dans votre navigateur.

---

## 📁 Structure des fichiers

```text
convertisseur/
├── index.html          # Structure sémantique HTML5
├── README.md           # Documentation du projet
├── server.ps1          # Serveur web local PowerShell autonome
├── css/
│   └── style.css       # Système de design, variables CSS, animations, responsive
└── js/
    ├── currencies.js   # Métadonnées des devises (symboles, drapeaux, couleurs, taux)
    ├── api.js          # Client API Frankfurter (taux réels BCE, historique, cache)
    ├── chart.js        # Moteur de graphique interactif HTML5 Canvas haute précision
    └── app.js          # Orchestration, conversion en direct, ticker et événements
```
