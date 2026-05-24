# ✦ CardVerify

> Système de validation de cartes cadeaux — Frontend glassmorphism premium + API serverless Vercel + emails automatiques via Resend.

---

## ⚡ Déploiement en 3 étapes

### 1 — Configurer Resend

1. Créer un compte sur **[resend.com](https://resend.com)** (gratuit, 3000 emails/mois)
2. `API Keys` → créer une clé → copier `re_xxxxxxxx`
3. `Domains` → ajouter votre domaine → configurer les DNS (TXT + MX)
4. Attendre la vérification (2–10 min)

> ⚠️ Le `FROM_EMAIL` doit être sur votre domaine Resend vérifié.

---

### 2 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — CardVerify"
git remote add origin https://github.com/vous/cardverify.git
git push -u origin main
```

---

### 3 — Déployer sur Vercel

1. [vercel.com/new](https://vercel.com/new) → importer le repo
2. **Avant de cliquer Deploy**, ajouter les variables :

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | `re_votre_clé` |
| `TEAM_EMAIL` | `giftcardverifyteam@gmail.com` |
| `FROM_EMAIL` | `noreply@votredomaine.com` |

3. **Deploy** → votre site est en ligne ✅

---

## 🗂 Structure

```
cardverify/
├── index.html          ← Frontend 3 étapes (glassmorphism)
├── api/
│   └── send.js         ← POST /api/send (validation + 2 emails)
├── vercel.json         ← Routing + headers sécurité
├── package.json        ← Dépendance : resend@3.0.0
├── .env.example        ← Template variables
└── .gitignore
```

---

## 🃏 Cartes supportées

Amazon · iTunes · Neosurf · PCS · Paysafecard · Steam · Transcash · Vanilla

---

## 🧪 Test local

```bash
npm install
cp .env.example .env   # remplir avec vos vraies valeurs
npm run dev            # → http://localhost:3000
```

---

## 📄 Licence

MIT
