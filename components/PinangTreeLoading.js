import styles from './PinangTreeLoading.module.css';
import PenangFlag from './PenangFlag';

export default function PinangTreeLoading({flag=false}){
 if(flag)return <div className={`${styles.tree} ${styles.flag}`} aria-hidden="true">
  <div className={styles.empty}><PenangFlag size="100%" decorative/></div>
  <div className={styles.fill}><PenangFlag size="100%" decorative/></div>
 </div>;
 const src=flag?'/images/penang-flag-only-3d.webp':'/images/pinang-tree-3d.webp';
 return <div className={styles.tree} aria-hidden="true">
  <div className={styles.sway}>
   <img className={styles.empty} src={src} alt="" width="160" height="160"/>
   <div className={styles.fill}><img src={src} alt="" width="160" height="160"/></div>
  </div>
 </div>;
}
