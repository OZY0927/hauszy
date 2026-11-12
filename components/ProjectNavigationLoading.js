'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {flushSync} from 'react-dom';
import ProjectLoading from '../app/projects/[id]/loading';

const cleanPath=path=>path.replace(/\/$/,'');
export default function ProjectNavigationLoading(){
 const pathname=usePathname();
 const [kind,setKind]=useState(()=>cleanPath(pathname)==='/projects'?'listing':null);
 const [revealing,setRevealing]=useState(false);
 const controller=useRef(null),destination=useRef(null);
 useEffect(()=>{
  let timer,exitTimer;
  const finish=()=>{clearTimeout(timer);clearTimeout(exitTimer);setKind(null);setRevealing(false)};
  const start=path=>{
   clearTimeout(timer);clearTimeout(exitTimer);
   destination.current=path;
   setRevealing(false);setKind(path==='/projects'?'listing':'details');
   timer=setTimeout(()=>{
    setRevealing(true);
    exitTimer=setTimeout(finish,matchMedia('(prefers-reduced-motion: reduce)').matches?150:900);
   },3000);
  };
  controller.current=start;
  const click=event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest?.('a[href]');
   if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
   const url=new URL(link.href,location.href),path=cleanPath(url.pathname);
   if(url.origin!==location.origin||!/^\/projects(?:\/[^/]+)?$/.test(path)||path===cleanPath(location.pathname))return;
   // Capture before Next Link consumes the click; navigation proceeds behind the overlay.
   flushSync(()=>start(path));
  };
  const history=()=>{const path=cleanPath(location.pathname);if(path==='/projects')start(path);else{destination.current=path;finish()}};
  document.addEventListener('click',click,true);
  window.addEventListener('popstate',history);
  return()=>{clearTimeout(timer);clearTimeout(exitTimer);controller.current=null;document.removeEventListener('click',click,true);window.removeEventListener('popstate',history)};
 },[]);
 useEffect(()=>{
  const path=cleanPath(pathname);
  // Covers direct visits and programmatic navigation as well as links and history.
  if(path==='/projects'&&destination.current!==path)controller.current?.(path);
  else if(path!=='/projects')destination.current=path;
 },[pathname]);
 return kind?<ProjectLoading key={kind} listing={kind==='listing'} revealing={revealing}/>:null;
}
