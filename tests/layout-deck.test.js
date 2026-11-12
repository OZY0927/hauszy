import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutArrival,layoutFront,layoutPose} from '../lib/layout-deck.js';

for(const count of [2,3,8]){
 test(`deck with ${count} layouts arrives in order and reverses deterministically`,()=>{
  let previous=0;
  for(let step=0;step<=1000;step++){
   const progress=step/1000,front=layoutFront(progress,count);
   assert.ok(front>=previous&&front<=previous+1);
   for(let index=1;index<count;index++)assert.ok(layoutArrival(index,progress,count)<=layoutArrival(index-1,progress,count));
   assert.equal(layoutFront(progress,count),layoutFront(1-(1000-step)/1000,count));
   previous=front;
  }
  assert.equal(layoutFront(0,count),0);
  assert.equal(layoutFront(1,count),count-1);
  assert.equal(layoutPose(count-1,1,count).entered,1);
  assert.equal(layoutPose(count-1,1,count).above,0);
 });
}
test('future layouts stay hidden before their beat and the final layout rests before unpinning',()=>{
 assert.equal(layoutArrival(2,.1,4),0);
 assert.equal(layoutArrival(3,.95,4),1);
 assert.equal(layoutFront(-1,4),0);
 assert.equal(layoutFront(2,4),3);
 assert.equal(layoutFront(.2,1),0);
});
