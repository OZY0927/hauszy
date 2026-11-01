import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteProjectDocuments} from '../lib/project-deletion.js';
test('deletion removes private and public records in one atomic batch, including archived projects',async()=>{
 const deleted=[];let commits=0;const db={};
 await deleteProjectDocuments(db,'project-id',{doc:(database,collection,id)=>{assert.equal(database,db);return `${collection}/${id}`},writeBatch:()=>({delete:ref=>deleted.push(ref),commit:async()=>{commits++}})});
 assert.deepEqual(deleted,['projects/project-id','publicProjects/project-id']);assert.equal(commits,1);
});
test('failed deletion propagates instead of reporting success',async()=>{await assert.rejects(deleteProjectDocuments({},'id',{doc:()=>({}),writeBatch:()=>({delete:()=>{},commit:async()=>{throw Error('Permission denied')}})}),/Permission denied/)});
test('invalid IDs cannot target other document paths',async()=>{for(const id of ['',null,'nested/document'])await assert.rejects(deleteProjectDocuments({},id),/Invalid project ID/)});
