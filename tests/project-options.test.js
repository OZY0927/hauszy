import test from 'node:test';
import assert from 'node:assert/strict';
import {projectOptions} from '../lib/project-options.js';
test('initial options include existing project and legacy dropdown values',()=>{
 const options=projectOptions(null,[{type:'Bungalow',mode:'Hot selling',units:[{configuration:'Custom layout'}],nearbyAmenities:[{category:'Parks'}]}],{mode:['Local category']});
 assert.ok(options.type.includes('Condominium'));assert.ok(options.type.includes('Bungalow'));assert.deepEqual(options.mode,['Hot selling','Local category']);assert.ok(options.configuration.includes('Custom layout'));assert.ok(options.amenityCategory.includes('Parks'));
});
test('saved option lists replace defaults and do not resurrect removed values',()=>{
 const options=projectOptions({type:[' Studio ','Studio'],mode:[],configuration:['Custom']},[{type:'Bungalow',mode:'Old category'}]);
 assert.deepEqual(options.type,['Studio']);assert.deepEqual(options.mode,[]);assert.deepEqual(options.configuration,['Custom']);assert.ok(options.tenure.includes('Freehold'));
});
