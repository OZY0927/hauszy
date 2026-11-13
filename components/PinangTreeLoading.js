import LandmarkLoading from './LandmarkLoading';
import styles from './PinangTreeLoading.module.css';
import PenangFlag from './PenangFlag';
import {PROJECT_LOADING_IMAGES} from '../lib/project-loading-icons';

export default function PinangTreeLoading({flag=false,completed=false}){
 if(flag)return <div className={`${styles.tree} ${styles.flag} ${completed?styles.complete:''}`} aria-hidden="true">
  <div className={styles.empty}><PenangFlag size="100%" src={PROJECT_LOADING_IMAGES.flag} loading="eager" decorative/></div>
  <div className={styles.fill}><PenangFlag size="100%" src={PROJECT_LOADING_IMAGES.flag} loading="eager" decorative/></div>
 </div>;
 return <LandmarkLoading src={PROJECT_LOADING_IMAGES.tree} completed={completed}/>;
}
