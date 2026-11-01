import test from 'node:test';
import assert from 'node:assert/strict';
import {uploadLayoutFloorPlans} from '../lib/layout-floor-plans.js';
test('uploads each selected plan to its matching layout and preserves existing plans',async()=>{
 const units=[{name:'A',price:400000,floorPlanUrl:''},{name:'B',floorPlanUrl:'https://old.example/b.png'},{name:'C',floorPlanUrl:''}],photoA={file:{name:'a.png'},url:'blob:a'},photoC={file:{name:'c.png'},url:'blob:c'},calls=[];
 const result=await uploadLayoutFloorPlans(units,[[photoA],[{url:'https://old.example/b.png'}],[photoC]],'projects/id',async(photo,folder)=>{calls.push({photo,folder});return `https://project.supabase.co/${photo.file.name}`});
 assert.equal(result[0].floorPlanUrl,'https://project.supabase.co/a.png');assert.equal(result[1].floorPlanUrl,units[1].floorPlanUrl);assert.equal(result[2].floorPlanUrl,'https://project.supabase.co/c.png');assert.equal(result[0].price,400000);assert.equal(calls.length,2);assert.equal(calls[0].folder,'projects/id');assert.equal(units[0].floorPlanUrl,'');assert.ok(!('file' in result[0]));
});
test('removed plans stay cleared and no files are uploaded when only URLs remain',async()=>{
 const units=[{name:'A',floorPlanUrl:''},{name:'B',floorPlanUrl:'https://old.example/b.png'}];const result=await uploadLayoutFloorPlans(units,[[],[{url:units[1].floorPlanUrl}]],'projects/id',()=>{throw Error('Unexpected upload')});assert.deepEqual(result,units);
});
test('upload failure prevents a successful save result without mutating layouts',async()=>{
 const units=[{name:'A',floorPlanUrl:'https://old.example/a.png'}];await assert.rejects(uploadLayoutFloorPlans(units,[[{file:{},url:'blob:new'}]],'projects/id',async()=>{throw Error('Upload failed')}),/Upload failed/);assert.equal(units[0].floorPlanUrl,'https://old.example/a.png');
});
