import test from 'node:test';
import assert from 'node:assert/strict';
import {validActivity,activitySince,summarizeActivity} from '../lib/project-activity.js';
test('activity accepts only project IDs and approved events, never arbitrary personal fields',()=>{
 assert.ok(validActivity({projectId:'abc-123',event:'view'}));
 for(const body of [null,[],{projectId:'../admin',event:'view'},{projectId:'abc',event:'message'},{projectId:'abc',event:'view',email:'private@example.com'}])assert.equal(validActivity(body),false);
});
test('report periods include today in Malaysia across UTC date boundaries',()=>{
 const now=new Date('2026-11-07T18:00:00Z');assert.equal(activitySince(7,now),'2026-11-02');assert.equal(activitySince(30,now),'2026-10-10');
});
test('daily metrics aggregate by project and ignore invalid counts',()=>{
 const result=summarizeActivity([{project_id:'a',event:'click',count:3},{project_id:'a',event:'click',count:'4'},{project_id:'b',event:'view',count:9},{project_id:'b',event:'contact',count:2},{project_id:'a',event:'click',count:-1}]);
 assert.deepEqual(result.totals,{click:7,view:9,floor_plan:0,contact:2});assert.equal(result.projects.find(p=>p.id==='a').click,7);
});

// Run the real route handlers with only the network-backed dependencies stubbed.
import {readFile} from 'node:fs/promises';
import {RequestError} from '../lib/revalidation-security.js';
async function loadRoute(path,mocks){
 let source=await readFile(new URL(path,import.meta.url),'utf8');
 source=source.replace(/import \{([^}]+)\} from '([^']+)';/g,(_,names,dependency)=>{
  const name=dependency.split('/').pop();
  if(mocks.includes(name))return `const {${names}}=globalThis.__activityTest;`;
  return `import {${names}} from '${new URL('../lib/'+name+'.js',import.meta.url).href}';`;
 });
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
test('public collection rejects cross-site, invalid and unpublished requests before writing',async()=>{
 let writes=0,published=true;
 globalThis.__activityTest={getPublishedProject:async()=>published?{id:'abc'}:null,getSupabaseUploadServer:()=>({client:{rpc:async()=>{writes++;return {error:null}}}})};
 const {POST}=await loadRoute('../app/api/project-activity/route.js',['supabase-server','firestore-server']);
 const request=(body,origin='https://hauszy.com')=>new Request('https://hauszy.com/api/project-activity/',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await POST(request({projectId:'abc',event:'view'},'https://evil.example'))).status,403);
 assert.equal((await POST(request({projectId:'abc',event:'view',message:'private'}))).status,400);
 published=false;assert.equal((await POST(request({projectId:'abc',event:'view'}))).status,404);assert.equal(writes,0);
 published=true;assert.equal((await POST(request({projectId:'abc',event:'view'}))).status,204);assert.equal(writes,1);
 delete globalThis.__activityTest;
});
test('admin reporting authenticates before database access and validates report ranges',async()=>{
 let authorized=false,reads=0;
 globalThis.__activityTest={verifyAdminIdToken:async()=>{if(!authorized)throw new RequestError(403,'Admin required.')},getSupabaseUploadServer:()=>{reads++;throw Error('secret should never leak')}};
 const {GET}=await loadRoute('../app/api/admin/project-activity/route.js',['supabase-server','verify-admin']);
 const request=days=>new Request('https://hauszy.com/api/admin/project-activity/?days='+days,{headers:{Authorization:'Bearer abc.def.ghi'}});
 assert.equal((await GET(request(30))).status,403);assert.equal(reads,0);
 authorized=true;assert.equal((await GET(request(365))).status,400);assert.equal(reads,0);
 const response=await GET(request(30));assert.equal(response.status,500);assert.ok(!(await response.text()).includes('secret'));assert.equal(response.headers.get('Cache-Control'),'no-store');
 delete globalThis.__activityTest;
});
