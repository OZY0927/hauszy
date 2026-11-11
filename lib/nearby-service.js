import {nearbyQuery,nearbyPlaces} from './nearby-places.js';

// Cache only validated results. An upstream timeout is never cached as an empty map.
export function createNearbyLoader({fetcher=fetch,now=Date.now}={}){
 const cache=new Map(),pending=new Map(),cooldowns=new Map();
 return async function loadNearby(lat,lng){
  const key=`${lat},${lng}`,saved=cache.get(key);
  if(saved&&saved.expires>now())return saved.data;
  if((cooldowns.get(key)||0)>now())throw Error('Nearby search is cooling down');
  if(pending.has(key))return pending.get(key);
  if(pending.size>=2)throw Error('Nearby search is busy');
  const task=(async()=>{
   const response=await fetcher('https://overpass.private.coffee/api/interpreter',{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json','User-Agent':'Hauszy/1.0 (+https://github.com/OZY0927/hauszy)'},
    body:new URLSearchParams({data:nearbyQuery(lat,lng)}).toString(),
    cache:'no-store',signal:AbortSignal.timeout(45000)
   });
   if(!response.ok)throw Error('Nearby search unavailable');
   return nearbyPlaces(await response.json(),lat,lng);
  })();
  pending.set(key,task);
  try{
   const data=await task;
   if(cache.size>=200)cache.delete(cache.keys().next().value);
   cache.set(key,{data,expires:now()+86400000});cooldowns.delete(key);return data;
  }catch(error){
   if(cooldowns.size>=200)cooldowns.delete(cooldowns.keys().next().value);
   cooldowns.set(key,now()+60000);throw error;
  }finally{pending.delete(key)}
 };
}
