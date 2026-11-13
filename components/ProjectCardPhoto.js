'use client';
import {useState} from 'react';
import Image from 'next/image';
import {isOptimizedImage} from '../lib/media';
import PreviewImage from './PreviewImage';
import styles from './ProjectCardPhoto.module.css';

export default function CardPhoto({src,alt}){
 const [failedSrc,setFailedSrc]=useState(null);
 const available=src&&src!==failedSrc;
 if(available&&!isOptimizedImage(src))return <PreviewImage key={src} src={src} alt={alt} loading="lazy" onError={()=>setFailedSrc(src)}/>;
 if(available)return <Image src={src} alt={alt} fill sizes="(max-width: 800px) 100vw, (max-width: 1280px) 33vw, 400px" onError={()=>setFailedSrc(src)}/>;
 return <><img src="/images/project-card-placeholder-v2.webp" alt={`Architectural illustration — photos coming soon for ${alt||'this project'}`} loading="lazy" decoding="async"/><span className={styles.label}>Photos coming soon</span></>;
}
