import test from 'node:test';
import assert from 'node:assert/strict';
import {listingReturnSnapshot,isListingReturn} from '../lib/listing-scroll.js';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {projectPageCount,projectPageItems,projectPagePath} from '../lib/project.js';
const snapshot={y:2450,visibleCount:45,location:'Bayan Lepas',type:'group:Apartment',minimum:0,maximum:null,order:'name-asc',view:'list',savedOnly:false};
test('Back restores the listing filters, layout, position and enough loaded cards',()=>{
 assert.deepEqual(listingReturnSnapshot(JSON.stringify(snapshot),75),snapshot);
 assert.equal(listingReturnSnapshot(JSON.stringify(snapshot),20).visibleCount,20);
 assert.equal(isListingReturn('/projects/','/projects'),true);
 assert.equal(isListingReturn(null,'/projects'),false);
 assert.equal(isListingReturn('/about','/projects'),false);
});
test('invalid stored positions and budgets cannot restore a broken listing',()=>{
 for(const value of ['invalid','null',JSON.stringify({...snapshot,y:-1}),JSON.stringify({...snapshot,visibleCount:0}),JSON.stringify({...snapshot,minimum:100,maximum:50})])assert.equal(listingReturnSnapshot(value,75),null);
});

test('catalogue URLs partition the listings and support restoring filtered pages',()=>{
 const projects=Array.from({length:20},(_,i)=>i+1);
 assert.equal(projectPageCount(projects.length),3);
 assert.equal(projectPagePath(1),'/projects/');
 assert.equal(projectPagePath(2),'/projects/browse/2/');
 assert.deepEqual(projectPageItems(projects,2),projects.slice(9,18));
 assert.deepEqual(projectPageItems(projects,3),[19,20]);
 const {visibleCount,...prior}=snapshot;
 const paginated={...prior,resultPage:2};
 assert.deepEqual(listingReturnSnapshot(JSON.stringify(paginated),20),paginated);
 assert.equal(listingReturnSnapshot(JSON.stringify({...paginated,resultPage:0}),20),null);
 const responsive={...prior,resultOffset:12};
 assert.deepEqual(listingReturnSnapshot(JSON.stringify(responsive),20),responsive);
 assert.deepEqual(listingReturnSnapshot(JSON.stringify({...responsive,resultOffset:null}),20),{...responsive,resultOffset:null});
 assert.equal(listingReturnSnapshot(JSON.stringify({...responsive,resultOffset:-1}),20),null);
 for(const cols of [1,2,3,4]){
  const size=cols*3;
  const batches=Array.from({length:projectPageCount(projects.length,size)},(_,i)=>projectPageItems(projects,i+1,size));
  assert.ok(batches.slice(0,-1).every(batch=>batch.length===size));
  assert.deepEqual(batches.flat(),projects);
 }
});

test('only refresh resets the page, while history traversal keeps native restoration',()=>{
 const source=readFileSync(new URL('../public/scroll-behavior.js',import.meta.url),'utf8');
 for(const type of ['reload','navigate','back_forward']){
  const events=new Map(),frames=[],scrolls=[];
  const environment={performance:{getEntriesByType:()=>[{type}]},location:{pathname:'/projects/'},history:{scrollRestoration:'auto'},document:{readyState:'loading'},addEventListener:(name,fn)=>events.set(name,fn),scrollTo:options=>scrolls.push(options),requestAnimationFrame:fn=>frames.push(fn)};
  environment.window=environment;runInNewContext(source,environment);
  assert.equal(environment.history.scrollRestoration,type==='reload'?'manual':'auto');
  assert.equal(environment.__hauszyHistoryTarget,type==='back_forward'?'/projects/':null);
  if(type==='reload'){events.get('pageshow')();frames.forEach(fn=>fn());assert.equal(scrolls.length,2);assert.ok(scrolls.every(options=>options.top===0));assert.equal(environment.history.scrollRestoration,'auto')}
  else assert.equal(scrolls.length,0);
  environment.location.pathname='/about/';events.get('popstate')();assert.equal(environment.__hauszyHistoryTarget,'/about/');
 }
});
