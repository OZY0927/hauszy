import test from 'node:test';
import assert from 'node:assert/strict';
import {filterProjects,sortProjects,cleanMoreFilters,moreFilterCount,MORE_FILTERS} from '../lib/project.js';
const P=[
 {id:'a',location:'Bayan Lepas',type:'Condominium',price:500000,tenure:'Freehold',construction:'Completed',vp:'',mode:'Project',developer:'Eco World',units:[{bedrooms:'Studio',bathrooms:'1',size:450},{bedrooms:'3 + 1',bathrooms:'2',size:1200}]},
 {id:'b',location:'Batu Kawan',type:'Terrace house',price:900000,tenure:'Leasehold',construction:'Under construction',vp:'Q2 2028',mode:'New launch',developer:'Aspen Vision City',units:[{bedrooms:'4',bathrooms:'4 + 1',size:2400}]},
 {id:'c',location:'Jelutong',type:'Condominium',price:700000,tenure:'Freehold',construction:'Under construction',vp:'Q4 2026',mode:'Project',developer:'Paramount',units:[{bedrooms:'2',bathrooms:'2',size:850}]},
 {id:'d',location:'Juru',type:'Bungalow land',price:0,tenure:'Freehold',construction:'',vp:null,mode:'Project',developer:null,units:[]},
];
const ids=more=>filterProjects(P,{more}).map(p=>p.id);
test('more filters: rooms use the leading number, studio matches only studios, size matches any layout',()=>{
 assert.deepEqual(ids({beds:'4'}),['b']);
 assert.deepEqual(ids({beds:'3'}),['a','b']);
 assert.deepEqual(ids({beds:'studio'}),['a']);
 assert.deepEqual(ids({baths:'4'}),['b']);
 assert.deepEqual(ids({sizeMin:'1000'}),['a','b']);
 assert.deepEqual(ids({sizeMin:'800',sizeMax:'1000'}),['c']);
});
test('more filters: tenure, status, ready-by (completed always ready), new launch and developer',()=>{
 assert.deepEqual(ids({tenure:'Leasehold'}),['b']);
 assert.deepEqual(ids({status:'Completed'}),['a']);
 assert.deepEqual(ids({readyBy:'2026'}),['a','c']);
 assert.deepEqual(ids({readyBy:'2028'}),['a','b','c']);
 assert.deepEqual(ids({newLaunch:true}),['b']);
 assert.deepEqual(ids({developer:'eco'}),['a']);
 assert.deepEqual(ids(undefined),['a','b','c','d']);
});
test('saved more-filter state is cleaned and counted',()=>{
 assert.deepEqual(cleanMoreFilters({beds:'3',newLaunch:'yes',evil:1,developer:42}),{...MORE_FILTERS,beds:'3'});
 assert.equal(moreFilterCount({beds:'3',sizeMin:'500',sizeMax:'900',newLaunch:true}),3);
 assert.equal(moreFilterCount(null),0);
});
test('new sorts: size and price per sqft both ways, completion latest first',()=>{
 assert.deepEqual(sortProjects(P,'size-desc').map(p=>p.id),['b','c','a','d']);
 assert.deepEqual(sortProjects(P,'size-asc').map(p=>p.id),['a','c','b','d']);
 assert.deepEqual(sortProjects(P,'psf-desc').map(p=>p.id),['a','c','b','d']);
 assert.deepEqual(sortProjects(P,'completion-desc').map(p=>p.id),['b','c','a','d']);
});
