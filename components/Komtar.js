import styles from './Komtar.module.css';

export default function Komtar({size=180,animated=true,decorative=false,className=''}){
 return <span className={`${styles.icon} ${animated?styles.animated:''} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src="/images/komtar-3d-v3.webp" width={768} height={768} alt={decorative?'':'3D miniature of Komtar Tower in Penang'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
