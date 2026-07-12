# perfil-jonathan

Currículum en línea, bilingüe (ES/EN), de **Jonathan Mora Esquivel** —
publicado en **https://perfil-jonathan.morochoa.com**.

Sitio estático generado desde una única fuente de datos, servido por nginx en un
contenedor Docker, desplegado en el TrueNAS vía **Dockge + Watchtower** y expuesto
por el **túnel de Cloudflare** (`*.morochoa.com`).

## Arquitectura

```
data/cv.json        ← ÚNICA fuente de verdad (bilingüe)
src/template.mjs    ← genera el HTML de cada idioma (+ SEO, JSON-LD, hreflang)
src/styles.css      ← estilos (se inyectan inline en cada página)
src/app.js          ← mejora progresiva: tema claro/oscuro + imprimir
build.mjs           ← genera dist/
   └── dist/
       ├── index.html      (español, /)
       ├── en/index.html   (inglés, /en/)
       ├── cv.json         (JSON Resume — legible por máquinas / MCP)
       ├── sitemap.xml     (con alternates hreflang)
       ├── robots.txt
       ├── favicon.svg
       └── og.svg          (tarjeta social)
```

El contenido se **renderiza en el servidor** (no depende de JavaScript), por lo que
Google y cualquier fetcher/MCP leen el CV completo. Cada página incluye datos
estructurados **schema.org `Person`** (JSON-LD) y hay un endpoint
**`/cv.json`** en el estándar **[JSON Resume](https://jsonresume.org)** con CORS abierto.

## Multilingüe + SEO

- `/` español, `/en/` inglés; el botón de idioma es un enlace real (indexable).
- `hreflang` (`es`, `en`, `x-default`) + `canonical` en cada página y en el sitemap.
- `<title>`, `description`, Open Graph y Twitter Card por idioma.
- Objetivo: encontrar el sitio al buscar **"Jonathan Mora Esquivel"** en Google.

## Editar el CV

Editar **`data/cv.json`** y hacer merge a `main`. El workflow reconstruye la imagen
y Watchtower recrea el contenedor (~5 min). Para ver el resultado localmente:

```bash
npm run build       # genera dist/
npm run preview     # build + servidor local
```

## Despliegue

- **CI:** `.github/workflows/build.yml` construye y publica
  `ghcr.io/jonamora91/perfil-jonathan:latest` al pushear a `main`.
- **NAS (Dockge):** stack `perfil-jonathan`, nginx en el puerto **8100**, con la label
  `com.centurylinklabs.watchtower.enable=true` para autodespliegue.
- **Cloudflare:** `perfil-jonathan.morochoa.com` → túnel → `http://192.168.0.3:8100`.

## Licencia

MIT (código). El contenido del currículum es propiedad de Jonathan Mora Esquivel.
