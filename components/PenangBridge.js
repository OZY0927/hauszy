import LandmarkLoading from './LandmarkLoading';
import styles from './PenangBridge.module.css';

const src='/images/penang-bridge-3d.webp';
export default function PenangBridge({size=240,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="512" alt={decorative?'':'3D miniature of the first Penang Bridge'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function PenangBridgeLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed} width={168} mobileWidth={144}/>;
}
