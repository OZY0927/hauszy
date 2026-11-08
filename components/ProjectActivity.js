'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {CONSENT_KEY} from '../lib/analytics';
const projectId=path=>/^\/projects\/([a-zA-Z0-9_-]{1,128})\/?$/.exec(path)?.[1];
export default function ProjectActivity(){
 const path=usePathname();
 useEffect(()=>{
  if(path.startsWith('/admin'))return;
  let viewed=false;const recent=new Map();
  function accepted(){try{return localStorage.getItem(CONSENT_KEY)==='accepted'}catch{return false}}
  function send(id,event){
   if(!id||!accepted())return;
   const key=id+event,now=Date.now();if(now-(recent.get(key)||0)<1500)return;recent.set(key,now);
   fetch('/api/project-activity/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:id,event}),keepalive:true}).catch(()=>{});
  }
  function view(){if(!viewed&&accepted()&&projectId(path)){viewed=true;send(projectId(path),'view')}}
  function click(event){
   const target=event.target instanceof Element?event.target:null;if(!target)return;
   const link=target.closest('a[href]');
   if(link){const url=new URL(link.href,window.location.origin);if(url.origin===window.location.origin)send(projectId(url.pathname),'click')}
   const id=projectId(path);if(!id)return;
   if(target.closest('.floorplan-open,.floorplan-thumbs button'))send(id,'floor_plan');
   if(target.closest('.enquiry-options a,.enquiry-options button'))send(id,'contact');
  }
  view();document.addEventListener('click',click);window.addEventListener('hauszy-consent-change',view);window.addEventListener('storage',view);
  return ()=>{document.removeEventListener('click',click);window.removeEventListener('hauszy-consent-change',view);window.removeEventListener('storage',view)};
 },[path]);
 return null;
}
