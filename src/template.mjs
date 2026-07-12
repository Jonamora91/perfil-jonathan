// Renders a full, self-contained HTML page for one language.
// Content is server-rendered so crawlers and MCP fetchers read it without JS.

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
const L = (obj, lang) => (obj && typeof obj === "object" && !Array.isArray(obj) ? obj[lang] : obj);

function chips(arr) {
  return '<ul class="chips">' + arr.map(x => '<li class="chip">' + esc(x) + "</li>").join("") + "</ul>";
}

function roleHtml(role) {
  const parts = String(role).split(" · ");
  if (parts.length === 1) return esc(role);
  return "<b>" + esc(parts[0]) + "</b> · " + parts.slice(1).map(esc).join(" · ");
}

const UI = {
  es: {
    eyebrow: "Currículum", print: "Imprimir · PDF", present: "Actualidad",
    s_contact: "Contacto", s_lang: "Idiomas", s_strength: "Aptitudes", s_stack: "Stack técnico",
    s_profile: "Perfil", s_exp: "Experiencia", s_proj: "Proyectos destacados", s_edu: "Formación",
    langLabel: '<b>ES</b><span class="sep"> / </span>EN',
    footer: "Currículum · Actualizado 2026 · Sitio propio", data: "Datos (JSON)"
  },
  en: {
    eyebrow: "Résumé", print: "Print · PDF", present: "Present",
    s_contact: "Contact", s_lang: "Languages", s_strength: "Strengths", s_stack: "Tech stack",
    s_profile: "Profile", s_exp: "Experience", s_proj: "Selected projects", s_edu: "Education",
    langLabel: 'ES<span class="sep"> / </span><b>EN</b>',
    footer: "Résumé · Updated 2026 · My own site", data: "Data (JSON)"
  }
};

function jsonLd(data, lang, origin) {
  const b = data.basics;
  const url = origin + (lang === "es" ? "/" : "/en/");
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: b.name,
    jobTitle: L(b.shortRole, lang),
    description: L(b.summary, lang),
    url,
    image: origin + "/og.svg",
    email: "mailto:" + b.email,
    telephone: b.phone.replace(/\s/g, ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Pedro, San José",
      addressCountry: "CR"
    },
    sameAs: b.profiles.map(p => p.url),
    knowsLanguage: data.languages.map(l => ({ "@type": "Language", name: L(l.name, "en") })),
    worksFor: { "@type": "Organization", name: "Moody's" },
    alumniOf: data.education.map(e => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: data.stack.flatMap(g => g.items),
    hasOccupation: { "@type": "Occupation", name: L(b.shortRole, lang) }
  };
  return JSON.stringify(person);
}

export function renderPage({ lang, data, css, js, origin }) {
  const t = UI[lang];
  const b = data.basics;
  const isEs = lang === "es";
  const selfUrl = origin + (isEs ? "/" : "/en/");
  const otherPath = isEs ? "/en/" : "/";
  const otherLabel = UI[isEs ? "en" : "es"].langLabel;

  const iconMail = '<svg class="ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const iconPhone = '<svg class="ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 2 6a2 2 0 0 1 2-2Z"/></svg>';
  const iconPin = '<svg class="ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  const iconGit = '<svg class="ico" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>';

  const langHtml = data.languages.map(l =>
    '<div class="langrow"><div class="lr-top"><b>' + esc(L(l.name, lang)) + "</b><em>" + esc(L(l.level, lang)) +
    '</em></div><div class="track"><i style="width:' + l.pct + '%"></i></div></div>'
  ).join("");

  const strengthHtml = '<ul class="pills">' + data.strengths[lang].map(s => '<li class="pill">' + esc(s) + "</li>").join("") + "</ul>";

  const stackHtml = data.stack.map(g =>
    '<div class="stackgroup"><div class="gl">' + esc(L(g.group, lang)) + "</div>" + chips(g.items) + "</div>"
  ).join("");

  const jobsHtml = data.work.map(j => {
    const duties = '<ul class="duties">' + j.highlights[lang].map(d => "<li>" + esc(d) + "</li>").join("") + "</ul>";
    const when = esc(L(j.when, lang));
    const whenCell = j.end === null ? '<span class="now">' + when + "</span>" : when;
    return '<article class="job"><div class="when">' + whenCell + '</div><div class="body"><h3>' +
      esc(L(j.position, lang)) + '</h3><div class="co">' + esc(j.company) + "</div>" + duties + "</div></article>";
  }).join("");

  const projHtml = data.projects.map(p => {
    const per = p.ongoing ? esc(p.period) + " — " + t.present : esc(p.period);
    return '<article class="proj"><div class="ptop"><h3>' + esc(L(p.name, lang)) + '</h3><span class="per">' +
      per + '</span></div><p>' + esc(L(p.description, lang)) + "</p>" + chips(p.tags) + "</article>";
  }).join("");

  const eduHtml = data.education.map(e =>
    '<div class="item"><div class="yr">' + esc(e.year) + '</div><div><h3>' + esc(L(e.studyType, lang)) +
    '</h3><div class="inst">' + esc(L(e.area, lang)) + "</div></div></div>"
  ).join("");

  const metaHtml =
    '<span class="meta"><span class="dot"></span>' + esc(L(b.highlights.exp, lang)) + "</span>" +
    '<span class="meta"><span class="dot gold"></span>' + esc(L(b.highlights.focus, lang)) + "</span>" +
    '<span class="meta"><span class="dot"></span>' + esc(L(b.highlights.edu, lang)) + "</span>";

  const title = b.name + (isEs
    ? " — Desarrollador de Software | Identidad & Acceso"
    : " — Software Developer | Identity & Access");
  const desc = L(b.metaDescription, lang);

  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>" + esc(title) + "</title>",
    '<meta name="description" content="' + esc(desc) + '">',
    '<meta name="author" content="' + esc(b.name) + '">',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="' + selfUrl + '">',
    '<link rel="alternate" hreflang="es" href="' + origin + '/">',
    '<link rel="alternate" hreflang="en" href="' + origin + '/en/">',
    '<link rel="alternate" hreflang="x-default" href="' + origin + '/">',
    '<link rel="alternate" type="application/json" href="' + origin + '/cv.json" title="Machine-readable resume (JSON Resume)">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<meta name="theme-color" content="#0C6E63" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0E1A18" media="(prefers-color-scheme: dark)">',
    // Open Graph
    '<meta property="og:type" content="profile">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(desc) + '">',
    '<meta property="og:url" content="' + selfUrl + '">',
    '<meta property="og:image" content="' + origin + '/og.svg">',
    '<meta property="og:locale" content="' + (isEs ? "es_CR" : "en_US") + '">',
    '<meta property="og:locale:alternate" content="' + (isEs ? "en_US" : "es_CR") + '">',
    '<meta property="profile:first_name" content="Jonathan">',
    '<meta property="profile:last_name" content="Mora Esquivel">',
    // Twitter
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(title) + '">',
    '<meta name="twitter:description" content="' + esc(desc) + '">',
    '<meta name="twitter:image" content="' + origin + '/og.svg">',
    '<script type="application/ld+json">' + jsonLd(data, lang, origin) + "</script>",
    "<style>" + css + "</style>"
  ].join("\n  ");

  const themeInit =
    '<script>(function(){try{var d=localStorage.getItem("cv-theme");' +
    'if(d?d==="dark":(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches))' +
    'document.getElementById("app").classList.add("dark");}catch(e){}})();<\/script>';

  const body = `<div class="cv" id="app">
  ${themeInit}
  <header class="topbar no-print">
    <div class="wrap">
      <div class="brand">
        <div class="mono-mark">${esc(b.initials)}</div>
        <div class="who">
          <b>${esc(b.name)}</b>
          <span>${esc(L(b.shortRole, lang))}</span>
        </div>
      </div>
      <div class="controls">
        <a class="btn lang" href="${otherPath}" hreflang="${isEs ? "en" : "es"}" aria-label="${isEs ? "Switch to English" : "Cambiar a español"}">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>
          <span>${otherLabel}</span>
        </a>
        <button class="btn" id="themeBtn" type="button" aria-label="Theme">
          <svg class="ico" id="themeIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
        <button class="btn" id="printBtn" type="button">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg>
          <span>${esc(t.print)}</span>
        </button>
      </div>
    </div>
  </header>

  <div class="wrap">
    <section class="hero">
      <span class="eyebrow">${esc(t.eyebrow)}</span>
      <h1>Jonathan Mora<br>Esquivel</h1>
      <p class="role">${roleHtml(L(b.role, lang))}</p>
      <div class="metas">${metaHtml}</div>
    </section>

    <div class="grid">
      <aside>
        <div class="card"><div class="label">${esc(t.s_contact)}</div>
          <div class="contact">
            <a href="mailto:${esc(b.email)}">${iconMail}<span>${esc(b.email)}</span></a>
            <a href="tel:${esc(b.phone.replace(/\s/g, ""))}">${iconPhone}<span>${esc(b.phone)}</span></a>
            <a href="${esc(b.profiles[0].url)}" target="_blank" rel="noopener">${iconGit}<span>github.com/Jonamora91</span></a>
            <div class="row">${iconPin}<span>${esc(b.location)}</span></div>
          </div>
        </div>
        <div class="card"><div class="label">${esc(t.s_lang)}</div><div class="langbar">${langHtml}</div></div>
        <div class="card"><div class="label">${esc(t.s_strength)}</div>${strengthHtml}</div>
        <div class="card"><div class="label">${esc(t.s_stack)}</div>${stackHtml}</div>
      </aside>

      <main>
        <section id="profile"><div class="sec-head"><span class="n">01</span><h2>${esc(t.s_profile)}</h2><span class="rule"></span></div>
          <p class="lead">${esc(L(b.summary, lang))}</p></section>

        <section id="experience"><div class="sec-head"><span class="n">02</span><h2>${esc(t.s_exp)}</h2><span class="rule"></span></div>
          <div class="timeline">${jobsHtml}</div></section>

        <section id="projects"><div class="sec-head"><span class="n">03</span><h2>${esc(t.s_proj)}</h2><span class="rule"></span></div>
          <div class="projects">${projHtml}</div></section>

        <section id="education"><div class="sec-head"><span class="n">04</span><h2>${esc(t.s_edu)}</h2><span class="rule"></span></div>
          <div class="card edu">${eduHtml}</div></section>
      </main>
    </div>
  </div>

  <footer class="no-print"><div class="wrap">
    <span class="fnote">${esc(b.name)}</span>
    <a class="fnote" href="${origin}/cv.json">${esc(t.data)}</a>
    <span class="fnote">${esc(t.footer)}</span>
  </div></footer>
</div>
<script>${js}</script>`;

  return "<!doctype html>\n<html lang=\"" + lang + "\">\n<head>\n  " + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n";
}
