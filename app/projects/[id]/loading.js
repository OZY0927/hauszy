import PinangTreeLoading from '../../../components/PinangTreeLoading';
import styles from './loading.module.css';

export default function ProjectLoading({revealing=false,listing=false}){
 const label=listing?'Loading projects':'Loading project details';
 return <div className={`${styles.loading}${revealing?' '+styles.revealing:''}`} role="status" aria-live="polite" aria-label={label}>
  <div className={styles.content}>
   <link rel="preload" as="image" href={listing?'/images/penang-flag-only-3d.webp':'/images/pinang-tree-3d.webp'}/>
   <PinangTreeLoading flag={listing}/>
   <p>{label}<span aria-hidden="true">…</span></p>
  </div>
 </div>;
}
