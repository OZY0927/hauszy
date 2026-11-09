'use client';
import {useEffect,useRef} from 'react';
import Icon from './Icon';
export default function FooterFrame({children}){
 const root=useRef(null);
 useEffect(()=>{const el=root.current;if(!el||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;el.classList.add('footer-animated');const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){el.classList.add('footer-revealed');observer.disconnect()}},{threshold:.08});observer.observe(el.querySelector('.footer-wordmark')||el);return()=>observer.disconnect()},[]);
 return <footer className="site-footer footer-editorial" ref={root}>{children}</footer>;
}
export function FooterBackTop(){return <button type="button" className="footer-back-top" onClick={()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('header a[href="/"]')?.focus({preventScroll:true})}}>Back to top <span className="footer-back-top-icon"><Icon name="arrowUp"/></span></button>}
