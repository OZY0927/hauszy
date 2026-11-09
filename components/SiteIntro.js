'use client';
import {useEffect,useState} from 'react';
import BrandLoader from './BrandLoader';

// A short first-load brand reveal; client-side navigation uses app/loading.js.
export default function SiteIntro(){
 const [visible,setVisible]=useState(true);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(media.matches){setVisible(false);return}
  const timer=setTimeout(()=>setVisible(false),1300);
  return()=>clearTimeout(timer);
 },[]);
 return visible?<BrandLoader intro/>:null;
}
