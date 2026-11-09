import test from 'node:test';
import assert from 'node:assert/strict';
import {propertyCategory} from '../lib/property-category.js';
import {filterProjects} from '../lib/project.js';
test('broad categories include apartment, landed and commercial subtypes',()=>{
 for(const type of ['Condominium','Serviced apartment','Flat','Residence','Suites'])assert.equal(propertyCategory({type}),'Apartment');
 for(const type of ['Terrace house','Semi-detached','Bungalow','Residential land'])assert.equal(propertyCategory({type}),'Landed');
 for(const type of ['Shop lot','Office','Retail','Factory','Warehouse','Industrial land','SOHO'])assert.equal(propertyCategory({type}),'Commercial');
 assert.equal(propertyCategory({type:'Land',mode:'Industrial'}),'Commercial');
});
test('category filters combine with budget, location and saves while exact type filters still work',()=>{
 const projects=[{id:'a',type:'Condominium',location:'Batu Kawan',price:500000},{id:'b',type:'Serviced apartment',location:'Batu Kawan',price:700000},{id:'c',type:'Terrace house',location:'Batu Kawan',price:500000}];
 assert.deepEqual(filterProjects(projects,{type:'group:Apartment'}).map(p=>p.id),['a','b']);
 assert.deepEqual(filterProjects(projects,{type:'group:Apartment',location:'Kawan',maximum:600000,savedOnly:true,saved:['a','c']}).map(p=>p.id),['a']);
 assert.deepEqual(filterProjects(projects,{type:'Serviced apartment'}).map(p=>p.id),['b']);
 assert.equal(filterProjects(projects,{}).length,3);
});
