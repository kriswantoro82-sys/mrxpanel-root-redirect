const SUPABASE_URL = 'https://thymtqaxleqckzgmltwz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GIbV83R1SOGqp0bIe-LcmQ_9A4_i9TU';
const LICENSE_RPC = `${SUPABASE_URL}/rest/v1/rpc/mrxpanel_mrsfia_frontdoor_license_status_v1`;
const LANDING_ORIGIN = 'https://mrsfia-child-panel.vercel.app';
const MEMBER_ORIGIN = 'https://mrsfia-member-area.vercel.app';
const ACTIVE_STATES = new Set(['ACTIVE', 'GRACE']);
const AUTH_STORAGE_PREFIX = 'sb-thymtqaxleqckzgmltwz-auth-token';

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function requestHost(req) {
  const raw = first(req.headers['x-forwarded-host']) || first(req.headers.host) || '';
  return String(raw).toLowerCase().split(':')[0];
}

function isMemberRequest(req) {
  const host = requestHost(req);
  if (host === 'member.mrsfiadigital.com') return true;
  const previewTarget = String(first(req.query.__mrsfia_target) || '').toLowerCase();
  return host.endsWith('.vercel.app') && previewTarget === 'member';
}

function originalPathAndQuery(req) {
  const rawPath = String(first(req.query.path) || '').replace(/^\/+/, '');
  const pathname = `/${rawPath}`;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'path' || key === '__mrsfia_target') continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else if (value != null) {
      params.append(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

async function readLicense() {
  const response = await fetch(LICENSE_RPC, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`LICENSE_RPC_HTTP_${response.status}`);
  }

  const raw = await response.json();
  const data = Array.isArray(raw) ? raw[0] : raw;
  const licenseState = String(data?.license_state || 'VERIFY_DENIED').toUpperCase();
  const allowed = data?.success === true && data?.locked === false && ACTIVE_STATES.has(licenseState);

  return {
    allowed,
    licenseState,
    state: String(data?.state || 'LICENSE_LOCKED'),
    authority: String(data?.authority || 'MRXPANEL_CENTRAL_LICENSE'),
    expiresAt: data?.expires_at || null,
  };
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function lockPage({ member, licenseState, verificationError }) {
  const stateLabel = verificationError ? 'VERIFY_DENIED' : (licenseState || 'LICENSE_LOCKED');
  const detail = verificationError
    ? 'Status lisensi belum dapat diverifikasi. Untuk keamanan, akses panel sementara dikunci.'
    : 'Lisensi panel sedang tidak aktif. Data bisnis tetap tersimpan dan akses akan pulih otomatis setelah lisensi aktif kembali.';

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#881337">
<meta name="robots" content="noindex,nofollow">
<title>Lisensi Panel Telah Berakhir | MRSFIA Digital</title>
<style>
:root{--bg:#fff8fa;--surface:#fff;--ink:#2a1f24;--muted:#75656c;--line:#efd9e0;--rose:#e11d48;--crimson:#be123c;--burgundy:#881337;--deep:#4a1024;--soft:#fff0f3}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:radial-gradient(circle at 10% 0%,rgba(251,113,133,.16),transparent 30rem),radial-gradient(circle at 90% 10%,rgba(225,29,72,.08),transparent 28rem),var(--bg)}
body{display:grid;place-items:center;padding:24px}.shell{width:min(720px,100%)}.brand{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:18px}.mark{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;font-weight:950;background:linear-gradient(145deg,var(--burgundy),var(--rose));box-shadow:0 12px 30px rgba(136,19,55,.22)}.brand-copy b{display:block;font-size:15px}.brand-copy span{display:block;font-size:10px;color:var(--muted);letter-spacing:.08em;margin-top:2px}.card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:28px;padding:40px;box-shadow:0 30px 90px rgba(74,16,36,.12);text-align:center}.icon{width:68px;height:68px;border-radius:22px;display:grid;place-items:center;margin:0 auto 20px;background:var(--soft);color:var(--crimson);font-size:30px;font-weight:950}.eyebrow{display:inline-flex;padding:7px 11px;border-radius:999px;background:#fff0f3;color:var(--burgundy);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.card h1{font-size:clamp(30px,6vw,46px);line-height:1.08;letter-spacing:-.045em;margin:16px 0 12px}.card p{max-width:570px;margin:0 auto;color:var(--muted);font-size:14px;line-height:1.75}.meta{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:22px}.pill{padding:8px 10px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:10px;font-weight:850;color:#624b54}.status{margin-top:24px;padding:13px 14px;border-radius:14px;background:#fff7f9;border:1px solid var(--line);font-size:11px;color:#745a64}.status b{color:var(--burgundy)}.foot{margin-top:18px;color:#9a858d;font-size:10px;line-height:1.6}@media(max-width:560px){.card{padding:30px 20px;border-radius:22px}.brand{justify-content:flex-start}.card h1{font-size:32px}}
</style>
</head>
<body>
<div class="shell">
  <div class="brand"><div class="mark">M</div><div class="brand-copy"><b>MRSFIA Digital</b><span>PT MRSFIA DIGITAL NUSANTARA</span></div></div>
  <main class="card">
    <div class="icon">!</div>
    <div class="eyebrow">LICENSE_LOCKED</div>
    <h1>Lisensi Panel Telah Berakhir</h1>
    <p>${esc(detail)}</p>
    <div class="meta"><span class="pill">Status: ${esc(stateLabel)}</span><span class="pill">Authority: MRXPANEL</span></div>
    <div class="status">Sistem memeriksa status lisensi secara otomatis. <b>Tidak perlu login ulang atau membuat akun baru.</b></div>
    <div class="foot">MRSFIA Digital &bull; akses akan kembali otomatis setelah lisensi berstatus ACTIVE atau GRACE.</div>
  </main>
</div>
<script>
(() => {
  const RPC = ${JSON.stringify(LICENSE_RPC)};
  const KEY = ${JSON.stringify(SUPABASE_PUBLISHABLE_KEY)};
  const MEMBER = ${member ? 'true' : 'false'};
  const PREFIX = ${JSON.stringify(AUTH_STORAGE_PREFIX)};

  if (MEMBER) {
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        const remove = [];
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith(PREFIX)) remove.push(k);
        }
        remove.forEach(k => store.removeItem(k));
      } catch (_) {}
    }
  }

  let checking = false;
  async function recheck() {
    if (checking) return;
    checking = true;
    try {
      const r = await fetch(RPC, {
        method: 'POST',
        headers: { apikey: KEY, accept: 'application/json', 'content-type': 'application/json' },
        body: '{}',
        cache: 'no-store'
      });
      if (!r.ok) return;
      let d = await r.json();
      if (Array.isArray(d)) d = d[0];
      const s = String(d?.license_state || '').toUpperCase();
      if (d?.success === true && d?.locked === false && (s === 'ACTIVE' || s === 'GRACE')) {
        window.location.reload();
      }
    } catch (_) {
      // Fail closed: stay on the lock page.
    } finally {
      checking = false;
    }
  }

  setInterval(recheck, 15000);
  window.addEventListener('focus', recheck);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) recheck(); });
})();
</script>
</body>
</html>`;
}

function copyResponseHeaders(upstream, res, origin, publicHost) {
  const allowed = [
    'content-type', 'content-language', 'content-disposition', 'etag',
    'last-modified', 'accept-ranges', 'content-range'
  ];
  for (const name of allowed) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }

  const location = upstream.headers.get('location');
  if (location) {
    const rewritten = location.startsWith(origin)
      ? `https://${publicHost}${location.slice(origin.length)}`
      : location;
    res.setHeader('location', rewritten);
  }

  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-mrsfia-license-gate', 'ACTIVE_PROXY');
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
}

async function proxyOrigin(req, res, member) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method || 'GET')) {
    res.status(405).setHeader('allow', 'GET, HEAD, OPTIONS').send('Method Not Allowed');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const origin = member ? MEMBER_ORIGIN : LANDING_ORIGIN;
  const pathAndQuery = originalPathAndQuery(req);
  const target = `${origin}${pathAndQuery}`;

  const headers = {};
  for (const name of ['accept', 'accept-language', 'user-agent', 'range', 'if-none-match', 'if-modified-since']) {
    const value = first(req.headers[name]);
    if (value) headers[name] = String(value);
  }

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });

  const publicHost = requestHost(req) || (member ? 'member.mrsfiadigital.com' : 'mrsfiadigital.com');
  copyResponseHeaders(upstream, res, origin, publicHost);
  res.status(upstream.status);

  if (req.method === 'HEAD' || upstream.status === 304 || upstream.status === 204) {
    res.end();
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  res.send(body);
}

module.exports = async function handler(req, res) {
  const member = isMemberRequest(req);

  try {
    const license = await readLicense();
    if (!license.allowed) {
      res.status(423);
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      res.setHeader('x-mrsfia-license-gate', 'LOCKED');
      res.send(lockPage({ member, licenseState: license.licenseState, verificationError: false }));
      return;
    }
  } catch (error) {
    res.status(503);
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-mrsfia-license-gate', 'VERIFY_DENIED');
    res.send(lockPage({ member, licenseState: 'VERIFY_DENIED', verificationError: true }));
    return;
  }

  try {
    await proxyOrigin(req, res, member);
  } catch (error) {
    res.status(502);
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-mrsfia-license-gate', 'ORIGIN_ERROR');
    res.send('MRSFIA Digital sementara tidak dapat dimuat. Silakan coba lagi.');
  }
};
