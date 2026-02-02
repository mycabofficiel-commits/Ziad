# 🚀 Mon SAS Claude

**Votre plateforme personnelle de création d'applications avec l'IA Claude**

## ✨ Fonctionnalités

- 💬 **Chat avec Claude** - Conversation naturelle pour créer vos applications
- 👁️ **Prévisualisation en temps réel** - Voyez vos créations instantanément
- 📁 **Gestion de projets** - Organisez et sauvegardez tous vos projets
- 📊 **Console de logs** - Suivez les actions et debuggez facilement
- 📥 **Export de code** - Téléchargez vos créations
- 🎨 **Interface moderne** - Design inspiré de Manus.ia

## 🎯 Ce que vous pouvez créer

- Sites web complets (HTML, CSS, JavaScript)
- Applications React
- Landing pages
- Dashboards
- Portfolios
- Et bien plus !

---

## 📋 Guide de déploiement sur Railway

### Prérequis

1. **Compte Railway** : https://railway.app (gratuit)
2. **Clé API Claude** : https://console.anthropic.com
3. **Compte GitHub** (recommandé)

### Étape 1 : Obtenir votre clé API Claude

1. Allez sur https://console.anthropic.com
2. Créez un compte ou connectez-vous
3. Cliquez sur **"API Keys"** dans le menu
4. Cliquez sur **"Create Key"**
5. Donnez un nom à votre clé (ex: "mon-sas")
6. **COPIEZ LA CLÉ** et gardez-la précieusement
7. Allez dans **"Billing"** et ajoutez 10-20$ de crédit pour commencer

> ⚠️ **Important** : Gardez votre clé secrète, ne la partagez jamais !

### Étape 2 : Préparer le code sur GitHub

**Option A : Créer un nouveau dépôt**

1. Allez sur https://github.com/new
2. Nommez votre dépôt (ex: `mon-sas-claude`)
3. Laissez-le en **Public** (ou Private si vous avez un compte payant)
4. **NE cochez PAS** "Initialize with README"
5. Cliquez **"Create repository"**

**Dans votre terminal local :**

```bash
# Extraire le ZIP que je vous ai fourni
unzip mon-sas-claude.zip
cd mon-sas-claude

# Initialiser Git
git init
git add .
git commit -m "Initial commit - Mon SAS Claude"

# Connecter à GitHub (remplacez VOTRE_USERNAME et VOTRE_REPO)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

**Option B : Si vous n'avez pas Git installé**

1. Téléchargez GitHub Desktop : https://desktop.github.com
2. Créez un nouveau dépôt et uploadez les fichiers
3. Publiez le dépôt sur GitHub

### Étape 3 : Déployer sur Railway

1. **Allez sur** https://railway.app
2. **Connectez-vous** avec GitHub
3. Cliquez sur **"New Project"**
4. Sélectionnez **"Deploy from GitHub repo"**
5. Autorisez Railway à accéder à vos dépôts
6. Sélectionnez **votre dépôt** `mon-sas-claude`
7. Railway détectera automatiquement Node.js et commencera le déploiement

### Étape 4 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway créera automatiquement la base de données
4. La variable `DATABASE_URL` sera configurée automatiquement ✅

### Étape 5 : Configurer les variables d'environnement

1. Dans votre projet, cliquez sur votre **service (mon-sas-claude)**
2. Allez dans l'onglet **"Variables"**
3. Cliquez sur **"+ New Variable"** et ajoutez :

```
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
JWT_SECRET=votre_secret_aleatoire_securise_123456789
NODE_ENV=production
```

> 💡 **Conseil** : Pour JWT_SECRET, utilisez une chaîne aléatoire longue et complexe

4. Les autres variables (DATABASE_URL, PORT) sont déjà configurées automatiquement par Railway

### Étape 6 : Générer l'URL publique

1. Dans votre service, allez dans **"Settings"**
2. Trouvez la section **"Networking"**
3. Cliquez sur **"Generate Domain"**
4. Railway vous donnera une URL comme : `https://mon-sas-claude-production.up.railway.app`

**Ajoutez cette variable :**

```
FRONTEND_URL=https://votre-url-railway.up.railway.app
```

### Étape 7 : Vérifier le déploiement

1. Railway va automatiquement **redéployer** votre application
2. Attendez que le status passe à ✅ **"Success"**
3. Cliquez sur votre URL générée
4. Vous devriez voir votre SAS Claude ! 🎉

---

## 🎮 Utilisation

### Créer votre premier projet

1. Cliquez sur **"+ Nouveau Projet"**
2. Donnez un titre (ex: "Ma première landing page")
3. Cliquez **"Créer"**

### Générer du code avec Claude

Exemples de prompts :

```
"Crée-moi une landing page moderne pour une application de fitness"

"Fais-moi un portfolio minimaliste avec mes projets"

"Crée un dashboard avec des graphiques de statistiques"

"Génère un calculateur de pourboire interactif"
```

### Télécharger votre création

1. Cliquez sur **"📥 Télécharger"** dans la section Prévisualisation
2. Le fichier HTML sera téléchargé
3. Vous pouvez l'héberger où vous voulez !

---

## 💰 Coûts estimés

### Railway
- **Plan gratuit** : $5 de crédit gratuit/mois (suffisant pour débuter)
- **Plan Hobby** : $5/mois (500 heures d'exécution)
- **Plan Pro** : $20/mois (illimité)

### API Claude (Anthropic)
- **Modèle utilisé** : Claude Sonnet 4
- **Tarif** : ~$3 par million de tokens d'entrée, ~$15 par million de tokens de sortie
- **Estimation** : 10-50$ par mois selon utilisation intensive

**Conseil** : Commencez avec le plan gratuit de Railway + 20$ de crédit Claude

---

## 🛠️ Développement local (optionnel)

Si vous voulez tester en local avant de déployer :

```bash
# Installer les dépendances
npm install

# Créer un fichier .env
cp .env.example .env

# Éditer .env avec vos vraies valeurs
# ANTHROPIC_API_KEY=sk-ant-...
# DATABASE_URL=postgresql://...

# Démarrer le serveur
npm start
```

Ouvrez http://localhost:3000

---

## 🔧 Dépannage

### "Erreur de connexion à la base de données"
- Vérifiez que PostgreSQL est bien ajouté dans Railway
- Vérifiez que DATABASE_URL est défini dans les variables

### "Erreur API Claude"
- Vérifiez que votre clé API est correcte
- Vérifiez que vous avez du crédit sur votre compte Anthropic
- La clé doit commencer par `sk-ant-api03-`

### "Application ne démarre pas"
- Regardez les logs dans Railway (onglet "Deployments")
- Vérifiez que toutes les variables d'environnement sont définies

### "Preview ne s'affiche pas"
- Vérifiez la console du navigateur (F12)
- Essayez de rafraîchir la page
- Le code généré doit être du HTML valide

---

## 📚 Structure du projet

```
mon-sas-claude/
├── server.js           # Serveur Express + API
├── package.json        # Dépendances
├── .env.example        # Variables d'environnement (template)
├── .gitignore          # Fichiers à ignorer
├── README.md           # Ce fichier
└── public/
    ├── index.html      # Interface utilisateur
    └── app.js          # Logique frontend
```

---

## 🚀 Prochaines améliorations possibles

- [ ] Système d'authentification multi-utilisateurs
- [ ] Déploiement automatique sur Vercel/Netlify
- [ ] Support de templates de projets
- [ ] Collaboration en temps réel
- [ ] Système de crédits avancé
- [ ] Intégration ChatGPT (multi-modèles)
- [ ] Export vers GitHub
- [ ] Gestion de versions de code

---

## 📝 License

MIT - Libre d'utilisation et de modification

---

## 💬 Support

Si vous avez des questions :
1. Consultez les logs dans Railway
2. Vérifiez votre configuration API
3. Testez en local d'abord

---

## 🎉 Félicitations !

Vous avez maintenant votre propre plateforme de création d'applications avec Claude !

**Bon développement ! 🚀**
