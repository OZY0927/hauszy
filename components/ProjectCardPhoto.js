'use client';
import {useState} from 'react';
import Image from 'next/image';
import {isOptimizedImage} from '../lib/media';
import {IMAGE_UNAVAILABLE_PORTRAIT} from '../lib/project';
import PreviewImage from './PreviewImage';

// A project's cover photo, or the "Image unavailable" artwork when there is none or it cannot load.
export default function CardPhoto({src,alt}){
 const [failedSrc,setFailedSrc]=useState(null);
 const available=src&&src!==failedSrc;
 if(available&&!isOptimizedImage(src))return <PreviewImage key={src} src={src} alt={alt} loading="lazy" onError={()=>setFailedSrc(src)}/>;
 if(available)return <Image src={src} alt={alt} fill sizes="(max-width: 800px) 100vw, (max-width: 1280px) 33vw, 400px" onError={()=>setFailedSrc(src)}/>;
 return <img src={IMAGE_UNAVAILABLE_PORTRAIT} alt={`Image unavailable for ${alt||'this project'}`} loading="lazy" decoding="async"/>;
}
