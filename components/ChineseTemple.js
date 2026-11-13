import LandmarkLoading from './LandmarkLoading';
import styles from './ChineseTemple.module.css';

const src='/images/chinese-temple-3d.webp';
export default function ChineseTemple({size=240,decorative=false,className=''}){
 return <span className={`${styles.icon} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src={src} width="768" height="384" alt={decorative?'':'3D miniature of a Penang Chinese temple with dragon roof ornaments and red lanterns'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
export function ChineseTempleLoading({completed=false}){
 return <LandmarkLoading src={src} completed={completed} width={184} mobileWidth={158}/>;
}
