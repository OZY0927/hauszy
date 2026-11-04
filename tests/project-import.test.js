import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProjectJson} from '../lib/project-import.js';
const parse=data=>parseProjectJson(JSON.stringify(data));
test('imports sample fields, layouts, coordinates and photos while ignoring supplied IDs and prices',()=>{
 const result=parse({id:'existing',updatedAt:'fake',name:'Home',location:'Penang',latitude:5,longitude:100,price:1,status:'Published',units:[{name:'A',price:450000,size:900}],nearbyAmenities:[{category:'Schools',name:'School',distance:2,travelTime:5}],images:['https://example.com/home.jpg']});
 assert.equal(result.form.id,'');assert.equal(result.form.updatedAt,undefined);assert.equal(result.form.price,450000);assert.equal(result.form.mapCoordinates,'5, 100');assert.equal(result.nearbyAmenities[0].distance,'2');assert.equal(result.photos[0].url,'https://example.com/home.jpg');assert.equal(result.form.status,'Published');
});
test('imports the estimated VP as a quarter and converts older dates',()=>{assert.equal(parse({name:'Home',location:'KL',vp:'q1 2027'}).form.vp,'Q1 2027');assert.equal(parse({name:'Home',location:'KL',vp:'2028-06-01'}).form.vp,'Q2 2028')});
test('defaults to archived and accepts unknown fields as null',()=>{const result=parse({name:'Home',location:'KL',maintenance:null,units:[],images:[]});assert.equal(result.form.status,'Archived');assert.equal(result.form.maintenance,null)});
test('keeps the current status when the JSON has none',()=>{const json=JSON.stringify({name:'Home',location:'KL'});assert.equal(parseProjectJson(json,'Published').form.status,'Published');assert.equal(parseProjectJson(JSON.stringify({name:'Home',location:'KL',status:'Archived'}),'Published').form.status,'Archived')});
test('rejects malformed JSON, wrong shapes and invalid specifications',()=>{
 assert.throws(()=>parseProjectJson('{'),/Invalid JSON/);
 for(const data of [[],{name:'Home'},{name:'Home',location:'KL',units:{}},{name:'Home',location:'KL',units:[null]},{name:42,location:'KL'},{name:'Home',location:'KL',latitude:3},{name:'Home',location:'KL',images:['javascript:alert(1)']},{name:'Home',location:'KL',units:[{name:'A',price:-1}]},{name:'Home',location:'KL',vp:'Q5 2029'},{name:'Home',location:'KL',vp:'March 2029'}])assert.throws(()=>parse(data));
});
