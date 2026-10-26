import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

const origin = 'http://127.0.0.1:3107';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3107'], {
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', SP_CLIENT_ID: 'smoke-client', SP_CLIENT_SECRET: 'smoke-secret',
    SP_REDIRECT_URI: `${origin}/api/callback`, DATABASE_URL: 'mongodb://127.0.0.1:1/songshowcase_smoke' },
  stdio: 'ignore',
});
const fetchLocal = (path, options = {}) => fetch(origin + path, { ...options, redirect: 'manual', signal: AbortSignal.timeout(3000) });
let checks = 0;
try {
  let ready = false;
  for (let n = 0; n < 60; n++) {
    if (server.exitCode !== null) throw new Error('Smoke server exited before becoming ready');
    try { if ((await fetchLocal('/')).status === 200) { ready = true; break; } } catch { /* Wait for startup. */ }
    await setTimeout(250);
  }
  assert.ok(ready, 'Production server became ready');
  const home = await fetchLocal('/');
  assert.equal(home.status, 200); assert.match(await home.text(), /SongShowcase/); checks++;
  for (const path of ['/dash', '/dash/top/artist', '/dash/top/track']) {
    const response = await fetchLocal(path);
    assert.equal(response.status, 307); assert.equal(new URL(response.headers.get('location'), origin).pathname, '/'); checks++;
  }
  for (const path of ['/api/get?get=info', '/api/refresh']) {
    const response = await fetchLocal(path);
    assert.equal(response.status, 401); assert.match(response.headers.get('cache-control'), /no-store/); checks++;
  }
  const badCookie = await fetchLocal('/api/get?get=info', { headers: { cookie: 'session_id=invalid' } });
  assert.equal(badCookie.status, 401); checks++;
  const callback = await fetchLocal('/api/callback?code=dummy&state=invalid');
  assert.equal(callback.status, 400); assert.match(callback.headers.get('cache-control'), /no-store/); checks++;
  const login = await fetchLocal('/api/login');
  assert.equal(login.status, 303);
  const redirect = new URL(login.headers.get('location'));
  assert.equal(redirect.origin, 'https://accounts.spotify.com');
  assert.equal(redirect.searchParams.get('redirect_uri'), `${origin}/api/callback`);
  assert.match(redirect.searchParams.get('state'), /^[a-f0-9]{64}$/);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/); checks++;
  const crossOrigin = await fetchLocal('/api/logout', { method: 'POST', headers: { origin: 'https://different.example.test' } });
  assert.equal(crossOrigin.status, 403); checks++;
  const logout = await fetchLocal('/api/logout', { method: 'POST', headers: { origin } });
  assert.equal(logout.status, 303); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/); checks++;
  console.log(`Passed ${checks} HTTP smoke checks with dummy configuration; no live Spotify or MongoDB access.`);
} finally {
  server.kill();
}
