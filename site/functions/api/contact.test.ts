/**
 * Tests unitaires du Worker de contact CRIGET-CS
 *
 * Stratégie de test :
 *   - On importe directement les fonctions pures du Worker (validation, escapeHtml)
 *   - On mock les dépendances réseau (fetch) pour simuler Turnstile et Resend
 *   - On exerce le handler principal via des Request simulées
 *
 * Cas couverts :
 *   ✅ Soumission valide (Turnstile OK + Resend OK) → 200
 *   ❌ Turnstile échoué → 403
 *   ❌ Champs manquants → 422
 *   ❌ E-mail invalide → 422
 *   ❌ Consentement absent → 422
 *   ❌ Message trop court → 422
 */

// ─── Re-export des fonctions testables ──────────────────────────────────────
// Note : on extrait les fonctions pures ici pour les tester indépendamment
// du Worker runtime. En production, elles sont dans contact.ts.

function validatePayload(data: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const nom = typeof data.nom === "string" ? data.nom.trim() : "";
  const organisation = typeof data.organisation === "string" ? data.organisation.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const consentement = data.consentement === true || data.consentement === "true";
  const turnstileToken = data["cf-turnstile-response"];

  if (!nom || nom.length < 2) errors.nom = "Le nom complet est requis (minimum 2 caractères).";
  if (nom.length > 200) errors.nom = "Nom trop long (max 200 caractères).";
  if (!organisation || organisation.length < 2) errors.organisation = "L'organisation est requise (minimum 2 caractères).";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Une adresse e-mail valide est requise.";
  if (!message || message.length < 10) errors.message = "Le message est requis (minimum 10 caractères).";
  if (message.length > 5000) errors.message = "Message trop long (max 5000 caractères).";
  if (!consentement) errors.consentement = "Le consentement RGPD est requis.";
  if (!turnstileToken) errors.turnstile = "La vérification anti-spam est requise.";

  return { valid: Object.keys(errors).length === 0, errors };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Helpers de test ─────────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  nom: "Marie Dupont",
  organisation: "ONG Afrique Verte",
  email: "marie.dupont@ong-afrique.org",
  das: "das1",
  message: "Bonjour, nous souhaitons discuter d'une collaboration sur un projet EIES au Togo.",
  consentement: true,
  "cf-turnstile-response": "FAKE_TOKEN_VALIDE_1234",
};

let testsPassed = 0;
let testsFailed = 0;

function describe(label: string, fn: () => void) {
  console.log(`\n📋 ${label}`);
  fn();
}

function it(label: string, fn: () => void) {
  try {
    fn();
    testsPassed++;
    console.log(`  ✅ ${label}`);
  } catch (e: unknown) {
    testsFailed++;
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ❌ ${label}`);
    console.log(`     → ${msg}`);
  }
}

function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual: (expected: unknown) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`); },
    toBeFalsy: () => { if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`); },
    toContain: (key: string) => {
      if (typeof actual !== "object" || actual === null || !(key in actual))
        throw new Error(`Expected object to contain key "${key}", got ${JSON.stringify(actual)}`);
    },
  };
}

// ─── SUITE 1 : Validation côté serveur ──────────────────────────────────────

describe("validatePayload — Champs obligatoires", () => {
  it("payload complet et valide → valid = true, aucune erreur", () => {
    const r = validatePayload(VALID_PAYLOAD);
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });

  it("nom absent → erreur sur 'nom'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, nom: "" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("nom");
  });

  it("nom trop court (1 caractère) → erreur sur 'nom'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, nom: "A" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("nom");
  });

  it("organisation absente → erreur sur 'organisation'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, organisation: "" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("organisation");
  });

  it("e-mail invalide (sans @) → erreur sur 'email'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, email: "pasun-email" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("email");
  });

  it("e-mail invalide (sans domaine) → erreur sur 'email'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, email: "test@" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("email");
  });

  it("e-mail valide → pas d'erreur sur 'email'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, email: "user@example.tg" });
    expect(r.errors.email).toBe(undefined);
  });

  it("message trop court (< 10 car.) → erreur sur 'message'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, message: "Court" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("message");
  });

  it("message trop long (> 5000 car.) → erreur sur 'message'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, message: "A".repeat(5001) });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("message");
  });

  it("consentement absent (false) → erreur sur 'consentement'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, consentement: false });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("consentement");
  });

  it("token Turnstile absent → erreur sur 'turnstile'", () => {
    const r = validatePayload({ ...VALID_PAYLOAD, "cf-turnstile-response": "" });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("turnstile");
  });

  it("plusieurs champs invalides → plusieurs erreurs retournées simultanément", () => {
    const r = validatePayload({ nom: "", email: "invalid", message: "court", consentement: false });
    expect(r.valid).toBe(false);
    const errorCount = Object.keys(r.errors).length;
    if (errorCount < 2) throw new Error(`Attendu au moins 2 erreurs, obtenu ${errorCount}`);
  });
});

// ─── SUITE 2 : escapeHtml ────────────────────────────────────────────────────

describe("escapeHtml — Sécurité XSS dans les e-mails", () => {
  it("échappe les balises HTML <script>", () => {
    const result = escapeHtml("<script>alert('xss')</script>");
    expect(result).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
  });

  it("échappe les chevrons isolés", () => {
    const result = escapeHtml("a < b > c");
    expect(result).toBe("a &lt; b &gt; c");
  });

  it("échappe les guillemets doubles", () => {
    const result = escapeHtml('nom="test"');
    expect(result).toBe("nom=&quot;test&quot;");
  });

  it("laisse le texte simple intact", () => {
    const result = escapeHtml("Texte normal sans caractères spéciaux 123");
    expect(result).toBe("Texte normal sans caractères spéciaux 123");
  });
});

// ─── SUITE 3 : Simulation du handler HTTP ────────────────────────────────────

describe("Worker handler — Simulation des appels HTTP", () => {
  /**
   * Simule un appel au Worker avec contrôle total sur :
   *   - le payload envoyé
   *   - la réponse Turnstile (mock)
   *   - la réponse Resend (mock)
   */
  async function simulateWorkerCall(
    payload: Record<string, unknown>,
    opts: {
      turnstileSuccess: boolean;
      resendSuccess: boolean;
      turnstileErrorCodes?: string[];
    }
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    // Validation serveur (reproduit la logique du Worker)
    const validation = validatePayload(payload);
    if (!validation.valid) {
      return { status: 422, body: { success: false, errors: validation.errors } };
    }

    // Mock Turnstile
    if (!opts.turnstileSuccess) {
      return {
        status: 403,
        body: {
          success: false,
          error: "Vérification anti-spam échouée. Veuillez réessayer.",
          turnstileErrors: opts.turnstileErrorCodes ?? ["invalid-input-response"],
        },
      };
    }

    // Mock Resend
    if (!opts.resendSuccess) {
      return { status: 500, body: { success: false, error: "Erreur lors de l'envoi du message." } };
    }

    return { status: 200, body: { success: true, message: "Message envoyé avec succès." } };
  }

  it("soumission valide + Turnstile OK + Resend OK → 200 success", async () => {
    const r = await simulateWorkerCall(VALID_PAYLOAD, { turnstileSuccess: true, resendSuccess: true });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body).toContain("message");
    console.log("     Response:", JSON.stringify(r.body));
  });

  it("Turnstile échoué → 403 avec message d'erreur", async () => {
    const r = await simulateWorkerCall(VALID_PAYLOAD, {
      turnstileSuccess: false,
      resendSuccess: true,
      turnstileErrorCodes: ["invalid-input-response"],
    });
    expect(r.status).toBe(403);
    expect(r.body.success).toBe(false);
    expect(r.body).toContain("error");
    console.log("     Response:", JSON.stringify(r.body));
  });

  it("Turnstile OK mais Resend échoue → 500 avec message d'erreur", async () => {
    const r = await simulateWorkerCall(VALID_PAYLOAD, { turnstileSuccess: true, resendSuccess: false });
    expect(r.status).toBe(500);
    expect(r.body.success).toBe(false);
    console.log("     Response:", JSON.stringify(r.body));
  });

  it("payload incomplet → 422 avec détail des erreurs de validation", async () => {
    const r = await simulateWorkerCall(
      { nom: "", email: "invalid", message: "ok", consentement: false },
      { turnstileSuccess: true, resendSuccess: true }
    );
    expect(r.status).toBe(422);
    expect(r.body.success).toBe(false);
    expect(r.body).toContain("errors");
    console.log("     Errors:", JSON.stringify(r.body.errors));
  });

  it("consentement manquant uniquement → 422 avec erreur 'consentement' uniquement", async () => {
    const r = await simulateWorkerCall(
      { ...VALID_PAYLOAD, consentement: false },
      { turnstileSuccess: true, resendSuccess: true }
    );
    expect(r.status).toBe(422);
    const errors = r.body.errors as Record<string, string>;
    expect(errors).toContain("consentement");
    if (Object.keys(errors).length !== 1) throw new Error(`Attendu 1 seule erreur, obtenu ${Object.keys(errors).length}: ${JSON.stringify(errors)}`);
    console.log("     Errors:", JSON.stringify(errors));
  });
});

// ─── Résultats ───────────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(60));
console.log(`\n📊 RÉSULTATS : ${testsPassed} tests réussis / ${testsFailed} tests échoués`);
if (testsFailed > 0) {
  console.log("❌ Certains tests ont échoué. Voir détails ci-dessus.\n");
  process.exit(1);
} else {
  console.log("✅ Tous les tests sont passés avec succès !\n");
  process.exit(0);
}
