import 'server-only';
import {firebaseConfig} from './firebase-config';
import {normaliseProject} from './project';
const root=`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
export function decodeValue(v){if('nullValue'in v)return null;if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;if('booleanValue'in v)return v.booleanValue;if('timestampValue'in v)return v.timestampValue;if(v.arrayValue)return(v.arrayValue.values||[]).map(decodeValue);if(v.mapValue)return decodeFields(v.mapValue.fields||{});return null}
function decodeFields(fields){return Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,decodeValue(v)]))}
async function read(path,options={}){const response=await fetch(`${root}${path}`,{...options,cache:'no-store',signal:AbortSignal.timeout(12000)});if(response.status===404)return null;if(!response.ok)throw Error('Project data is temporarily unavailable. Please try again.');return response.json()}
// Anonymous REST reads honour the same deployed Firestore rules as the public SDK.
export async function getPublishedProjects(){const result=await read(':runQuery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'publicProjects'}],where:{fieldFilter:{field:{fieldPath:'status'},op:'EQUAL',value:{stringValue:'Published'}}}}})});return(result||[]).filter(r=>r.document).map(({document})=>normaliseProject(decodeFields(document.fields||{}),document.name.split('/').pop()))}
export async function getPublishedProject(id){const result=await read(`/publicProjects/${encodeURIComponent(id)}`);if(!result)return null;const data=decodeFields(result.fields||{});return data.status==='Published'?normaliseProject(data,id):null}
export async function getProfile(){const result=await read('/siteContent/about');return result?decodeFields(result.fields||{}):null}
