# Data Itinerante

Sitio web de Data Itinerante Argentina convertido a una SPA servida por un Worker de Cloudflare.

## Estructura

- `public/`: assets frontend (HTML, CSS, JS e imágenes)
- `src/worker.js`: Worker que sirve los assets y hace fallback a la SPA
- `wrangler.json`: configuración de Cloudflare Workers
- `package.json`: scripts de desarrollo y despliegue

## Desarrollo local

```bash
npm install
npm run dev
```

La app quedará disponible en:

- http://localhost:8787

## Despliegue

```bash
npm run deploy
```

## Nota

La app sigue siendo una SPA del tipo single-page application y al mismo tiempo es compatible con el hosting de Cloudflare Workers sin requerir un backend tradicional.
