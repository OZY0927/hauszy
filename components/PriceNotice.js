'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './PriceNotice.module.css';

const DISMISSED_KEY='hauszy:spa-price-notice-dismissed';
export default function PriceNotice({children}){
 const dialog=useRef(null),timer=useRef(null),previousOverflow=useRef(null);
 const [mounted,setMounted]=useState(false),[closing,setClosing]=useState(false);
 const title=useId(),description=useId();
 function restoreScroll(){if(previousOverflow.current!==null){document.body.style.overflow=previousOverflow.current;previousOverflow.current=null}}
 function open(){if(!dialog.current||dialog.current.open)return;setClosing(false);previousOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current.showModal()}
 function close(){
  if(closing)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){dialog.current.close();return}
  setClosing(true);timer.current=setTimeout(()=>dialog.current?.close(),220);
 }
 useEffect(()=>{setMounted(true);return()=>{clearTimeout(timer.current);restoreScroll()}},[]);
 function dismiss(){try{localStorage.setItem(DISMISSED_KEY,'true')}catch{}close()}
 useEffect(()=>{
  if(!mounted)return;
  const path=location.pathname.replace(/\/$/,'');
  if(window.__hauszyPriceNoticePath!==path)return;
  let arrival;
  const showWhenReady=()=>{
   if(window.__hauszyPriceNoticePath!==path)return;
   try{if(localStorage.getItem(DISMISSED_KEY)==='true'){window.__hauszyPriceNoticePath=null;return}}catch{}
   if(document.querySelector('[data-project-navigation-loading],[data-project-route-fallback],dialog[open]')){arrival=setTimeout(showWhenReady,200);return}
   window.__hauszyPriceNoticePath=null;open();
  };
  arrival=setTimeout(showWhenReady,300);
  return()=>clearTimeout(arrival);
 },[mounted]);
 return <><div className={styles.trigger}>{children}<span className={styles.priceLabel}>SPA price</span></div>{mounted&&createPortal(
  <dialog ref={dialog} className={styles.dialog} data-closing={closing} aria-labelledby={title} aria-describedby={description} onCancel={event=>{event.preventDefault();close()}} onClose={()=>{clearTimeout(timer.current);restoreScroll();setClosing(false)}}>
   <div className={styles.art} aria-hidden="true"><div className={styles.orbit}/><img src="/images/nyonya-notice-3d.png" width={1280} height={1280} alt=""/></div>
   <div className={styles.copy}><span className={styles.eyebrow}>A LITTLE NOTE ON PRICING</span><h2 id={title}>The price.<br/><em>The possibilities.</em></h2><p id={description}>The prices shown are <strong>Sale and Purchase Agreement (SPA) prices.</strong> For the latest promotions and available packages, please contact us to find out more.</p><button type="button" className={styles.close} onClick={close} autoFocus>Close <span aria-hidden="true">×</span></button><button type="button" className={styles.dismiss} onClick={dismiss}>Do not show again</button></div>
  </dialog>,document.body)}</>;
}
