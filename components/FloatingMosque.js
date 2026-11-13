import LandmarkLoading from './LandmarkLoading';
import styles from './FloatingMosque.module.css';

const src='/images/floating-mosque-3d.webp';
export default function FloatingMosque({size=180,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':'3D miniature of the blue-domed floating mosque in Tanjung Bungah, Penang'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function FloatingMosqueLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed}/>;
}
