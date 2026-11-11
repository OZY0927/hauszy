'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Icon from './Icon';
import {facilityIcon} from '../lib/icon-match';

function FacilityList({items,className=''}){
  return <ul className={`facility-list ${className}`}>{items.map((label,index)=><li key={index}><Icon name={facilityIcon(label)}/><span>{label}</span></li>)}</ul>;
}

export default function ProjectFacilities({facilities}){
  const dialog=useRef(null),titleId=useId(),[open,setOpen]=useState(false);
  const spatial=useRef(null);
  useEffect(()=>{
    const root=spatial.current,stage=root.querySelector('.facility-spatial-stage');
    const preference=matchMedia('(min-width: 801px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
    const cards=[...root.querySelectorAll('.facility-preview>li')];
    let frame=0,observer;
    const update=()=>{
      frame=0;if(!preference.matches)return;
      const rect=root.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,root.offsetHeight-stage.offsetHeight-100)));
      root.style.setProperty('--facility-progress',progress.toFixed(4));
      cards.forEach((card,index)=>{
        const arrival=Math.max(0,Math.min(1,(progress-index*.035)/.65));
        const eased=1-Math.pow(1-arrival,3);
        card.style.setProperty('--facility-depth',(-480*(1-eased)).toFixed(2)+'px');
        card.style.setProperty('--facility-tilt',((index%2?1:-1)*14*(1-eased)).toFixed(2)+'deg');
        card.style.setProperty('--facility-opacity',(.35+eased*.65).toFixed(3));
      });
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    const configure=()=>{root.classList.toggle('is-spatial',preference.matches);root.style.removeProperty('--facility-progress');for(const card of cards)for(const key of ['depth','tilt','opacity'])card.style.removeProperty('--facility-'+key);schedule()};
    configure();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);preference.addEventListener('change',configure);
    if('ResizeObserver' in window){observer=new ResizeObserver(schedule);observer.observe(root);observer.observe(stage)}
    return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);preference.removeEventListener('change',configure)};
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
