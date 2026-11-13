'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {flushSync} from 'react-dom';
import ProjectLoading from './ProjectLoading';
import {randomProjectLoadingIcon} from '../lib/project-loading-icons';
import {createLoadingIconPreloader} from '../lib/loading-icon-preload';

const cleanPath=path=>path.replace(/\/$/,'');
const projectPath=path=>/^\/projects(?:\/[^/]+)?$/.test(path);
export default function ProjectNavigationLoading(){
 const pathname=usePathname();
 const [kind,setKind]=useState(()=>projectPath(cleanPath(pathname))?(cleanPath(pathname)==='/projects'?'listing':'details'):null);
 const [revealing,setRevealing]=useState(false),[celebrating,setCelebrating]=useState(false),[icon,setIcon]=useState('tree');
 const controller=useRef(null),destination=useRef(null),committed=useRef(cleanPath(pathname));
 useEffect(()=>{
  let timer,exitTimer,safetyTimer,warmTimer,running=false,completing=false,started=0,disposed=false,nextIcon='tree';
  const preload=createLoadingIconPreloader(window.Image);
  const warmNext=()=>{const candidate=randomProjectLoadingIcon();preload(candidate).then(ready=>{if(ready&&!disposed)nextIcon=candidate})};
  warmTimer=setTimeout(warmNext,150);
  const observer=new MutationObserver(()=>check());
  const clear=()=>{clearTimeout(timer);clearTimeout(exitTimer);clearTimeout(safetyTimer)};
  const finish=()=>{clear();observer.disconnect();running=false;completing=false;setKind(null);setRevealing(false);setCelebrating(false)};
  const check=()=>{
   if(!running||completing||committed.current!==destination.current)return;
   const failed=!!document.querySelector('main.property-missing');
   const ready=failed||(destination.current==='/projects'?document.querySelector('main.projects-page'):document.querySelector('main.project-story[data-images-ready="true"]:not([data-motion-pending])'));
   if(!ready)return;
   completing=true;clearTimeout(safetyTimer);observer.disconnect();
   timer=setTimeout(()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(failed||reduced){setRevealing(true);exitTimer=setTimeout(finish,150);return}
    setCelebrating(true);
    timer=setTimeout(()=>{setRevealing(true);exitTimer=setTimeout(finish,450)},900);
   },Math.max(0,150-(performance.now()-started)));
  };
  const start=path=>{
   if(running&&destination.current===path)return;
   clear();running=true;completing=false;started=performance.now();destination.current=path;
   setRevealing(false);setCelebrating(false);setIcon(nextIcon);setKind(path==='/projects'?'listing':'details');
   observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-motion-pending','data-images-ready']});
   clearTimeout(warmTimer);warmTimer=setTimeout(warmNext,150);
   // Never cover a stalled/failed navigation indefinitely; the route's own fallback can continue.
   safetyTimer=setTimeout(finish,15000);check();
  };
  controller.current={start,check,cancel:()=>{destination.current=null;finish()}};
  const click=event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest?.('a[href]');
   if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
   const url=new URL(link.href,location.href),path=cleanPath(url.pathname);
   if(url.origin!==location.origin||!/^\/projects(?:\/[^/]+)?$/.test(path)||path===cleanPath(location.pathname))return;
   // Capture before Next Link consumes the click; navigation proceeds behind the overlay.
   flushSync(()=>start(path));
  };
  const history=()=>{const path=cleanPath(location.pathname);if(projectPath(path))start(path);else controller.current?.cancel()};
  document.addEventListener('click',click,true);
  window.addEventListener('popstate',history);
  return()=>{disposed=true;clearTimeout(warmTimer);clear();observer.disconnect();controller.current=null;document.removeEventListener('click',click,true);window.removeEventListener('popstate',history)};
 },[]);
 useEffect(()=>{
  const path=cleanPath(pathname);
  committed.current=path;
  // Covers direct visits and programmatic navigation as well as links and history.
  if(projectPath(path)){
   if(destination.current!==path)controller.current?.start(path);
   else controller.current?.check();
  }else controller.current?.cancel();
 },[pathname]);
 return kind?<ProjectLoading navigation listing={kind==='listing'} icon={icon} celebrating={celebrating} revealing={revealing}/>:null;
}
