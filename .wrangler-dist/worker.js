// src/worker.js
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        ok: true,
        app: "data-itinerante",
        message: "API mock disponible en el Worker de Cloudflare",
        path: url.pathname
      });
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }
    const fallbackUrl = new URL("/", request.url);
    const fallbackResponse = await env.ASSETS.fetch(
      new Request(fallbackUrl, request)
    );
    return new Response(fallbackResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
