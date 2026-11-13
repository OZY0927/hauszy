import styles from './PenangFlag.module.css';

const STRIPS=40;
// Phase-shifted fabric strips carry the wave across the flag; the hoist barely moves.
export default function PenangFlag({size=180,animated=true,decorative=false,className='',src='/images/penang-flag-only-3d.webp',loading='lazy'}){
 return <span className={`${styles.flag} ${animated?styles.animated:''} ${className}`} style={{width:size,'--flag-image':`url("${src}")`}} aria-hidden={decorative?true:undefined}>
  <img src={src} width={1536} height={1024} alt={decorative?'':'Penang state flag with blue, white and yellow bands and an areca palm emblem'} loading={loading} decoding="async" draggable={false}/>
  {animated&&<span className={styles.fabric} aria-hidden="true">{Array.from({length:STRIPS},(_,index)=><span key={index} className={styles.strip} style={{left:`${index/STRIPS*100}%`,width:`calc(${100/STRIPS}% + .4px)`,backgroundPosition:`${index/(STRIPS-1)*100}% 50%`,'--amplitude':`${(Math.pow(index/(STRIPS-1),1.2)*2.8).toFixed(3)}cqw`,'--delay':`${(-index*.075).toFixed(3)}s`,'--bend':`${(index/(STRIPS-1)*8).toFixed(2)}deg`}}/>)}</span>}
 </span>;
}
