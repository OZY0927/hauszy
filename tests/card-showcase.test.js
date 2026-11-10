import test from 'node:test';
import assert from 'node:assert/strict';
import {SHOWCASE_CONFIG} from '../lib/card-showcase/config.js';
import {buildLayout,cardProgress,frame,framing,textVisible} from '../lib/card-showcase/layout.js';
import {qAxis,qRotate,qSlerp} from '../lib/card-showcase/math.js';

const close=(a,b,eps=1e-9)=>a.every((v,i)=>Math.abs(v-b[i])<eps);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);

for(const [name,cfg] of Object.entries(SHOWCASE_CONFIG)){
 test(`${name}: layout is deterministic and pairs every ring slot with exactly one grid cell`,()=>{
  const a=buildLayout(cfg,9),b=buildLayout(cfg,9),count=cfg.grid.cols*cfg.grid.rows;
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
  assert.equal(a.cards.length,count);
  assert.equal(new Set(a.cards.map(c=>c.slot)).size,count);
  assert.equal(new Set(a.cards.map(c=>c.cell.c+','+c.cell.r)).size,count);
  assert.ok(a.cards.every(c=>c.delay>=0&&c.delay<=1&&c.image>=0&&c.image<9));
 });

 test(`${name}: cards start on the ring, with an opening at the front`,()=>{
  const layout=buildLayout(cfg,5),f=frame(layout,cfg,0,16/9);
  for(const c of layout.cards){
   assert.ok(Math.abs(Math.hypot(c.slot.local[0],c.slot.local[2])-cfg.ring.radius)<1e-9);
   assert.ok(Math.abs(c.slot.theta)>=cfg.ring.opening-1e-9);
  }
  assert.ok(f.cards.every(c=>c.t===0&&c.bend===0));
 });

 test(`${name}: unfolding is staggered and every card lands exactly on its grid pose`,()=>{
  const layout=buildLayout(cfg,5),[start,end]=cfg.phases.unfold;
  const mid=layout.cards.map(c=>cardProgress(c,cfg,(start+end)/2));
  assert.ok(mid.some(t=>t===0),'some cards still in the ring');
  assert.ok(mid.some(t=>t===1),'some cards already placed');
  assert.ok(mid.some(t=>t>0&&t<1),'some cards travelling');
  const f=frame(layout,cfg,end,16/9);
  for(const c of f.cards){
   const cell=qRotate(layout.gridQ,c.card.cell.local),to=cell.map((v,i)=>v+cfg.grid.center[i]);
   assert.equal(c.t,1);
   assert.ok(close(c.position,to,1e-6));
   assert.ok(Math.abs(Math.abs(dot(c.rotation,layout.gridQ))-1)<1e-9);
   assert.ok(Math.abs(c.bend)<1e-9);
  }
 });

 test(`${name}: the camera closes in and the gallery yields one side by the end`,()=>{
  const layout=buildLayout(cfg,5),aspect=name==='compact'?.46:16/9,dist=framing(layout,cfg,aspect);
  const first=frame(layout,cfg,0,aspect),last=frame(layout,cfg,1,aspect);
  assert.ok(dist.grid<dist.ring);
  assert.ok(Math.abs(first.eye[2]-first.target[2]-dist.ring)<1e-9);
  assert.ok(Math.abs(last.eye[2]-last.target[2]-dist.grid)<1e-9);
  assert.equal(first.keep,1);
  assert.ok(Math.abs(last.keep-(1-cfg.split.amount))<1e-9);
  assert.equal(last.side,cfg.split.side);
 });
}

test('rotations interpolate the short way round',()=>{
 const a=qAxis(0,1,0,.1),b=qAxis(0,1,0,-.1).map(v=>-v); // same rotation as -0.1 rad, opposite sign
 const half=qSlerp(a,b,.5);
 assert.ok(Math.abs(Math.abs(half[3])-1)<1e-9,'midpoint is the identity, not a half turn');
});

test('text reveal has hysteresis so it does not flicker at the threshold',()=>{
 const cfg=SHOWCASE_CONFIG.desktop,[hide,show]=cfg.phases.text,between=(hide+show)/2;
 assert.equal(textVisible(cfg,between,false),false);
 assert.equal(textVisible(cfg,show,false),true);
 assert.equal(textVisible(cfg,between,true),true);
 assert.equal(textVisible(cfg,hide-.01,true),false);
});
