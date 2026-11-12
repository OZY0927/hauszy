'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
// Fades sections and cards in as they scroll into view. Page headings animate in CSS on load instead (see globals.css),
// so nothing already on screen flickers, including content discovered after hydration.
// Content stays visible without JS or with reduced motion.
const TARGETS='.search-wrap,.section-heading,.listing-toolbar,.cards>.card,.property-gallery,.property-content>section,.amenity-grid>div,.unit-preview,.nearby-category,.enquiry-card,.about>div,.agent-card,.success-gallery>figure,.lc-panel,.lc-hero,.footer-main>*,[data-reveal]';
export default function Motion(){const path=usePathname();useEffect(()=>{
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.documentElement.classList.add('motion-ready');
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const el=e.target;io.unobserve(el);el.classList.add('in-view');setTimeout(()=>{el.classList.remove('reveal','in-view');el.style.removeProperty('--reveal-delay')},900+(parseInt(el.style.getPropertyValue('--reveal-delay'))||0))}},{rootMargin:'0px 0px -6% 0px',threshold:.06});
  const revealed=new WeakSet();
  let frame=0;const scan=()=>{frame=0;for(const el of document.querySelectorAll(TARGETS)){if(revealed.has(el)||el.closest('[data-motion-pending],.project-story'))continue;revealed.add(el);if(el.getBoundingClientRect().top<innerHeight)continue;const peers=[...el.parentElement.children].filter(s=>s.matches(TARGETS));el.style.setProperty('--reveal-delay',Math.min(peers.indexOf(el),5)*80+'ms');el.classList.add('reveal');io.observe(el)}};
  scan();const mo=new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(scan)});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-motion-pending']});
  return()=>{io.disconnect();mo.disconnect();cancelAnimationFrame(frame);for(const el of document.querySelectorAll('.reveal:not(.in-view)'))el.classList.remove('reveal')}},[path]);return null}
