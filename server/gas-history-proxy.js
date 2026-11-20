const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxtowV3aBpyIaZb7j6MbVtD-d-7TC0gKCrfz6Le1GSAkP9WRQOEH-0x1UrK_1Ii2Zu1VQ/exec';
const MAX_PROXY_BODY_BYTES = 4 * 1024 * 1024;

async function readRequestBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  let byteCount = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteCount += buffer.length;
    if (byteCount > MAX_PROXY_BODY_BYTES) throw new Error('Proxy body exceeds the 4 MB server relay limit.');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function handleGasHistoryProxy(req, res) {
  const method = String(req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  try {
    const options = { method, redirect: 'follow', cache: 'no-store' };
    if (method === 'POST') {
      const body = await readRequestBody(req);
      if (!body) throw new Error('The HistoryLog request body is empty.');
      if (Buffer.byteLength(body, 'utf8') > MAX_PROXY_BODY_BYTES) throw new Error('Proxy body exceeds the 4 MB server relay limit.');
      options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      options.body = body;
    }
    const upstream = await fetch(GAS_WEB_APP_URL, options);
    const responseBody = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(responseBody);
  } catch (error) {
    console.error('GAS history proxy failed:', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(JSON.stringify({ success: false, error: error?.message || 'Could not reach GAS.' }));
  }
}

export { MAX_PROXY_BODY_BYTES };
