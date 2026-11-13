import LandmarkLoading from './LandmarkLoading';
import styles from './HinduTemple.module.css';

const src='/images/hindu-temple-3d.webp';
export default function HinduTemple({size=180,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':'3D miniature of a cream-and-gold Hindu temple entrance in Penang'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function HinduTempleLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed}/>;
}
