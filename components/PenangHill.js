import LandmarkLoading from './LandmarkLoading';
import styles from './PenangHill.module.css';

const src='/images/penang-hill-3d-v2.webp';
export default function PenangHill({size=200,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="768" alt={decorative?'':'3D miniature of the Penang Hill funicular on its arched stone railway viaduct'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function PenangHillLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed} width={136} mobileWidth={116}/>;
}
