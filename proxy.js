import {NextResponse} from 'next/server';
import {securityHeaders} from './lib/security-headers';
import {firebaseConfig} from './lib/firebase-config';
import {isPublicProject} from './lib/publication';
import {isProjectUuid,legacyProjectSlug,projectHref,projectUrlSegment} from './lib/project-links';

async function legacyProject(id){
 if(legacyProjectSlug(id))return {id};
 try{
  const root=`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/publicProjects/`;
  const response=await fetch(root+encodeURIComponent(id),{signal:AbortSignal.timeout(3500)});
  if(!response.ok)return null;
  const {fields={}}=await response.json();
  const project={id};
  for(const key of ['status','publicSlug','title','sinkingFund','facilities'])project[key]=fields[key]?.stringValue;
  return isPublicProject(project)?project:null;
 }catch{return null}
}

export async function proxy(request){
 const path=request.nextUrl.pathname;
 if(!path.startsWith('/admin')){
  const legacyPage=path==='/property.html';
  const id=legacyPage?request.nextUrl.searchParams.get('id'):/^\/projects\/([A-Za-z0-9_-]{1,128})\/?$/.exec(path)?.[1];
  if(!id||!(legacyProjectSlug(id)||isProjectUuid(id)||(legacyPage&&/^[A-Za-z0-9_-]{1,128}$/.test(id))))return NextResponse.next();
  const project=await legacyProject(id);
  if(!project||(!legacyPage&&projectUrlSegment(project)===id))return NextResponse.next();
  const destination=new URL(projectHref(project),request.url);
  destination.search=request.nextUrl.search;
  if(legacyPage)destination.searchParams.delete('id');
  return NextResponse.redirect(destination,308);
 }
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
 const policy=securityHeaders(process.env.NODE_ENV==='production',nonce).find(h=>h.key==='Content-Security-Policy').value;
 const headers=new Headers(request.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers}});
 response.headers.set('Content-Security-Policy',policy);
 response.headers.set('Cache-Control','private, no-store, no-transform');
 return response;
}
export const config={matcher:['/admin/:path*','/projects/:segment([0-9a-fA-F-]{36})','/property.html']};
