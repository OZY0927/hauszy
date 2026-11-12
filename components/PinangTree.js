import styles from './PinangTree.module.css';

// A transparent 3D-rendered icon with lightweight web motion (no 3D runtime).
export default function PinangTree({size=180,animated=true,decorative=false,className=''}){
 return <span className={`${styles.tree} ${animated?styles.animated:''} ${className}`} style={{width:size}} aria-hidden={decorative?true:undefined}>
  <img src="/images/pinang-tree-3d.webp" width={1254} height={1254} alt={decorative?'':'Pinang tree with green fronds and orange areca nuts'} loading="lazy" decoding="async" draggable={false}/>
 </span>;
}
