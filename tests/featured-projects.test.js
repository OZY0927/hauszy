import test from 'node:test';
import assert from 'node:assert/strict';
import {featuredProjectPool,sampleProjects,HOT_PROJECT_LIMIT} from '../lib/featured-projects.js';

test('featured pool ranks visits, fills with published fallback projects and excludes unpublished IDs',()=>{
 const projects=[{id:'a'},{id:'b'},{id:'c'}];
 const result=featuredProjectPool(projects,[{project_id:'a',count:3},{project_id:'a',count:5},{project_id:'b',count:7},{project_id:'private',count:1000},{project_id:'c',count:-5}]);
 assert.deepEqual(result,{projects,priorityIds:['a','b'],popular:true});
});
test('missing or invalid visits fills from published projects without a popularity claim',()=>{
 const projects=[{id:'a'},{id:'b'}];
 const result=featuredProjectPool(projects,[{project_id:'a',count:'invalid'},{project_id:'b',count:0}]);
 assert.deepEqual(new Set(result.projects),new Set(projects));assert.deepEqual(result.priorityIds,[]);assert.equal(result.popular,false);
 assert.deepEqual(featuredProjectPool([],[]),{projects:[],priorityIds:[],popular:false});
});
test('random selection has no duplicates and leaves the source unchanged',()=>{
 const projects=Array.from({length:12},(_,i)=>({id:String(i)})),before=[...projects];
 const result=sampleProjects(projects,8,()=>.25);
 assert.equal(result.length,8);assert.equal(new Set(result.map(p=>p.id)).size,8);assert.ok(result.every(p=>projects.includes(p)));assert.deepEqual(projects,before);
 assert.equal(sampleProjects(projects.slice(0,2)).length,2);
});
test('one visited project stays first and random projects fill all nine slots',()=>{
 const projects=Array.from({length:20},(_,i)=>({id:String(i)}));
 const pool=featuredProjectPool(projects,[{project_id:'17',count:8}],12,()=>.25);
 const selected=sampleProjects(pool.projects,HOT_PROJECT_LIMIT,()=>.5,pool.priorityIds);
 assert.equal(selected.length,9);assert.equal(selected[0].id,'17');assert.equal(new Set(selected.map(p=>p.id)).size,9);
});
test('when enough projects have visits, the nine most visited retain their exact order',()=>{
 const projects=Array.from({length:20},(_,i)=>({id:String(i)}));
 const pool=featuredProjectPool(projects,projects.map((p,i)=>({project_id:p.id,count:i+1})));
 assert.deepEqual(sampleProjects(pool.projects,HOT_PROJECT_LIMIT,()=>.1,pool.priorityIds).map(p=>p.id),['19','18','17','16','15','14','13','12','11']);
});
test('a small published catalog shows every available project exactly once',()=>{
 const projects=[{id:'a'},{id:'b'},{id:'c'}],pool=featuredProjectPool(projects,[{project_id:'b',count:3}]);
 const selected=sampleProjects(pool.projects,8,()=>.5,pool.priorityIds);
 assert.equal(selected.length,3);assert.equal(selected[0].id,'b');assert.equal(new Set(selected.map(p=>p.id)).size,3);
});
