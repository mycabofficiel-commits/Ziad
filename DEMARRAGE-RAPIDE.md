# 🚀 DÉMARRAGE RAPIDE - 5 MINUTES

## ⚡ Configuration ultra-rapide

### 1️⃣ Obtenir votre clé API Claude (2 minutes)

1. **Allez sur** : https://console.anthropic.com
2. **Créez un compte** (gratuit)
3. **Cliquez** sur "API Keys" 
4. **Créez** une nouvelle clé
5. **COPIEZ** la clé (elle commence par `sk-ant-api03-...`)
6. **Ajoutez du crédit** : Menu "Billing" → Ajoutez 10-20$

💾 **GARDEZ cette clé**, vous en aurez besoin !

---

### 2️⃣ Déployer sur Railway (3 minutes)

#### A. Créer un compte Railway

1. **Allez sur** : https://railway.app
2. **Connectez-vous** avec GitHub (ou email)

#### B. Uploader le projet

**MÉTHODE RAPIDE - Sans Git :**

1. Dans Railway, cliquez **"New Project"**
2. Sélectionnez **"Empty Project"**
3. Cliquez **"+ New"** → **"GitHub Repo"** → **"Deploy from GitHub"**
4. **OU** utilisez le CLI Railway (voir ci-dessous)

**MÉTHODE CLI (recommandée) :**

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Depuis le dossier mon-sas-claude
cd mon-sas-claude
railway init
railway up
```

#### C. Ajouter PostgreSQL

1. Dans votre projet Railway
2. Cliquez **"+ New"** → **"Database"** → **"PostgreSQL"**
3. ✅ Fait !

#### D. Configurer les variables

1. Cliquez sur votre service **"mon-sas-claude"**
2. Onglet **"Variables"**
3. Ajoutez ces variables :

```
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_COPIEE_ICI
JWT_SECRET=mon_super_secret_123456789
NODE_ENV=production
```

#### E. Générer l'URL

1. Onglet **"Settings"**
2. Section **"Networking"**
3. Cliquez **"Generate Domain"**
4. 🎉 **C'est prêt !**

---

### 3️⃣ Utiliser votre SAS

1. **Ouvrez** l'URL générée par Railway
2. **Cliquez** "Nouveau Projet"
3. **Tapez** par exemple : "Crée-moi une landing page pour une app de méditation"
4. **Regardez** Claude créer votre application en direct ! ✨

---

## 📊 Checklist de vérification

- [ ] ✅ J'ai ma clé API Claude
- [ ] ✅ J'ai ajouté du crédit sur Anthropic (10-20$)
- [ ] ✅ Mon projet est sur Railway
- [ ] ✅ PostgreSQL est ajouté
- [ ] ✅ Les variables sont configurées
- [ ] ✅ Mon URL est générée
- [ ] ✅ Je peux accéder à mon SAS !

---

## 🆘 Problèmes courants

### ❌ "API Key invalid"
→ Vérifiez que votre clé commence bien par `sk-ant-api03-`
→ Vérifiez que vous l'avez bien copiée entièrement

### ❌ "Database connection error"
→ Attendez 1 minute que PostgreSQL soit prêt
→ Vérifiez que la variable DATABASE_URL existe

### ❌ "Application crashed"
→ Regardez les logs dans Railway (onglet "Deployments")
→ Vérifiez toutes vos variables d'environnement

---

## 💡 Premiers prompts à essayer

```
"Crée une landing page moderne pour une startup tech"

"Fais-moi un portfolio personnel avec animations"

"Génère un calculateur de budget mensuel interactif"

"Crée un jeu de morpion jouable"

"Fais un dashboard de statistiques avec graphiques"
```

---

## 💰 Coûts

**Railway (hébergement)** :
- Gratuit : 5$/mois de crédit
- Payant : 5$/mois (500h d'exécution)

**Claude API** :
- ~10-50$/mois selon utilisation
- Crédit non utilisé = aucun coût

**TOTAL estimé** : 0-10$/mois pour débuter

---

## 🎓 Ressources

- **Documentation Railway** : https://docs.railway.app
- **Documentation Claude** : https://docs.anthropic.com
- **README complet** : Voir README.md dans le projet

---

## ✅ C'est tout !

Votre SAS Claude est maintenant opérationnel ! 🎉

**Bon développement !** 🚀
