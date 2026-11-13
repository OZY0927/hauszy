import LandmarkLoading from './LandmarkLoading';
import styles from './HeritageHouse.module.css';

const src='/images/wall-art-3d-v2.webp';
export default function WallArt({size=180,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':'3D Penang street-art miniature of two children riding a bicycle'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function WallArtLoading({completed=false}){
 return <LandmarkLoading src="/images/loading/wallArt-v2.webp" completed={completed}/>;
}
