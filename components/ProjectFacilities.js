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
  const hasMore=facilities.length>10,moreCount=facilities.length-10;
  function centerButton(stage){
    const bottom=stage.querySelector('.facility-vision-bottom'),more=stage.querySelector('.facility-vision-more');
    return {x:stage.clientWidth/2-bottom.offsetLeft-more.offsetLeft-more.offsetWidth/2,y:stage.clientHeight/2-bottom.offsetTop-more.offsetTop-more.offsetHeight/2};
  }
  function largeButton(stage){
    const size=parseFloat(getComputedStyle(stage.querySelector('.facility-vision-word strong')).fontSize);
    return {'--facility-cta-size':size+'px','--facility-cta-width':Math.min(760,stage.clientWidth*.76)+'px','--facility-cta-note-offset':size*1.15+'px'};
  }
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
      const playhead={progress:0},steps=preview.length+(hasMore?1:0),finalBeat=preview.length/steps;
      const tween=gsap.timeline({scrollTrigger:{
        trigger:stage,start:'top 100px',end:()=>'+='+Math.round(innerHeight*Math.min(3,Math.max(1,steps*.18))),
        pin:true,pinSpacing:true,scrub:.35,anticipatePin:1,invalidateOnRefresh:true,
      }}).to(playhead,{progress:1,duration:1,ease:'none',onUpdate:()=>setActive(Math.min(preview.length-1,Math.floor(playhead.progress*steps)))},0);
      if(hasMore){
        const duration=1/steps;
        const more=stage.querySelector('.facility-vision-more');
        tween.fromTo(more,{x:0,y:0,'--facility-cta-size':'15px','--facility-cta-width':'230px','--facility-cta-note-offset':'27px'},{x:()=>centerButton(stage).x,y:()=>centerButton(stage).y,'--facility-cta-size':()=>largeButton(stage)['--facility-cta-size'],'--facility-cta-width':()=>largeButton(stage)['--facility-cta-width'],'--facility-cta-note-offset':()=>largeButton(stage)['--facility-cta-note-offset'],duration,ease:'power2.inOut'},finalBeat);
        tween.to(more.querySelector('button'),{borderColor:'transparent',color:'var(--secondary)',fontWeight:800,duration},finalBeat);
        tween.to(stage.querySelector('.facility-vision-word'),{autoAlpha:0,duration:duration*.65},finalBeat);
        tween.fromTo(stage.querySelector('.facility-vision-more-note'),{autoAlpha:0},{autoAlpha:1,duration:duration*.6},finalBeat+duration*.4);
        tween.to(stage.querySelector('.facility-vision-hint'),{autoAlpha:0,duration:duration*.5},finalBeat);
      }
      trigger.current=tween.scrollTrigger;
      return()=>{trigger.current=null;root.classList.remove('is-vision-scroll')};
    },root);
    document.fonts?.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
    return()=>{disposed=true;media.revert()};
  },[facilities,preview.length,hasMore]);
  // Compact screens use the existing arrow controls; their last preview gets the same invitation.
  useEffect(()=>{
    if(!hasMore)return;
    const stage=vision.current.querySelector('.facility-vision-stage'),more=stage.querySelector('.facility-vision-more');
    const end=current===preview.length-1;
    const media=gsap.matchMedia();
    media.add('(max-width: 800px), (max-height: 649px), (prefers-reduced-motion: reduce)',()=>{
      const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:.5;
      gsap.to(more,{...(end?{...centerButton(stage),...largeButton(stage)}:{x:0,y:0,'--facility-cta-size':'15px','--facility-cta-width':'230px','--facility-cta-note-offset':'27px'}),duration});
      if(end)gsap.to(more.querySelector('button'),{borderColor:'transparent',color:'var(--secondary)',fontWeight:800,duration});
      const resize=()=>{if(end)gsap.set(more,{...centerButton(stage),...largeButton(stage)})};
      window.addEventListener('resize',resize);
      return()=>window.removeEventListener('resize',resize);
    },stage);
    return()=>media.revert();
  },[current,preview.length,hasMore]);
  function change(direction){
    const next=(current+direction+preview.length)%preview.length;
    const scroll=trigger.current;
    if(scroll)scroll.scroll(scroll.start+(scroll.end-scroll.start)*(next+.5)/(preview.length+(hasMore?1:0)));
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
    <div ref={vision} className={'facility-vision'+(hasMore&&current===preview.length-1?' is-at-end':'')}>
      <div className="facility-vision-stage">
        <div className="facility-vision-top"><span className="eyebrow">A LITTLE MORE TO EVERY DAY</span><span>{preview.length} featured facilities</span></div>
        <h2 className="facility-vision-heading"><span>More facilities.</span><span>To enjoy life.</span></h2>
        <div className="facility-vision-word"><strong key={current}>{preview[current]}</strong></div>
        <div className="facility-vision-bottom">
          <div className="facility-vision-controls" aria-label="Explore facilities"><button type="button" disabled={preview.length<2} onClick={()=>change(-1)} aria-label="Previous facility"><Icon name="arrowLeft"/></button><span aria-live="polite">{String(current+1).padStart(2,'0')} / {String(preview.length).padStart(2,'0')}</span><button type="button" disabled={preview.length<2} onClick={()=>change(1)} aria-label="Next facility"><Icon name="arrowRight"/></button></div>
          <span className="facility-vision-hint">Scroll to explore <Icon name="arrowDown"/></span>
          {hasMore&&<div className="facility-vision-more"><div className="facility-vision-more-anchor"><button type="button" className="facilities-see-all" onClick={show} aria-haspopup="dialog"><span className="facility-vision-more-label">See all facilities</span><Icon name="arrowUpRight"/></button></div><p className="facility-vision-more-note">{moreCount} more {moreCount===1?'facility':'facilities'} to discover.</p></div>}
        </div>
        <div className="facility-vision-progress" aria-hidden="true"><span style={{transform:`scaleX(${(current+1)/preview.length})`}}/></div>
      </div>
    </div>
    <dialog ref={dialog} className="facilities-dialog project-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="facilities-dialog-heading"><h2 id={titleId}>Project Facilities</h2><button type="button" className="project-dialog-close" onClick={close} aria-label="Close facilities" autoFocus><Icon name="x"/></button></div>
      <div className="facilities-dialog-body"><FacilityList items={facilities}/></div>
    </dialog>
  </>;
}
