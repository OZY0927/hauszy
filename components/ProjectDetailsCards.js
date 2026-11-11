'use client';
import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import Icon from './Icon';

function DetailPreview({detail,onDismiss}){
 const card=useRef(null),animation=useRef(null);
 const [label,value,icon]=detail.fact;
 useLayoutEffect(()=>{
  const element=card.current;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!element.animate)return;
  const target=element.getBoundingClientRect(),source=detail.rect;
  const x=source.left+source.width/2-target.left-target.width/2,y=source.top+source.height/2-target.top-target.height/2;
  const start=`translate(${x}px,${y}px) scale(${source.width/target.width},${source.height/target.height}) rotateY(-180deg)`;
  animation.current=element.animate([{transform:start,opacity:0},{transform:'translate(0,0) scale(1) rotateY(0deg)',opacity:1}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  return()=>animation.current?.cancel();
 },[detail.id]);
 useEffect(()=>{
  if(!detail.closing)return;
  const motion=animation.current;
  if(!motion){onDismiss(detail.id);return}
  motion.reverse();
  motion.finished.then(()=>onDismiss(detail.id)).catch(()=>{});
 },[detail.closing,detail.id,onDismiss]);
 return createPortal(<div className={'project-detail-preview'+(detail.pinned?' is-pinned':'')} onClick={onDismiss.bind(null,detail.id)}>
  <div ref={card} id={detail.previewId} className="project-detail-preview-card" role={detail.pinned?'dialog':'tooltip'} aria-label={label} onClick={event=>event.stopPropagation()}>
   {detail.pinned&&<button type="button" className="project-detail-preview-close" onClick={()=>onDismiss(detail.id)} aria-label="Close detail"><Icon name="x"/></button>}
   <span className="project-detail-preview-label">{label}</span><Icon name={icon}/><strong>{value}</strong>
  </div>
 </div>,document.body);
}

export default function ProjectDetailsCards({facts}){
 const [detail,setDetail]=useState(null),sequence=useRef(0),previewId=useId();
 const dismiss=useRef(id=>setDetail(current=>current?.id===id?null:current)).current;
 function show(index,element,pinned=false){
  if(detail?.pinned&&!pinned)return;
  if(detail?.index===index&&!detail.closing){if(pinned)setDetail(current=>({...current,pinned:true}));return}
  const rect=element.closest('.project-detail-card').getBoundingClientRect();
  setDetail({index,fact:facts[index],rect,id:++sequence.current,pinned,closing:false,previewId});
 }
 function leave(index){setDetail(current=>current?.index===index&&!current.pinned?{...current,closing:true}:current)}
 useEffect(()=>{
  if(!detail)return;
  const close=()=>setDetail(null),key=event=>{if(event.key==='Escape')close()};
  window.addEventListener('keydown',key);window.addEventListener('scroll',close,{passive:true});window.addEventListener('resize',close);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('scroll',close);window.removeEventListener('resize',close)};
 },[!!detail]);
 return <>
  <dl className="project-details-content" aria-label="Project specifications">{facts.map(([label,value,icon],index)=><div className="project-detail-card" key={label} onPointerEnter={event=>{if(event.pointerType==='mouse')show(index,event.currentTarget)}} onPointerLeave={()=>leave(index)}>
   <dt><span>{label}</span><span className="project-detail-number" aria-hidden="true">{String(index+1).padStart(2,'0')} / {String(facts.length).padStart(2,'0')}</span></dt>
   <dd><Icon name={icon}/><span>{value}</span><button type="button" className="project-detail-expand" aria-label={`View ${label}: ${value}`} aria-expanded={detail?.index===index&&!detail.closing} aria-describedby={detail?.index===index?previewId:undefined} onFocus={event=>show(index,event.currentTarget)} onBlur={()=>leave(index)} onClick={event=>show(index,event.currentTarget,true)}/></dd>
  </div>)}</dl>
  {detail&&<DetailPreview key={detail.id} detail={detail} onDismiss={dismiss}/>}
 </>;
}
