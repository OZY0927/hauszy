import styles from './loading.module.css';

export default function ProjectLoading(){
 return <div className={styles.loading} role="status" aria-live="polite" aria-label="Loading project details">
  <div className={styles.content}>
   <svg className={styles.mark} viewBox="0 0 160 160" aria-hidden="true" focusable="false">
    <defs><clipPath id="project-loading-h"><text x="80" y="132" textAnchor="middle" className={styles.letter}>H</text></clipPath></defs>
    <g clipPath="url(#project-loading-h)">
     <rect width="160" height="160" fill="currentColor" opacity=".15"/>
     <path className={styles.backWave} opacity=".3" d="M-160 75 Q-120 55 -80 75 T0 75 T80 75 T160 75 T240 75 T320 75 V180 H-160 Z"/>
     <path className={styles.wave} d="M-160 95 Q-120 75 -80 95 T0 95 T80 95 T160 95 T240 95 T320 95 V180 H-160 Z"/>
    </g>
   </svg>
   <p>Loading project details<span aria-hidden="true">…</span></p>
  </div>
 </div>;
}
