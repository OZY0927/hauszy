import test from 'node:test';
import assert from 'node:assert/strict';
import {interactionSound,changeSound,navigationHoverTarget,playUISound} from '../lib/ui-sounds.js';

function element(selectors,attributes={},within=[]){
 return {matches:query=>query.split(',').some(s=>selectors.includes(s)),closest:query=>query.split(',').some(s=>within.includes(s)),getAttribute:name=>attributes[name],parentElement:{open:false}};
}
test('sound cues distinguish opening, closing, saving and active view controls',()=>{
 assert.equal(interactionSound(element(['.catalog-floating-trigger'],{'aria-expanded':'false'})),'open');
 assert.equal(interactionSound(element(['.catalog-floating-trigger'],{'aria-expanded':'true'})),'close');
 assert.equal(interactionSound(element(['.catalog-list-save'],{'aria-pressed':'true'})),'unsave');
 assert.equal(interactionSound(element(['.catalog-list-save'],{'aria-pressed':'false'})),'save');
 assert.equal(interactionSound(element(['.catalog-view-toggle button'],{'aria-pressed':'true'})),null);
 assert.equal(interactionSound(element(['.catalog-view-toggle button'],{'aria-pressed':'false'})),'select');
 assert.equal(interactionSound(element(['.site-sound-toggle'])),null);
 assert.equal(interactionSound(element([],{},['.background-music'])),null);
});
test('committed changes only sound in browsing filters and calculators',()=>{
 assert.equal(changeSound(element(['select'],{},['.project-catalog'])),'select');
 assert.equal(changeSound(element(['input[type="range"]'],{},['.catalog-filter-form'])),'tick');
 assert.equal(changeSound(element(['input[type="number"]'],{},['.lc'])),'tick');
 assert.equal(changeSound(element(['input[type="text"]'])),null);
});
test('all synthesized cues remain quiet, short and disconnect their audio nodes',()=>{
 for(const name of ['hover','tick','open','close','save','unsave','select','reset','apply','navigate']){
  const peaks=[],stops=[],nodes=[];
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(value){peaks.push(value)}};
  const node=()=>{const n={frequency:parameter,gain:parameter,connect(){},disconnect(){this.disconnected=true},start(){},stop(at){stops.push(at)}};nodes.push(n);return n};
  playUISound({currentTime:0,destination:{},createOscillator:node,createGain:node},name);
  assert.ok(peaks.every(value=>value<=.018));
  assert.ok(stops.every(at=>at<.3));
  nodes.filter(n=>n.onended).forEach(n=>n.onended());
  assert.ok(nodes.every(n=>n.disconnected));
 }
});

test('navigation hover sounds once on entry, ignoring child crossings and inert controls',()=>{
 const child={},item={matches:()=>false,closest:()=>null,contains:target=>target===child};
 const target={closest:()=>item};
 assert.equal(navigationHoverTarget(target,null),item);
 assert.equal(navigationHoverTarget(target,child),null);
 item.closest=()=>({});
 assert.equal(navigationHoverTarget(target,null),null);
 assert.equal(navigationHoverTarget({closest:()=>null},null),null);
});
