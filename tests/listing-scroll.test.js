import test from 'node:test';
import assert from 'node:assert/strict';
import {listingReturnSnapshot,isListingReturn} from '../lib/listing-scroll.js';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
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
