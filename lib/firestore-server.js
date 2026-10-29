import 'server-only';
import {cache} from 'react';
import {firebaseConfig} from './firebase-config';
import {normaliseProject} from './project';
const root=`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
// Public reads are cached for 5 minutes and refreshed immediately when the admin saves (see app/api/revalidate).
export const REVALIDATE_SECONDS=300;
export const CACHE_TAGS=['projects','profile'];
export function decodeValue(v){if('nullValue'in v)return null;if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;if('booleanValue'in v)return v.booleanValue;if('timestampValue'in v)return v.timestampValue;if(v.arrayValue)return(v.arrayValue.values||[]).map(decodeValue);if(v.mapValue)return decodeFields(v.mapValue.fields||{});return null}
function decodeFields(fields){return Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,decodeValue(v)]))}
async function read(path,tag,options={}){const response=await fetch(`${root}${path}`,{...options,cache:'force-cache',next:{revalidate:REVALIDATE_SECONDS,tags:[tag]},signal:AbortSignal.timeout(12000)});if(response.status===404)return null;if(!response.ok)throw Error('Project data is temporarily unavailable. Please try again.');return response.json()}
// Anonymous REST reads honour the same deployed Firestore rules as the public SDK.
// React cache() shares one result per request between the page, its metadata and the footer.
export const getPublishedProjects=cache(async()=>{const result=await read(':runQuery','projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'publicProjects'}],where:{fieldFilter:{field:{fieldPath:'status'},op:'EQUAL',value:{stringValue:'Published'}}}}})});return(result||[]).filter(r=>r.document).map(({document})=>normaliseProject(decodeFields(document.fields||{}),document.name.split('/').pop()))});
export const getPublishedProject=cache(async id=>{const result=await read(`/publicProjects/${encodeURIComponent(id)}`,'projects');if(!result)return null;const data=decodeFields(result.fields||{});return data.status==='Published'?normaliseProject(data,id):null});
export const getProfile=cache(async()=>{const result=await read('/siteContent/about','profile');return result?decodeFields(result.fields||{}):null});
