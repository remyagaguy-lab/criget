/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Responsabilités (section 9 & 12 du cahier des charges) :
 *   1. Valider les champs côté serveur (jamais faire confiance au client)
 *   2. Vérifier le token Cloudflare Turnstile via l'API officielle
 *   3. Transmettre le message via Resend (service e-mail transactionnel)
 *   4. Ne stocker aucune donnée sensible côté client
 *   5. Toutes les clés API sont dans des variables d'environnement (jamais en dur)
 *
 * Variables d'environnement requises (à configurer dans Cloudflare Pages Settings) :
 *   - TURNSTILE_SECRET_KEY : clé secrète Cloudflare Turnstile
 *   - RESEND_API_KEY        : clé API Resend (https://resend.com)
 *   - CONTACT_EMAIL_TO     : adresse e-mail de destination (ex: contact@criget-cs.com)
 *   - CONTACT_EMAIL_FROM   : adresse expéditeur autorisée dans Resend (ex: noreply@criget-cs.com)
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL_TO: string;
  CONTACT_EMAIL_FROM: string;
}

interface ContactFormData {
  nom: string;
  organisation: string;
  email: string;
  das?: string;
  message: string;
  consentement: boolean;
  "cf-turnstile-response": string;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ─── Validation côté serveur ──────────────────────────────────────────────────

function validatePayload(data: Partial<ContactFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.nom?.trim() || data.nom.trim().length < 2) {
    errors.nom = "Le nom complet est requis (minimum 2 caractères).";
  }
  if (!data.organisation?.trim() || data.organisation.trim().length < 2) {
    errors.organisation = "L'organisation est requise (minimum 2 caractères).";
  }
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Une adresse e-mail valide est requise.";
  }
  if (!data.message?.trim() || data.message.trim().length < 10) {
    errors.message = "Le message est requis (minimum 10 caractères).";
  }
  if (!data.consentement) {
    errors.consentement = "Le consentement RGPD est requis.";
  }
  if (!data["cf-turnstile-response"]) {
    errors.turnstile = "La vérification anti-spam est requise.";
  }

  // Sanitisation : limites de taille pour éviter l'abus
  if (data.nom && data.nom.length > 200) errors.nom = "Nom trop long (max 200 caractères).";
  if (data.message && data.message.length > 5000) errors.message = "Message trop long (max 5000 caractères).";

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Vérification Turnstile ───────────────────────────────────────────────────

async function verifyTurnstile(
  token: string,
  secretKey: string,
  clientIp: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  formData.append("remoteip", clientIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    return { success: false, errorCodes: ["network-error"] };
  }

  const result = await response.json<{ success: boolean; "error-codes"?: string[] }>();
  return { success: result.success, errorCodes: result["error-codes"] };
}

// ─── Envoi e-mail via Resend ──────────────────────────────────────────────────

const DAS_LABELS: Record<string, string> = {
  das1: "DAS 1 — Ingénierie-Conseil en Environnement et Territoire",
  das2: "DAS 2 — Géomatique & Intelligence Territoriale",
  das3: "DAS 3 — Recherche & Développement Appliqué",
  das4: "DAS 4 — Formation & Transfert de Connaissances",
  autre: "Autre / Non précisé",
};

async function sendEmail(
  data: ContactFormData,
  apiKey: string,
  emailTo: string,
  emailFrom: string
): Promise<{ success: boolean; error?: string }> {
  const dasLabel = data.das ? (DAS_LABELS[data.das] ?? data.das) : "Non précisé";

  const htmlBody = `
    <h2 style="color:#0b5345">Nouveau message de contact — CRIGET-CS</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:35%">Nom</td><td style="padding:8px">${escapeHtml(data.nom)}</td></tr>
      <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Organisation</td><td style="padding:8px">${escapeHtml(data.organisation)}</td></tr>
      <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">E-mail</td><td style="padding:8px"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
      <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Domaine</td><td style="padding:8px">${escapeHtml(dasLabel)}</td></tr>
    </table>
    <h3 style="color:#0b5345;margin-top:24px">Message</h3>
    <div style="background:#f9fafb;border-left:4px solid #4cb944;padding:16px;white-space:pre-wrap">${escapeHtml(data.message)}</div>
    <hr style="margin-top:32px;border-color:#e5e7eb"/>
    <p style="color:#9ca3af;font-size:12px">Message envoyé depuis le formulaire de contact du site CRIGET-CS. Consentement RGPD accordé par l'expéditeur.</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [emailTo],
      reply_to: data.email,
      subject: `[CRIGET-CS] Nouveau contact de ${data.nom} — ${dasLabel}`,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error };
  }

  return { success: true };
}

// Éviter XSS dans le corps HTML de l'e-mail
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Handler principal ────────────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // CORS : uniquement les requêtes de notre propre domaine
  const origin = request.headers.get("Origin") ?? "";
  const allowedOrigins = ["https://criget-cs.com", "https://www.criget-cs.com"];
  const isAllowedOrigin = allowedOrigins.some(o => origin.startsWith(o));

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // En dev local, on accepte toutes origines
  if (isAllowedOrigin || origin.startsWith("http://localhost")) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  // ── Pré-flight OPTIONS ──
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ── Parse du body ──
  let body: Partial<ContactFormData>;
  try {
    body = await request.json<Partial<ContactFormData>>();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Corps de requête invalide (JSON attendu)." }),
      { status: 400, headers: corsHeaders }
    );
  }

  // ── Validation serveur ──
  const validation = validatePayload(body);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ success: false, errors: validation.errors }),
      { status: 422, headers: corsHeaders }
    );
  }

  // ── Vérification Turnstile ──
  const clientIp = request.headers.get("CF-Connecting-IP") ?? "";
  const turnstileResult = await verifyTurnstile(
    body["cf-turnstile-response"]!,
    env.TURNSTILE_SECRET_KEY,
    clientIp
  );

  if (!turnstileResult.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Vérification anti-spam échouée. Veuillez réessayer.",
        turnstileErrors: turnstileResult.errorCodes,
      }),
      { status: 403, headers: corsHeaders }
    );
  }

  // ── Envoi e-mail ──
  const emailResult = await sendEmail(
    body as ContactFormData,
    env.RESEND_API_KEY,
    env.CONTACT_EMAIL_TO,
    env.CONTACT_EMAIL_FROM
  );

  if (!emailResult.success) {
    console.error("Resend error:", emailResult.error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur lors de l'envoi du message. Veuillez réessayer plus tard.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Message envoyé avec succès." }),
    { status: 200, headers: corsHeaders }
  );
};

// Bloc OPTIONS pour les pré-flight CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
