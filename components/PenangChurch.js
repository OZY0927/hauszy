import LandmarkLoading from './LandmarkLoading';
import styles from './PenangChurch.module.css';

const src='/images/penang-church-3d.webp';
export default function PenangChurch({size=180,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':"3D miniature of St George’s Church and its memorial pavilion in Penang"} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function PenangChurchLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed}/>;
}
