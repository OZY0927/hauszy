import test from 'node:test';
import assert from 'node:assert/strict';
import {uploadProjectMedia} from '../lib/project-media.js';

const photo=name=>({file:{name},url:`blob:${name}`});
const empty={units:[],floorPlans:[],photos:[],showroom:[]};
test('shares three upload slots across media groups while preserving saved order',async()=>{
 let active=0,peak=0;const progress=[];
 const result=await uploadProjectMedia({units:[{name:'A'}],floorPlans:[[photo('plan')]],photos:[photo('cover'),photo('second'),photo('third')],showroom:[photo('showroom')]},'projects/new',async(p,folder)=>{
  assert.equal(folder,'projects/new');active++;peak=Math.max(peak,active);
  await new Promise(resolve=>setImmediate(resolve));active--;return `https://images/${p.file.name}`;
 },{onProgress:(done,total)=>progress.push([done,total])});
 assert.equal(peak,3);assert.equal(active,0);
 assert.deepEqual(result.images,['https://images/cover','https://images/second','https://images/third']);
 assert.deepEqual(result.showroomImages,['https://images/showroom']);
 assert.deepEqual(result.units,[{name:'A',floorPlanUrls:['https://images/plan']}]);
 assert.deepEqual(progress.at(-1),[5,5]);
});
test('existing links need no upload and a shared new file uploads only once',async()=>{
 const shared=photo('shared');let calls=0;
 const result=await uploadProjectMedia({...empty,photos:[{url:'https://existing'},shared],showroom:[shared]},'projects/new',async()=>{calls++;return 'https://new'});
 assert.equal(calls,1);assert.deepEqual(result.images,['https://existing','https://new']);assert.deepEqual(result.showroomImages,['https://new']);
 await uploadProjectMedia({...empty,photos:[{url:'https://existing'}]},'projects/new',()=>assert.fail('Existing media must not upload'));
});
test('failure waits for active uploads, then retry reuses successes',async()=>{
 const cache=new Map(),calls=[],photos=[photo('good'),photo('bad'),photo('slow'),photo('waiting')];let active=0,fail=true;
 const upload=async p=>{
  calls.push(p.file.name);active++;
  try{await new Promise(resolve=>setImmediate(resolve));if(p.file.name==='bad'&&fail)throw Error('Network failed');return `https://images/${p.file.name}`}finally{active--}
 };
 await assert.rejects(uploadProjectMedia({...empty,photos},'projects/new',upload,{cache}),/Network failed/);
 assert.equal(active,0);assert.equal(cache.get(photos[0].file),'https://images/good');assert.equal(cache.has(photos[1].file),false);
 fail=false;
 const result=await uploadProjectMedia({...empty,photos},'projects/new',upload,{cache});
 assert.equal(calls.filter(name=>name==='good').length,1);assert.equal(calls.filter(name=>name==='slow').length,1);
 assert.deepEqual(result.images,photos.map(p=>`https://images/${p.file.name}`));
});
