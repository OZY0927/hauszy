import PinangTreeLoading from './PinangTreeLoading';
import LandmarkLoading from './LandmarkLoading';
import {PROJECT_LOADING_IMAGES,PROJECT_LOADING_SIZES} from '../lib/project-loading-icons';
import styles from '../app/projects/[id]/loading.module.css';

export default function ProjectLoading({revealing=false,listing=false,celebrating=false,icon='tree',navigation=false}){
 const selected=PROJECT_LOADING_IMAGES[icon]?icon:'tree',label=celebrating?'Ready to explore':listing?'Loading projects':'Loading project details';
 const [width=112,mobileWidth=96]=PROJECT_LOADING_SIZES[selected]||[];
 return <div className={`${styles.loading}${revealing?' '+styles.revealing:''}`} data-project-navigation-loading={navigation?'':undefined} data-project-route-fallback={!navigation?'':undefined} role="status" aria-live="polite" aria-label={label}>
  <div className={styles.content}>
   <link rel="preload" as="image" href={PROJECT_LOADING_IMAGES[selected]}/>
   <div className={styles.artwork}>
    {selected==='flag'?<PinangTreeLoading flag completed={celebrating}/>:<LandmarkLoading src={PROJECT_LOADING_IMAGES[selected]} width={width} mobileWidth={mobileWidth} completed={celebrating}/>}
    {celebrating&&<div className={styles.fireworks} aria-hidden="true">{[0,1,2].map(burst=><div className={styles.burst} key={burst} style={{'--burst':burst}}>{Array.from({length:12},(_,spark)=><i key={spark} style={{'--angle':`${spark*30}deg`}}/>)}</div>)}</div>}
   </div>
   <p>{label}{!celebrating&&<span aria-hidden="true">…</span>}</p>
  </div>
 </div>;
}
