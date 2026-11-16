/**
 * Captures the real Eloq UI (dark theme, phone viewport) for the
 * promo video, from a local dev server (npm run dev in the repo root).
 *
 *   NODE_PATH=$(npm root -g) node scripts/capture-promo.cjs              (French → public/promo)
 *   PROMO_LOCALE=es NODE_PATH=$(npm root -g) node scripts/capture-promo.cjs  (Spanish → public/promo-es)
 *
 * The microphone is Chromium's fake device, so /api/transcribe is answered
 * with a fixed speech in that language; the scores on the results page are the ones
 * the app's own analysis engine computes for that speech.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const LOCALE = process.env.PROMO_LOCALE || "fr";
const BASE = process.env.ELOQ_URL || "http://localhost:3000";

/** Per-language UI labels (from src/lib/i18n/translations.ts) and the fixed
 *  speech that stands in for the fake microphone. */
const LOCALES = {
  fr: {
    dir: "promo",
    browserLocale: "fr-FR",
    topic: "Comment l'IA transforme-t-elle la médecine ?",
    startPractice: /Commencer la pratique/,
    start: "Démarrer",
    stop: "Arrêter",
    metricsTab: "Métriques",
    labels: ["Clarté", "Confiance", "Structure", "Rythme", "Fluidité", "Maîtrise des tics de langage", "Précision du langage", "Score global"],
    transcript: "Bonjour, aujourd'hui je vais vous expliquer comment l'intelligence artificielle transforme la médecine. D'abord, elle aide les médecins à détecter certaines maladies plus tôt. Par exemple, un algorithme peut analyser des milliers de radios en quelques secondes et repérer une tumeur que l'œil humain pourrait manquer. Ensuite, elle permet de personnaliser les traitements, parce que chaque patient réagit différemment. Euh, cependant, il faut rester prudent : une machine peut se tromper, et la décision finale doit toujours revenir au médecin. Pour conclure, l'intelligence artificielle ne remplace pas le médecin, elle lui donne de meilleurs outils. C'est donc une révolution, à condition de garder l'humain au centre.",
  },
  es: {
    dir: "promo-es",
    browserLocale: "es-ES",
    topic: "Cómo la IA está cambiando la medicina",
    startPractice: /Empezar práctica/,
    start: "Empezar",
    stop: "Detener",
    metricsTab: "Métricas",
    labels: ["Claridad", "Confianza", "Estructura", "Ritmo", "Fluidez", "Control de muletillas", "Precisión del lenguaje", "Puntuación global"],
    transcript: "Buenos días, hoy voy a explicaros cómo la inteligencia artificial está cambiando la medicina. Primero, ayuda a los médicos a detectar algunas enfermedades mucho antes. Por ejemplo, un algoritmo puede analizar miles de radiografías en pocos segundos y encontrar un tumor que el ojo humano podría pasar por alto. Además, permite personalizar los tratamientos, porque cada paciente responde de forma distinta. Eh, sin embargo, hay que ser prudentes: una máquina puede equivocarse y la decisión final siempre debe ser del médico. En conclusión, la inteligencia artificial no sustituye al médico, le da mejores herramientas. Es una revolución, siempre que mantengamos a las personas en el centro.",
  },
};
const L = LOCALES[LOCALE];
const OUT = path.join(__dirname, "..", "public", L.dir);
const T = L.transcript;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: L.browserLocale, permissions: ["microphone", "camera"] });
  const page = await ctx.newPage();
  await page.route("**/api/transcribe?**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ transcript: T }) }));
  await page.route("**/va.vercel-scripts.com/**", (r) => r.abort());
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.evaluate((l) => { localStorage.setItem("eloq-locale", l); localStorage.setItem("eloq-cookie-notice-dismissed", "1"); localStorage.setItem("eloq-theme", "dark"); localStorage.removeItem("eloq-sessions"); }, LOCALE);
  const clean = () => page.addStyleTag({ content: "nextjs-portal{display:none!important} *{scrollbar-width:none}" }).catch(() => {});
  const shot = async (name) => { await clean(); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("shot", name); };
  // Whole page without the fixed header / tab bar, so the video can scroll
  // it smoothly behind the real chrome (captured once as chrome.png).
  const long = async (name) => {
    await clean();
    await scrollTo(0);
    const style = await page.addStyleTag({ content: "header.fixed, nav.fixed{display:none!important}" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await style.evaluate((el) => el.remove());
    console.log("long", name);
  };
  const scrollTo = async (y) => { await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y); await page.waitForTimeout(500); };

  // Landing
  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(3000); await shot("landing");

  // Practice setup
  await page.goto(BASE + "/practice?section=presentation", { waitUntil: "load" }); await page.waitForTimeout(2500);
  await shot("chrome");
  const inputs = page.locator("input[type=text], input:not([type])");
  await inputs.nth(0).fill(L.topic);
  await page.getByRole("button", { name: /^1\s*min/ }).click();
  const heights = {};
  const pageHeight = () => page.evaluate(() => document.documentElement.scrollHeight * 3);
  heights.setup = await pageHeight();
  await long("setup-long");
  if (LOCALE === "es") {
    // Use cases: the real mode cards, with Presentation then Pitch selected.
    const modes = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main *")].find((n) => n.children.length === 0 && n.textContent.trim() === "Pitch");
      return el.getBoundingClientRect().top + window.scrollY;
    });
    await scrollTo(modes - 520); await shot("uc-presentation");
    await page.getByRole("button", { name: /^Pitch/ }).click(); await page.waitForTimeout(500); await shot("uc-pitch");
    await page.getByRole("button", { name: /^Presentación/ }).click(); await page.waitForTimeout(300);
  }
  await scrollTo(0);
  await page.getByRole("button", { name: L.startPractice }).click();
  await page.waitForTimeout(2500); await shot("rec-idle");

  // Recording — a burst of frames so the timer really ticks in the video.
  await page.getByRole("button", { name: L.start }).click();
  const t0 = Date.now();
  const burst = [];
  await clean();
  while (Date.now() - t0 < 7000) {
    const name = `rec-${String(burst.length).padStart(2, "0")}`;
    await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 90 });
    burst.push({ file: `${name}.jpg`, t: (Date.now() - t0) / 1000 });
  }
  console.log("burst frames", burst.length);
  await page.waitForTimeout(Math.max(0, 43000 - (Date.now() - t0)));
  await shot("rec-late");
  await page.getByRole("button", { name: L.stop }).click();
  const t1 = Date.now();
  const after = [];
  while (Date.now() - t1 < 4000 && !/results/.test(page.url())) {
    const name = `ana-${String(after.length).padStart(2, "0")}`;
    await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 90 });
    after.push({ file: `${name}.jpg`, t: (Date.now() - t1) / 1000 });
  }
  await page.waitForURL(/results/, { timeout: 120000 });
  await page.waitForTimeout(4500);
  await long("results-long");
  await page.getByRole("tab", { name: L.metricsTab }).or(page.getByRole("button", { name: L.metricsTab })).first().click();
  await page.waitForTimeout(1500);
  heights.metrics = await pageHeight();
  await long("metrics-long");
  // Where each metric card sits in metrics-long.png (device pixels), so the
  // video can zoom on the real cards.
  const rects = await page.evaluate((labels) => {
    const out = {};
    for (const label of labels) {
      const el = [...document.querySelectorAll("main *")].find((n) => n.children.length === 0 && n.textContent.trim() === label);
      if (!el) continue;
      let card = el;
      while (card && !(/rounded/.test(card.className) && /border/.test(card.className))) card = card.parentElement;
      if (!card) continue;
      const r = card.getBoundingClientRect();
      out[label] = { x: r.left * 3, y: (r.top + window.scrollY) * 3, w: r.width * 3, h: r.height * 3 };
    }
    return out;
  }, L.labels);
  const chrome = await page.evaluate(() => ({
    header: document.querySelector("header.fixed").getBoundingClientRect().height * 3,
    nav: document.querySelector("nav.fixed").getBoundingClientRect().height * 3,
  }));
  fs.writeFileSync(`${OUT}/frames.json`, JSON.stringify({ recording: burst, analysing: after, rects, chrome, heights }, null, 2));

  if (LOCALE === "fr") {
    // Exam mode — one capture per exam; picking an exam for the first time
    // opens its real "how it works" sheet, captured too.
    await page.goto(BASE + "/exam", { waitUntil: "load" }); await page.waitForTimeout(2500);
    const closeInfo = async (name) => {
      const dialog = page.locator("div.fixed.inset-0.z-50");
      if (await dialog.count()) { await shot(name + "-info"); await dialog.locator("button").first().click(); await page.waitForTimeout(500); }
    };
    await closeInfo("exam-brevet");
    await shot("exam-brevet");
    for (const [label, name] of [["Oral du Bac de Français", "exam-bac"], ["Grand Oral", "exam-grand-oral"]]) {
      await page.locator("div.grid.grid-cols-3 > div > button:first-child").filter({ hasText: label }).click();
      await page.waitForTimeout(700);
      await closeInfo(name);
      await shot(name);
    }
    await long("exam-long");
  } else {
    // Interview mode and the daily challenges hub.
    await page.goto(BASE + "/interview", { waitUntil: "load" }); await page.waitForTimeout(2500); await shot("interview");
    await page.goto(BASE + "/challenges", { waitUntil: "load" }); await page.waitForTimeout(2500);
    heights.challenges = await pageHeight();
    await long("challenges-long");
    fs.writeFileSync(`${OUT}/frames.json`, JSON.stringify({ recording: burst, analysing: after, rects, chrome, heights }, null, 2));
  }
  await browser.close();
})();
