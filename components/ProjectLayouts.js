'use client';
import {useEffect,useRef} from 'react';
import FloorPlanViewer from './FloorPlanViewer';
import Icon from './Icon';
import {money} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';

export default function ProjectLayouts({units,enquiry}){
 const root=useRef(null);
 useEffect(()=>{
  const section=root.current,cards=[...section.querySelectorAll('.layout-scroll-card')];
  const media=matchMedia('(min-width: 851px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
  let teardown=()=>{};
  const configure=()=>{
   teardown();
   if(!media.matches||cards.length<2)return;
   section.classList.add('stack-enabled');
   let frame=0,dirty=true,inView=true,heights=[],previous=cards.map(()=>-1);
   const schedule=()=>{if(inView&&!document.hidden&&!frame)frame=requestAnimationFrame(update)};
   const update=()=>{
    frame=0;
    if(!inView||document.hidden)return;
    // Complete geometry reads before changing any styles. Heights only change on resize/load.
    const measuring=dirty;
    if(measuring){heights=cards.map(card=>card.offsetHeight);dirty=false}
    const rects=cards.map(card=>card.getBoundingClientRect());
    const progress=rects.map((rect,index)=>{
     const next=rects[index+1];
     const amount=next?Math.max(0,Math.min(1,(rect.bottom-next.top)/Math.max(1,heights[index]))):0;
     return amount*amount*(3-2*amount);
    });
    cards.forEach((card,index)=>{
     // Keep the bottom controls reachable even when a card is taller than the viewport.
     if(measuring)card.style.setProperty('--stack-top',Math.min(100,innerHeight-heights[index]-90)+'px');
     if(Math.abs(progress[index]-previous[index])>.001){card.style.setProperty('--stack-progress',progress[index].toFixed(4));previous[index]=progress[index]}
    });
    if(measuring)schedule();
   };
   const measure=()=>{dirty=true;schedule()};
   const resize='ResizeObserver' in window?new ResizeObserver(measure):null;
   resize?.observe(section);cards.forEach(card=>resize?.observe(card));
   const visibility='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(entry.target===section){inView=entry.isIntersecting;if(inView)schedule();else{cancelAnimationFrame(frame);frame=0}}
     else entry.target.classList.toggle('is-stack-visible',entry.isIntersecting);
    }
   },{rootMargin:'200px 0px'}):null;
   visibility?.observe(section);cards.forEach(card=>{visibility?.observe(card);if(!visibility)card.classList.add('is-stack-visible')});
   window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);
   document.addEventListener('visibilitychange',measure);section.addEventListener('load',measure,true);
   schedule();
   teardown=()=>{
    cancelAnimationFrame(frame);resize?.disconnect();visibility?.disconnect();
    window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);
    document.removeEventListener('visibilitychange',measure);section.removeEventListener('load',measure,true);
    section.classList.remove('stack-enabled');
    cards.forEach(card=>{card.classList.remove('is-stack-visible');card.style.removeProperty('--stack-top');card.style.removeProperty('--stack-progress')});
   };
  };
  configure();media.addEventListener('change',configure);
  return()=>{media.removeEventListener('change',configure);teardown()};
 },[units]);
 return <section ref={root} className="project-story-layouts layout-studio layout-scroll-studio" id="units"><div className="project-story-section">
  <div className="layout-studio-heading" data-reveal><div><span className="eyebrow">EXPLORE THE LAYOUTS</span><h2>A space for<br/><em>every chapter.</em></h2></div><p>{units.length} {units.length===1?'layout':'layouts'} to explore.</p></div>

  <div className="layout-scroll-stack">{units.map((unit,index)=>{
   const facts=[['Built-up size',hasProjectInfo(unit.size)?unit.size+' sqft':null,'ruler'],['Bedrooms',unit.bedrooms,'bed'],['Bathrooms',unit.bathrooms,'bath'],['Car parks',unit.carParks,'car']].filter(([,value])=>hasProjectInfo(value));
   return <article className="layout-scroll-card" key={index} id={'unit-layout-'+index} style={{zIndex:index+1}}><div className={'layout-studio-stage'+(!unit.floorPlanUrls.length?' without-plan':'')}>
    <span className="layout-card-watermark" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
    <div className="layout-studio-details"><div className="layout-studio-detail-heading"><span className="eyebrow">UNIT LAYOUT · {String(index+1).padStart(2,'0')}</span><h3>{unit.name||'Unit layout'}</h3></div><dl className="layout-studio-facts">{facts.map(([label,value,icon])=><div key={label}><dt><Icon name={icon}/>{label}</dt><dd>{value}</dd></div>)}</dl><div className="layout-studio-price">{Number(unit.price)>0&&<span>LAYOUT PRICE</span>}<strong>{Number(unit.price)>0?money(unit.price):'Price on enquiry'}</strong><p>Confirm current pricing and availability with us.</p></div>{enquiry&&<a className="project-story-pill" href={unit.enquiryHref} target={unit.enquiryHref.startsWith('#')?undefined:'_blank'} rel={unit.enquiryHref.startsWith('#')?undefined:'noopener noreferrer'}>Ask about this layout <Icon name="arrowUpRight"/></a>}</div>
    {unit.floorPlanUrls.length>0&&<div className="layout-studio-drawing"><div className="layout-drawing-heading"><span>FLOOR PLAN</span><span>{unit.name||'Unit layout'}</span></div><FloorPlanViewer plans={unit.floorPlanUrls} name={unit.name||'Unit layout'}/></div>}
   </div></article>;
  })}</div>
 </div></section>;
}
