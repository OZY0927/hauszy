'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Icon from './Icon';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {facilityIcon} from '../lib/icon-match';

function FacilityList({items,className=''}){
  return <ul className={`facility-list ${className}`}>{items.map((label,index)=><li key={index}><Icon name={facilityIcon(label)}/><span>{label}</span></li>)}</ul>;
}

export default function ProjectFacilities({facilities}){
  const dialog=useRef(null),titleId=useId(),[open,setOpen]=useState(false);
  const vision=useRef(null),trigger=useRef(null),[active,setActive]=useState(0);
  const [preview,setPreview]=useState(()=>facilities.slice(0,10));
  const current=Math.min(active,preview.length-1);
  useEffect(()=>{
    const shuffled=[...facilities];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
    setPreview(shuffled.slice(0,10));setActive(0);
  },[facilities]);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const root=vision.current,stage=root.querySelector('.facility-vision-stage'),media=gsap.matchMedia();
    let disposed=false;
    media.add('(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)',()=>{
      root.classList.add('is-vision-scroll');
      const playhead={progress:0};
      const tween=gsap.to(playhead,{progress:1,ease:'none',onUpdate:()=>setActive(Math.min(preview.length-1,Math.floor(playhead.progress*preview.length))),scrollTrigger:{
        trigger:stage,start:'top 100px',end:()=>'+='+Math.round(innerHeight*Math.min(3,Math.max(1,preview.length*.18))),
        pin:true,pinSpacing:true,scrub:.35,anticipatePin:1,invalidateOnRefresh:true,
      }});
      trigger.current=tween.scrollTrigger;
      return()=>{trigger.current=null;root.classList.remove('is-vision-scroll')};
    },root);
    document.fonts?.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
    return()=>{disposed=true;media.revert()};
  },[facilities,preview.length]);
  function change(direction){
    const next=(current+direction+preview.length)%preview.length;
    const scroll=trigger.current;
    if(scroll)scroll.scroll(scroll.start+(scroll.end-scroll.start)*(next+.5)/preview.length);
    setActive(next);
  }
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[open]);
  function show(){dialog.current.showModal();setOpen(true)}
  function close(){dialog.current.close()}
  return <>
    <div ref={vision} className="facility-vision">
      <div className="facility-vision-stage">
        <div className="facility-vision-top"><span className="eyebrow">A LITTLE MORE TO EVERY DAY</span><span>{preview.length} featured facilities</span></div>
        <h2 className="facility-vision-heading"><span>More facilities.</span><span>To enjoy life.</span></h2>
        <div className="facility-vision-word"><strong key={current}>{preview[current]}</strong></div>
        <div className="facility-vision-bottom">
          <div className="facility-vision-controls" aria-label="Explore facilities"><button type="button" disabled={preview.length<2} onClick={()=>change(-1)} aria-label="Previous facility"><Icon name="arrowLeft"/></button><span aria-live="polite">{String(current+1).padStart(2,'0')} / {String(preview.length).padStart(2,'0')}</span><button type="button" disabled={preview.length<2} onClick={()=>change(1)} aria-label="Next facility"><Icon name="arrowRight"/></button></div>
          <span className="facility-vision-hint">Scroll to explore <Icon name="arrowDown"/></span>
          <button type="button" className="facilities-see-all" onClick={show} aria-haspopup="dialog">See all facilities <Icon name="arrowUpRight"/></button>
        </div>
        <div className="facility-vision-progress" aria-hidden="true"><span style={{transform:`scaleX(${(current+1)/preview.length})`}}/></div>
      </div>
    </div>
    <dialog ref={dialog} className="facilities-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="facilities-dialog-heading"><h2 id={titleId}>Project Facilities</h2><button type="button" onClick={close} aria-label="Close facilities" autoFocus><Icon name="x"/></button></div>
      <div className="facilities-dialog-body"><FacilityList items={facilities}/></div>
    </dialog>
  </>;
}
