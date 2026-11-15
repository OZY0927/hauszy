import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';

// Exercise real production routing, including on-demand project generation.
const port=await new Promise((resolve,reject)=>{
 const probe=createServer();
 probe.on('error',reject);
 probe.listen(0,'127.0.0.1',()=>{const port=probe.address().port;probe.close(()=>resolve(port))});
});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{stdio:['ignore','pipe','pipe']});
let output='';
server.stdout.on('data',chunk=>{output+=chunk});
server.stderr.on('data',chunk=>{output+=chunk});
const origin=`http://127.0.0.1:${port}`;
try{
 let ready=false;
 for(let attempt=0;attempt<100;attempt++){
  if(server.exitCode!==null)throw Error(output);
  try{const response=await fetch(origin,{signal:AbortSignal.timeout(1000)});await response.text();ready=true;break}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 assert.ok(ready,'Production server must start');
 for(const path of ['/404-smoke-missing/','/unknown/deeply/nested/page/','/about/missing/','/tools/missing/','/admin/missing/','/projects/missing/','/projects/missing/nested/']){
  const response=await fetch(origin+path);
  const html=await response.text();
  assert.equal(response.status,404,`${path}: HTTP 404`);
  assert.ok(html.includes('Right place. Wrong address.'),`${path}: custom 404 design`);
  assert.ok(html.includes('heritage-house-3d.webp'),`${path}: custom artwork`);
  assert.match(html,/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/,`${path}: noindex`);
  assert.ok(html.includes('Take me home')&&html.includes('Or explore Penang projects'),`${path}: recovery links`);
  console.log(`PASS ${path} — custom design, HTTP 404, noindex, recovery links`);
 }
}finally{
 server.kill('SIGTERM');
 await new Promise(resolve=>{if(server.exitCode!==null)resolve();else server.once('exit',resolve)});
}
