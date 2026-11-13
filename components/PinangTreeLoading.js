import LandmarkLoading from './LandmarkLoading';
import styles from './PinangTreeLoading.module.css';
import PenangFlag from './PenangFlag';

export default function PinangTreeLoading({flag=false,completed=false}){
 if(flag)return <div className={`${styles.tree} ${styles.flag} ${completed?styles.complete:''}`} aria-hidden="true">
  <div className={styles.empty}><PenangFlag size="100%" decorative/></div>
  <div className={styles.fill}><PenangFlag size="100%" decorative/></div>
 </div>;
 return <LandmarkLoading src="/images/pinang-tree-3d.webp" completed={completed}/>;
}
