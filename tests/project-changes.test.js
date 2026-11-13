import test from 'node:test';
import assert from 'node:assert/strict';
import {projectChanges} from '../lib/project-changes.js';

test('text-only edits exclude existing media, layouts and unchanged metadata',()=>{
 const saved={id:'home',name:'Home',location:'Penang',images:['https://example.com/a.webp'],units:[{name:'A',price:500000}],sectionVisibility:{gallery:true,video:false}};
 const edited=structuredClone(saved);edited.name='New name';edited.updatedAt='later';
 assert.deepEqual(projectChanges(saved,edited),{fields:{name:'New name'},removed:[]});
});
test('equal nested values and reordered object keys do not trigger writes',()=>{
 assert.deepEqual(projectChanges({units:[{name:'A',price:1}],sectionVisibility:{gallery:true,video:false}},{sectionVisibility:{video:false,gallery:true},units:[{price:1,name:'A'}]}),{fields:{},removed:[]});
});
test('cleared values and reordered or removed photos are changes',()=>{
 assert.deepEqual(projectChanges({price:100,images:['a','b'],showroomImages:['c']},{price:null,images:['b','a'],showroomImages:[]}),{fields:{price:null,images:['b','a'],showroomImages:[]},removed:[]});
});
test('changed maps replace the entire field so removed keys stay removed',()=>{
 assert.deepEqual(projectChanges({sectionVisibility:{gallery:true,video:false}},{sectionVisibility:{gallery:false}}),{fields:{sectionVisibility:{gallery:false}},removed:[]});
});
test('JSON replacement deletes omitted content while protecting identity and timestamps',()=>{
 assert.deepEqual(projectChanges({id:'home',name:'Old',videoUrl:'https://example.com/video.mp4',createdAt:'before',updatedAt:'before'},{id:'other',name:'New'}),{fields:{name:'New'},removed:['videoUrl']});
});
test('publication changes are included in the patch',()=>{
 assert.deepEqual(projectChanges({status:'Published'},{status:'Archived'}),{fields:{status:'Archived'},removed:[]});
});
