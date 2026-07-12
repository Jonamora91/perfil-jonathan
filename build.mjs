// Static site generator for perfil-jonathan.morochoa.com
// Reads data/cv.json (single bilingual source) and emits dist/:
//   /index.html (es), /en/index.html (en), /cv.json (JSON Resume),
//   /sitemap.xml, /robots.txt, /favicon.svg, /og.svg
// No runtime dependencies; runs on plain Node >= 18.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderPage } from "./src/template.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORIGIN = (process.env.SITE_ORIGIN || "https://perfil-jonathan.morochoa.com").replace(/\/$/, "");

const data = JSON.parse(readFileSync(join(__dirname, "data/cv.json"), "utf8"));
const css = readFileSync(join(__dirname, "src/styles.css"), "utf8");
const js = readFileSync(join(__dirname, "src/app.js"), "utf8");

const dist = join(__dirname, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "en"), { recursive: true });

const write = (rel, content) => {
  const p = join(dist, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  console.log("  wrote", rel, "(" + Buffer.byteLength(content) + " bytes)");
};

// ---- HTML pages ----
write("index.html", renderPage({ lang: "es", data, css, js, origin: ORIGIN }));
write("en/index.html", renderPage({ lang: "en", data, css, js, origin: ORIGIN }));

// ---- Machine-readable resume (JSON Resume schema, https://jsonresume.org) ----
const b = data.basics;
const toDate = (ym) => (ym ? ym + "-01" : undefined);
const resume = {
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: b.name,
    label: b.shortRole.en,
    image: ORIGIN + "/og.svg",
    email: b.email,
    phone: b.phone,
    url: ORIGIN + "/en/",
    summary: b.summary.en,
    location: { city: "San Pedro, San José", countryCode: "CR", region: b.region },
    profiles: b.profiles.map((p) => ({
      network: p.network,
      username: p.url.split("/").filter(Boolean).pop(),
      url: p.url
    }))
  },
  work: data.work.map((w) => ({
    name: w.companyName,
    position: w.position.en,
    startDate: toDate(w.start),
    endDate: toDate(w.end),
    highlights: w.highlights.en
  })),
  education: data.education.map((e) => ({
    institution: e.institution,
    studyType: e.studyType.en,
    endDate: e.year
  })),
  skills: data.stack.map((g) => ({ name: g.group.en, keywords: g.items })),
  languages: data.languages.map((l) => ({ language: l.name.en, fluency: l.level.en })),
  projects: data.projects.map((p) => ({
    name: p.name.en,
    description: p.description.en,
    keywords: p.tags,
    endDate: p.ongoing ? undefined : (p.period.split("—").pop().trim())
  })),
  meta: {
    canonical: ORIGIN + "/cv.json",
    version: "1.0.0",
    language: "en",
    availableLanguages: ["en", "es"],
    site: { es: ORIGIN + "/", en: ORIGIN + "/en/" }
  }
};
write("cv.json", JSON.stringify(resume, null, 2));

// ---- robots.txt ----
write("robots.txt", `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

// ---- sitemap.xml with hreflang alternates ----
const urlEntry = (path) => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${ORIGIN}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>
  </url>`;
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntry("/")}
${urlEntry("/en/")}
</urlset>
`);

// ---- favicon.svg (JM monogram) ----
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0C6E63"/>
  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" fill="#ffffff">JM</text>
</svg>
`);

// ---- og.svg (1200x630 social card) ----
const skills = ["Okta", "Microsoft Entra", "Auth0", "SCIM", ".NET Core", "AWS"];
const chips = skills.map((s, i) => {
  const x = 80 + (i % 3) * 350;
  const y = 470 + Math.floor(i / 3) * 66;
  return `<g><rect x="${x}" y="${y}" width="320" height="48" rx="10" fill="#16302B" stroke="#0C6E63"/>` +
    `<text x="${x + 24}" y="${y + 31}" font-family="'Cascadia Code',Consolas,monospace" font-size="22" fill="#66C7B3">${s}</text></g>`;
}).join("");
write("og.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0E1A18"/>
  <rect x="0" y="0" width="1200" height="8" fill="#B0771A"/>
  <rect x="80" y="70" width="96" height="96" rx="22" fill="#0C6E63"/>
  <text x="128" y="132" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#fff">JM</text>
  <text x="80" y="270" font-family="Georgia,serif" font-size="82" font-weight="700" fill="#E7ECEA">Jonathan Mora Esquivel</text>
  <text x="82" y="330" font-family="'Cascadia Code',Consolas,monospace" font-size="30" fill="#66C7B3">Software Developer · Identity &amp; Access · .NET + AWS · AI</text>
  <text x="82" y="392" font-family="system-ui,sans-serif" font-size="26" fill="#9CABA6">12+ years building enterprise systems · San José, Costa Rica</text>
  ${chips}
</svg>
`);

console.log("\nBuild complete →", dist, "| origin:", ORIGIN);
