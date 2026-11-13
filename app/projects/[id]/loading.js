'use client';
import {useEffect,useState} from 'react';
import PinangTreeLoading from '../../../components/PinangTreeLoading';
import KomtarLoading from '../../../components/KomtarLoading';
import {PenangBridgeLoading} from '../../../components/PenangBridge';
import {KekLokSiLoading} from '../../../components/KekLokSi';
import {FloatingMosqueLoading} from '../../../components/FloatingMosque';
import {HinduTempleLoading} from '../../../components/HinduTemple';
import {PenangChurchLoading} from '../../../components/PenangChurch';
import {HeritageHouseLoading} from '../../../components/HeritageHouse';
import {PenangHillLoading} from '../../../components/PenangHill';
import {ChineseTempleLoading} from '../../../components/ChineseTemple';
import {PenangTrishawLoading} from '../../../components/PenangTrishaw';
import {PROJECT_LOADING_IMAGES,randomProjectLoadingIcon} from '../../../lib/project-loading-icons';
import styles from './loading.module.css';
const LANDMARK_LOADERS={komtar:KomtarLoading,bridge:PenangBridgeLoading,kekLokSi:KekLokSiLoading,mosque:FloatingMosqueLoading,hinduTemple:HinduTempleLoading,church:PenangChurchLoading,heritageHouse:HeritageHouseLoading,penangHill:PenangHillLoading,trishaw:PenangTrishawLoading,chineseTemple:ChineseTempleLoading};

export default function ProjectLoading({revealing=false,listing=false,celebrating=false,icon}){
 const [choice,setChoice]=useState('tree');
 useEffect(()=>{if(!icon)setChoice(randomProjectLoadingIcon())},[icon]);
 const selected=icon||choice,label=celebrating?'Ready to explore':listing?'Loading projects':'Loading project details';
 const LandmarkLoader=LANDMARK_LOADERS[selected];
 return <div className={`${styles.loading}${revealing?' '+styles.revealing:''}`} role="status" aria-live="polite" aria-label={label}>
  <div className={styles.content}>
   <link rel="preload" as="image" href={PROJECT_LOADING_IMAGES[selected]}/>
   <div className={styles.artwork}>
    {LandmarkLoader?<LandmarkLoader completed={celebrating}/>:<PinangTreeLoading flag={selected==='flag'} completed={celebrating}/>}
    {celebrating&&<div className={styles.fireworks} aria-hidden="true">{[0,1,2].map(burst=><div className={styles.burst} key={burst} style={{'--burst':burst}}>{Array.from({length:12},(_,spark)=><i key={spark} style={{'--angle':`${spark*30}deg`}}/>)}</div>)}</div>}
   </div>
   <p>{label}{!celebrating&&<span aria-hidden="true">…</span>}</p>
  </div>
 </div>;
}
