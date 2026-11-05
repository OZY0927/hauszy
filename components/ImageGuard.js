'use client';
import {useEffect} from 'react';
// Stops the right-click menu (Save image, Open in new tab, Copy image address) and drag-to-save on images.
// A deterrent only: anything a browser can display can still be screenshotted or taken from developer tools.
export default function ImageGuard(){
 useEffect(()=>{
  const block=e=>{if(e.target instanceof Element&&e.target.closest('img,.gallery-tile')&&!location.pathname.startsWith('/admin'))e.preventDefault()};
  for(const name of ['contextmenu','dragstart'])document.addEventListener(name,block);
  return()=>{for(const name of ['contextmenu','dragstart'])document.removeEventListener(name,block)};
 },[]);
 return null;
}
