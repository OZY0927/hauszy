import LandmarkLoading from './LandmarkLoading';
import styles from './KekLokSi.module.css';

const src='/images/kek-lok-si-3d.webp';
export default function KekLokSi({size=180,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':'3D miniature of the Guanyin statue and pavilion at Kek Lok Si, Penang'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function KekLokSiLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed}/>;
}
