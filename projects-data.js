import {firebaseConfig} from './admin/firebase-config.js';
export function normaliseProject(data,id){
 const units=Array.isArray(data.units)?data.units:[],first=units[0]||{};
 return {...data,id:String(id),name:data.name||'Untitled project',title:data.title||data.name||'Discover this project',location:data.location||'Location to be confirmed',type:data.type||'Property',mode:data.mode||'Project',tag:data.tenure||data.tag||'To be confirmed',price:Number(data.price)||0,beds:first.bedrooms??'—',baths:first.bathrooms??'—',size:first.size||'—',units,images:Array.isArray(data.images)?data.images.filter(url=>typeof url==='string'&&url.startsWith('https://')):[],facilities:Array.isArray(data.facilities)?data.facilities:typeof data.facilities==='string'?data.facilities.split(/[,\n]/).map(v=>v.trim()).filter(Boolean):[],nearbyAmenities:Array.isArray(data.nearbyAmenities)?data.nearbyAmenities:[]};
}
export async function loadPublishedProjects(){
 if(!firebaseConfig)throw Error('Project service is not configured.');
 const base='https://www.gstatic.com/firebasejs/13.1.0/';
 const [app,store]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-firestore.js')]);
 const instance=app.getApps().length?app.getApp():app.initializeApp(firebaseConfig);
 const snapshot=await Promise.race([store.getDocsFromServer(store.query(store.collection(store.getFirestore(instance),'publicProjects'),store.where('status','==','Published'))),new Promise((_,reject)=>setTimeout(()=>reject(Error('Project loading timed out.')),15000))]);
 return snapshot.docs.map(doc=>normaliseProject(doc.data(),doc.id));
}
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeDisplay(value){if(typeof value==='string')return escapeHtml(value);if(Array.isArray(value))return value.map(safeDisplay);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,safeDisplay(v)]));return value}
export const cover=project=>project.images?.[0]||'project-placeholder.svg';

export async function loadPublishedProject(id){
 if(!id)return null;
 const base='https://www.gstatic.com/firebasejs/13.1.0/';
 const [app,store]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-firestore.js')]);
 const instance=app.getApps().length?app.getApp():app.initializeApp(firebaseConfig);
 const snapshot=await Promise.race([store.getDocFromServer(store.doc(store.getFirestore(instance),'publicProjects',id)),new Promise((_,reject)=>setTimeout(()=>reject(Error('Project loading timed out.')),15000))]);
 return snapshot.exists()&&snapshot.data().status==='Published'?normaliseProject(snapshot.data(),snapshot.id):null;
}
