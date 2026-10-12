export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.API_ORIGIN);
  const upstream = new Request(target, request);
  upstream.headers.set("X-Forwarded-Host", url.host);
  return fetch(upstream);
}