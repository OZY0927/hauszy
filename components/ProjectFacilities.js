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
  const spatial=useRef(null);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const root=spatial.current,stage=root.querySelector('.facility-spatial-stage');
    const cards=[...root.querySelectorAll('.facility-preview>li')];
    const media=gsap.matchMedia();
    let disposed=false;
    media.add('(min-width: 801px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)',()=>{
      root.classList.add('is-spatial');
      const timeline=gsap.timeline({scrollTrigger:{
        trigger:stage,start:'top 100px',end:()=>'+='+Math.round(innerHeight*1.3),
        pin:true,pinSpacing:true,scrub:.7,anticipatePin:1,invalidateOnRefresh:true
      }});
      timeline.fromTo(root.querySelector('.facility-preview'),{z:-100,rotationX:9},{z:0,rotationX:0,duration:1,ease:'none'},0);
      timeline.fromTo(cards,{z:-480,rotationY:index=>(index%2?1:-1)*14,opacity:.35},{z:0,rotationY:0,opacity:1,duration:.72,stagger:.045,ease:'power2.out'},0);
      timeline.fromTo(root.querySelector('.facility-spatial-grid'),{scale:.85},{scale:1,duration:1,ease:'none'},0);
      timeline.fromTo(root.querySelector('.facility-spatial-cue'),{opacity:1},{opacity:0,duration:.35,ease:'none'},0);
      return()=>root.classList.remove('is-spatial');
    },root);
    // Font metrics can settle after the trigger's initial measurements.
    document.fonts?.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
    return()=>{disposed=true;media.revert()};
  },[facilities]);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[open]);
  function show(){dialog.current.showModal();setOpen(true)}
  function close(){dialog.current.close()}
  return <>
    <div ref={spatial} className="facility-spatial-scroll">
      <div className="facility-spatial-stage">
        <div className="facility-spatial-grid" aria-hidden="true"/>
        <div className="facility-spatial-label"><span className="eyebrow">EXPLORE THE FACILITIES</span><span className="facility-spatial-cue">Scroll to take a closer look <Icon name="arrowDown"/></span></div>
        <div className="facility-spatial-camera"><FacilityList items={facilities.slice(0,8)} className="facility-preview"/></div>
        {facilities.length>8&&<button type="button" className="facilities-see-all" onClick={show} aria-haspopup="dialog">See all {facilities.length} facilities</button>}
      </div>
    </div>
    <dialog ref={dialog} className="facilities-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="facilities-dialog-heading"><h2 id={titleId}>Project Facilities</h2><button type="button" onClick={close} aria-label="Close facilities" autoFocus><Icon name="x"/></button></div>
      <div className="facilities-dialog-body"><FacilityList items={facilities}/></div>
    </dialog>
  </>;
}
