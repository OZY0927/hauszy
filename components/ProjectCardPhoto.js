'use client';
import {useState} from 'react';
import Image from 'next/image';
import {isOptimizedImage} from '../lib/media';
import PreviewImage from './PreviewImage';
export default function CardPhoto({src,alt}){const [failed,setFailed]=useState(false);if(src&&!failed&&!isOptimizedImage(src))return <PreviewImage src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)}/>;return src&&!failed?<Image src={src} alt={alt} fill sizes="(max-width: 800px) 100vw, (max-width: 1280px) 33vw, 400px" onError={()=>setFailed(true)}/>:<img src="/project-placeholder.svg" alt={alt} loading="lazy"/>}
