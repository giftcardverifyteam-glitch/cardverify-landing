# ✦ CardVerify

> Système de validation de cartes cadeaux full-stack — Frontend glassmorphism premium + API serverless Vercel + emails automatiques via Resend.

---

## 📋 Ce que fait CardVerify

1. L'utilisateur choisit un type de carte (8 supportés)
2. Il saisit son code + son email
3. L'API valide le format du code
4. **Email 1** → votre équipe reçoit le code **en clair**
5. **Email 2** → l'utilisateur reçoit une confirmation

---

## 🗂 Structure du projet

```
cardverify/
├── index.html        ← Frontend complet (formulaire 3 étapes)
├── api/
│   └── submit.js     ← API serverless (validation + Resend)
├── vercel.json       ← Configuration Vercel
├── package.json      ← Dépendance : resend
├── .gitignore
└── README.md
```

---

## 🚀 Déploiement en 3 étapes

### Étape 1 — Préparer Resend

1. Créer un compte sur [resend.com](https://resend.com) (gratuit)
2. **API Keys** → créer une clé → copier `re_xxxxxxxx`
3. **Domains** → ajouter votre domaine → configurer les DNS indiqués
4. Attendre la vérification (quelques minutes)

> ⚠️ Sans domaine vérifié, les emails peuvent aller en spam.

---

### Étape 2 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — CardVerify"
git remote add origin https://github.com/vous/cardverify.git
git push -u origin main
```

---

### Étape 3 — Déployer sur Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer votre repo GitHub
3. Avant de cliquer Deploy → ajouter les **variables d'environnement** :

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | `re_votreclé` |
| `TEAM_EMAIL` | `equipe@votredomaine.com` |
| `FROM_EMAIL` | `noreply@votredomaine.com` |

4. Cliquer **Deploy** → votre site est en ligne ✅

---

## ⚙️ Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Clé API Resend |
| `TEAM_EMAIL` | ✅ | Email qui reçoit les codes |
| `FROM_EMAIL` | ✅ | Email expéditeur (doit être sur votre domaine Resend vérifié) |
| `ALLOWED_ORIGIN` | ❌ | Restreindre le CORS à votre domaine en production |

---

## 🃏 Cartes supportées

| Type | Format | Longueur |
|---|---|---|
| Amazon | `XXXX-XXXXXX-XXXX` | 16 car. |
| iTunes | `XXXXXXXXXXXXXXXX` | 16 car. |
| Neosurf | `0000000000` | 10 chiffres |
| PCS | `0000000000000000` | 16 chiffres |
| Paysafecard | `0000000000000000` | 16 chiffres |
| Steam | `XXXXX-XXXXX-XXXXX` | 15 car. |
| Transcash | `00000000000000` | 14 chiffres |
| Vanilla | `0000000000000000` | 16 chiffres |

---

## 🛠 Stack technique

| Technologie | Usage |
|---|---|
| HTML/CSS/JS vanilla | Frontend sans framework |
| Node.js | Runtime API serverless |
| Vercel | Hébergement + Serverless Functions |
| Resend | Envoi d'emails transactionnels |

---

## 🧪 Tester en local

```bash
npm install
npm run dev
# → http://localhost:3000
```

Créez un fichier `.env` à la racine :
```
RESEND_API_KEY=re_votreclé
TEAM_EMAIL=vous@exemple.com
FROM_EMAIL=noreply@votredomaine.com
```

---

## 📄 Licence

MIT
