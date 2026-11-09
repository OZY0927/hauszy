import test from 'node:test';
import assert from 'node:assert/strict';
import {featuredProjectPool,sampleProjects} from '../lib/featured-projects.js';

test('featured pool aggregates clicks and excludes unpublished project IDs',()=>{
 const projects=[{id:'a'},{id:'b'},{id:'c'}];
 const result=featuredProjectPool(projects,[{project_id:'a',count:3},{project_id:'a',count:5},{project_id:'b',count:7},{project_id:'private',count:1000},{project_id:'c',count:-5}]);
 assert.deepEqual(result,{projects:[{id:'a'},{id:'b'}],popular:true});
});
test('missing or invalid click data uses published projects without a popularity claim',()=>{
 const projects=[{id:'a'},{id:'b'}];
 assert.deepEqual(featuredProjectPool(projects,[{project_id:'a',count:'invalid'},{project_id:'b',count:0}]),{projects,popular:false});
 assert.deepEqual(featuredProjectPool([],[]),{projects:[],popular:false});
});
test('random selection stays within the ranked pool, has no duplicates, and leaves input unchanged',()=>{
 const projects=Array.from({length:12},(_,i)=>({id:String(i)})),before=[...projects];
 const result=sampleProjects(projects,8,()=>.25);
 assert.equal(result.length,8);assert.equal(new Set(result.map(p=>p.id)).size,8);assert.ok(result.every(p=>projects.includes(p)));assert.deepEqual(projects,before);
 assert.equal(sampleProjects(projects.slice(0,2)).length,2);
});
