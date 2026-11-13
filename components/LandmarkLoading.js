import styles from './LandmarkLoading.module.css';

// Keep every landmark's fill and tilt identical; the flag retains its own motion.
export default function LandmarkLoading({src,completed=false,width=112,mobileWidth=96}){
 return <div className={`${styles.loading} ${completed?styles.complete:''}`} style={{'--icon-width':`${width}px`,'--icon-mobile-width':`${mobileWidth}px`}} aria-hidden="true">
  <div className={styles.sway}>
   <img className={styles.empty} src={src} alt="" draggable={false}/>
   <div className={styles.fill}><img src={src} alt="" draggable={false}/></div>
  </div>
 </div>;
}
