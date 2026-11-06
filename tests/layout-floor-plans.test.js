import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOOR_PLAN_LIMIT,floorPlanList,uploadLayoutFloorPlans} from '../lib/layout-floor-plans.js';
import {normaliseProject} from '../lib/project.js';
import {buildProject} from '../lib/project-editor.js';
import {projectSections} from '../lib/project-visibility.js';
test('uploads each selected plan to its matching layout, in order, keeping existing plans',async()=>{
 const units=[{name:'A',price:400000,floorPlanUrl:''},{name:'B',floorPlanUrl:'https://old.example/b.png'},{name:'C'}],photoA={file:{name:'a.png'},url:'blob:a'},photoA2={file:{name:'a2.png'},url:'blob:a2'},photoC={file:{name:'c.png'},url:'blob:c'},calls=[];
 const result=await uploadLayoutFloorPlans(units,[[photoA,{url:'https://old.example/a-keep.png'},photoA2],[{url:'https://old.example/b.png'}],[photoC]],'projects/id',async(photo,folder)=>{calls.push({photo,folder});return `https://project.supabase.co/${photo.file.name}`});
 assert.deepEqual(result[0].floorPlanUrls,['https://project.supabase.co/a.png','https://old.example/a-keep.png','https://project.supabase.co/a2.png']);assert.deepEqual(result[1].floorPlanUrls,['https://old.example/b.png']);assert.deepEqual(result[2].floorPlanUrls,['https://project.supabase.co/c.png']);
 assert.equal(result[0].price,400000);assert.equal(calls.length,3);assert.equal(calls[0].folder,'projects/id');assert.ok(!('floorPlanUrl' in result[1]));assert.equal(units[1].floorPlanUrl,'https://old.example/b.png');assert.ok(!('file' in result[0]));
});
test('removed plans stay cleared and no files are uploaded when only URLs remain',async()=>{
 const units=[{name:'A',floorPlanUrl:'https://old.example/a.png'},{name:'B',floorPlanUrls:['https://old.example/b1.png','https://old.example/b2.png']}];const result=await uploadLayoutFloorPlans(units,[[],[{url:'https://old.example/b2.png'}]],'projects/id',()=>{throw Error('Unexpected upload')});assert.deepEqual(result,[{name:'A',floorPlanUrls:[]},{name:'B',floorPlanUrls:['https://old.example/b2.png']}]);
});
test('upload failure prevents a successful save result without mutating layouts',async()=>{
 const units=[{name:'A',floorPlanUrl:'https://old.example/a.png'}];await assert.rejects(uploadLayoutFloorPlans(units,[[{file:{},url:'blob:new'}]],'projects/id',async()=>{throw Error('Upload failed')}),/Upload failed/);assert.equal(units[0].floorPlanUrl,'https://old.example/a.png');
});
test('older single floor plans read as a one-item list and unsafe links are dropped',()=>{
 assert.deepEqual(floorPlanList({floorPlanUrl:'https://a/p.png'}),['https://a/p.png']);assert.deepEqual(floorPlanList({floorPlanUrl:''}),[]);assert.deepEqual(floorPlanList({}),[]);
 const p=normaliseProject({units:[{name:'A',floorPlanUrl:'https://a/p.png'},{name:'B',floorPlanUrls:['https://a/1.png','http://a/2.png','https://a/3.png']},{floorPlanUrls:['https://a/x.png']}]},'id');
 assert.deepEqual(p.units[0].floorPlanUrls,['https://a/p.png']);assert.ok(!('floorPlanUrl' in p.units[0]));assert.deepEqual(p.units[1].floorPlanUrls,['https://a/1.png','https://a/3.png']);assert.equal(projectSections(p).units.length,3);
});
test('saving rejects too many plans or unsafe plan links',()=>{
 const form={name:'Home',location:'KL'};assert.throws(()=>buildProject(form,[{name:'A',floorPlanUrls:Array(FLOOR_PLAN_LIMIT+1).fill('https://a/p.png')}],[],'id'),/up to 5 floor plan/);assert.throws(()=>buildProject(form,[{name:'A',floorPlanUrls:['javascript:alert(1)']}],[],'id'),/https/);assert.doesNotThrow(()=>buildProject(form,[{name:'A',floorPlanUrls:['https://a/1.png','https://a/2.png']}],[],'id'));
});
