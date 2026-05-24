// OYA Portraits — IUCN Red List v4 API proxy (Cloudflare Pages Function)
// Direct rewrite of netlify/functions/iucn-proxy.js
//
// URL:    /api/iucn-proxy?endpoint=<taxa/...>
// Auth:   Bearer token from env.IUCN_TOKEN (set in CF Pages dashboard, NOT a GitHub secret)
// Policy: only paths starting with "taxa/" are forwarded (unchanged from Netlify version)
//
// Behaviour parity with the Netlify original:
//   - same query param name (endpoint)
//   - same error messages and status codes
//   - same allow-listed prefix (taxa/)
//   - same CORS "*"
//   - same Bearer auth scheme
//
// DELIBERATE BEHAVIOUR CHANGE:
//   The Netlify function set no cache headers, so every request hit IUCN.
//   This version sets Cache-Control: public, max-age=3600 (browser) and uses
//   the Cloudflare edge cache for 24h. IUCN taxon data changes infrequently.
//   If you need 1:1 behaviour, delete the two cache-related lines marked below.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint') || '';
  const token = env.IUCN_TOKEN;

  if (!token) {
    return json({ error: 'IUCN token not configured on server' }, 500);
  }
  if (!endpoint) {
    return json({ error: 'No API endpoint specified' }, 400);
  }
  if (!endpoint.startsWith('taxa/')) {
    return json({ error: 'Endpoint not permitted' }, 403);
  }

  const upstream = `https://api.iucnredlist.org/api/v4/${endpoint}`;

  try {
    const r = await fetch(upstream, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cf: { cacheTtl: 86400, cacheEverything: true },   // <-- delete for 1:1 parity
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',         // <-- delete for 1:1 parity
      },
    });
  } catch (err) {
    return json({ error: err.message || 'Proxy fetch failed' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
