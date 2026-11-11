import test from 'node:test';
import assert from 'node:assert/strict';
import {coordinates,nearbyQuery,nearbyPlaces,distanceMetres,NEARBY_CATEGORIES} from '../lib/nearby-places.js';

test('nearby searches accept only finite coordinates and cannot inject Overpass syntax',()=>{
 for(const pair of [[null,100],['',100],[' ',100],[91,100],[5,181],['5);out;',100],[Infinity,100]]){assert.equal(coordinates(...pair),null);assert.throws(()=>nearbyQuery(...pair))}
 assert.deepEqual(coordinates('5.4','100.3'),[5.4,100.3]);
 const query=nearbyQuery(5.4,100.3);
 assert.match(query,/around:3000,5.4,100.3/);assert.match(query,/out center tags/);assert.match(query,/timeout:20/);
 assert.equal((query.match(/\[name\]/g)||[]).length,NEARBY_CATEGORIES.flatMap(c=>c.filters).length);
});

test('nearby results classify POIs, read way centres, reject invalid or distant rows, and deduplicate venues',()=>{
 const node=(id,name,lat=5.4,tags={amenity:'restaurant'})=>({type:'node',id,lat,lon:100.3,tags:{name,...tags}});
 const data={elements:[node(1,'Cafe A'),node(2,'Cafe A',5.4001),{type:'way',id:3,center:{lat:5.401,lon:100.3},tags:{name:'School A',amenity:'school'}},node(4,'Far away',6),node(5,''),node(6,'Unknown',5.4,{amenity:'bench'}),node(7,'Shop',5.4,{shop:'supermarket'}),node(8,'Clinic',5.4,{amenity:'clinic'}),node(9,'Bus',5.4,{highway:'bus_stop'}),node(10,'Park',5.4,{leisure:'park'}),node(11,'<img src=x onerror=alert(1)>'),{...node(12,'Bad'),lat:null}, {...node(13,'Unsafe'),type:'../evil'}]};
 const result=nearbyPlaces(data,5.4,100.3);
 assert.equal(result.food.length,2);assert.equal(result.food[0].name,'Cafe A');
 assert.equal(result.schools[0].id,'way/3');assert.ok(result.schools[0].distance>100);
 for(const category of ['shopping','healthcare','transport','leisure'])assert.equal(result[category].length,1);
 assert.equal(result.food[1].name,'<img src=x onerror=alert(1)>'); // Rendered through textContent, never HTML.
});

test('nearby results are nearest-first, capped per category, and distinguish errors from no matches',()=>{
 const elements=Array.from({length:40},(_,i)=>({type:'node',id:i+1,lat:5.4+(40-i)*.0001,lon:100.3,tags:{name:`Place ${i}`,amenity:'restaurant'}}));
 const result=nearbyPlaces({elements},5.4,100.3);
 assert.equal(result.food.length,30);assert.equal(result.food[0].name,'Place 39');
 assert.deepEqual(nearbyPlaces({elements:[]},5.4,100.3).food,[]);
 assert.throws(()=>nearbyPlaces({elements:[],remark:'runtime error: timeout'},5.4,100.3));
 assert.throws(()=>nearbyPlaces({},5.4,100.3));
 assert.equal(distanceMetres([5.4,100.3],[5.4,100.3]),0);
});

import {createNearbyLoader} from '../lib/nearby-service.js';
test('nearby loader coalesces visitors and caches only successful searches for a day',async()=>{
 let calls=0,time=0,resolve;
 const loader=createNearbyLoader({now:()=>time,fetcher:async()=>{calls++;await new Promise(r=>resolve=r);return {ok:true,json:async()=>({elements:[]})}}});
 const first=loader(5.4,100.3),second=loader(5.4,100.3);assert.equal(calls,1);resolve();
 assert.deepEqual(await first,await second);await loader(5.4,100.3);assert.equal(calls,1);
 time=86400001;const fresh=loader(5.4,100.3);assert.equal(calls,2);resolve();await fresh;
});
test('upstream errors and partial results back off without being saved as no matches',async()=>{
 let calls=0,time=0;
 const loader=createNearbyLoader({now:()=>time,fetcher:async()=>{calls++;return {ok:true,json:async()=>calls===1?{elements:[],remark:'runtime error: timeout'}:{elements:[]}}}});
 await assert.rejects(loader(5.4,100.3));await assert.rejects(loader(5.4,100.3),/cooling down/);assert.equal(calls,1);
 time=60001;const result=await loader(5.4,100.3);assert.equal(result.food.length,0);assert.equal(calls,2);
});
test('upstream HTTP rejection is surfaced and concurrency stays bounded',async()=>{
 const rejected=createNearbyLoader({fetcher:async()=>({ok:false,status:429})});await assert.rejects(rejected(5.4,100.3));
 const done=[];let calls=0;
 const loader=createNearbyLoader({fetcher:async()=>{calls++;await new Promise(r=>done.push(r));return {ok:true,json:async()=>({elements:[]})}}});
 const a=loader(5.4,100.3),b=loader(5.5,100.3);await assert.rejects(loader(5.6,100.3),/busy/);assert.equal(calls,2);
 done.forEach(resolve=>resolve());await Promise.all([a,b]);
});
