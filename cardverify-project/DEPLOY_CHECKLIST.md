# ✦ CardVerify — Checklist de déploiement

Cochez chaque étape avant de considérer le déploiement terminé.

---

## 🔑 Resend

- [ ] Compte Resend créé sur resend.com
- [ ] Clé API générée (`re_xxxxxxxxx`) — **ne jamais la committer dans Git**
- [ ] Domaine ajouté dans Resend → Domains
- [ ] Enregistrement DNS **TXT** ajouté chez votre registrar
- [ ] Enregistrement DNS **MX** ajouté (si requis)
- [ ] Statut domaine Resend → **Verified** ✅
- [ ] FROM_EMAIL correspond bien à ce domaine vérifié

---

## 📁 Fichiers

- [ ] `index.html` présent à la racine
- [ ] `api/send.js` présent dans le dossier `api/`
- [ ] `vercel.json` présent à la racine
- [ ] `package.json` avec `"resend": "3.0.0"` dans dependencies
- [ ] `.gitignore` inclut `.env` et `node_modules/`
- [ ] `.env` **absent** du repo (remplacé par les variables Vercel)

---

## 🐙 GitHub

- [ ] Repo GitHub créé (public ou privé)
- [ ] `git init` effectué
- [ ] Premier commit poussé sur `main`
- [ ] Aucune clé API dans les fichiers commités

---

## ▲ Vercel

- [ ] Projet importé depuis GitHub sur vercel.com/new
- [ ] Variable `RESEND_API_KEY` ajoutée (Settings → Env Vars)
- [ ] Variable `TEAM_EMAIL` ajoutée → `giftcardverifyteam@gmail.com`
- [ ] Variable `FROM_EMAIL` ajoutée → votre domaine vérifié
- [ ] Build réussi (aucune erreur dans les logs)
- [ ] URL de production accessible

---

## 🧪 Tests fonctionnels

- [ ] Formulaire s'affiche correctement sur desktop
- [ ] Formulaire s'affiche correctement sur mobile
- [ ] Sélection d'un type de carte fonctionne
- [ ] Toggle 🙈/👁 sur le champ code fonctionne
- [ ] Validation frontend : erreur si code trop court
- [ ] Validation frontend : erreur si email invalide
- [ ] Soumission complète → success screen s'affiche
- [ ] **Email équipe reçu** sur `giftcardverifyteam@gmail.com`
  - [ ] Code EN CLAIR visible dans le tableau
  - [ ] Type de carte, montant, email utilisateur présents
- [ ] **Email confirmation reçu** sur l'adresse de test
  - [ ] Design correct (fond sombre, violet)
  - [ ] Récapitulatif correct

---

## 🔒 Sécurité (production)

- [ ] `ALLOWED_ORIGIN` défini sur votre domaine exact (ex: `https://cardverify.vercel.app`)
- [ ] Aucune clé API dans le code source
- [ ] HTTPS actif (automatique sur Vercel)

---

✅ **Toutes les cases cochées = site prêt pour la production**
