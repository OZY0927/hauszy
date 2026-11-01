import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3001';
const home=await fetch(origin+'/');assert.equal(home.status,200);assert.equal(home.headers.get('x-frame-options'),'DENY');assert.equal(home.headers.get('x-content-type-options'),'nosniff');assert.equal(home.headers.get('x-powered-by'),null);const publicPolicy=home.headers.get('content-security-policy');for(const host of ['https://fonts.googleapis.com','https://fonts.gstatic.com','https://static.cloudflareinsights.com','https://cloudflareinsights.com'])assert.ok(publicPolicy.includes(host));
const admin=await fetch(origin+'/admin/'),html=await admin.text();assert.equal(admin.status,200);const csp=admin.headers.get('content-security-policy'),nonce=csp.match(/'nonce-([^']+)'/)[1];assert.ok(!csp.split(';').find(d=>d.trim().startsWith('script-src ')).includes("'unsafe-inline'"));assert.ok(html.includes(`nonce="${nonce}"`));assert.ok(admin.headers.get('cache-control').includes('no-store'));assert.ok(admin.headers.get('cache-control').includes('no-transform'));
const again=await fetch(origin+'/admin/');assert.notEqual(again.headers.get('content-security-policy'),csp);
const denied=await fetch(origin+'/api/revalidate/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tags:['projects']})});assert.equal(denied.status,401);assert.equal(denied.headers.get('cache-control'),'no-store');
const cross=await fetch(origin+'/api/revalidate/',{method:'POST',headers:{Origin:'https://evil.example',Authorization:'Bearer abc.def.ghi','Content-Type':'application/json'},body:JSON.stringify({tags:['projects']})});assert.equal(cross.status,403);
const oversized=await fetch(origin+'/api/revalidate/',{method:'POST',headers:{Authorization:'Bearer abc.def.ghi','Content-Type':'application/json'},body:'x'.repeat(4097)});assert.equal(oversized.status,413);
console.log('HTTP checks passed: security headers, fresh admin nonces, nonce injection, no-store, API 401/403/413.');

const uploadDenied=await fetch(origin+'/api/uploads/sign/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folder:'profile',contentType:'image/png',size:100})});assert.equal(uploadDenied.status,401);assert.equal(uploadDenied.headers.get('cache-control'),'no-store');
const uploadInvalid=await fetch(origin+'/api/uploads/sign/',{method:'POST',headers:{Authorization:'Bearer abc.def.ghi','Content-Type':'application/json'},body:JSON.stringify({folder:'projects/../private',contentType:'image/png',size:100})});assert.equal(uploadInvalid.status,400);
console.log('Upload API checks passed: unauthenticated and invalid-folder requests are rejected.');

const navigation=await fetch(origin+'/privacy/',{headers:{RSC:'1','Next-Router-Prefetch':'1'}});assert.equal(navigation.status,200);assert.ok(navigation.headers.get('content-type').includes('text/x-component'));
console.log('RSC check passed: privacy navigation/prefetch returns a component response.');
