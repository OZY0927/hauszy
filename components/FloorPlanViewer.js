'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Icon from './Icon';
import PreviewImage from './PreviewImage';

// Zoom limits for the floor plan: 1 = whole plan fits the viewport.
const MIN_ZOOM=1,MAX_ZOOM=4,TAP_ZOOM=2.5,START={s:1,x:0,y:0};
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

// plans: one or more floor plan images for a layout; extra plans show as thumbnails and are paged inside the viewer.
export default function FloorPlanViewer({plans=[],name}){
  const dialog=useRef(null),viewport=useRef(null),titleId=useId();
  const [open,setOpen]=useState(false),[failed,setFailed]=useState(false),[view,setViewState]=useState(START),[dragging,setDragging]=useState(false),[index,setIndex]=useState(0);
  const count=plans.length,src=plans[index]||plans[0],label=i=>count>1?`Floor plan ${i+1} of ${count} for ${name}`:`Floor plan for ${name}`;
  const current=useRef(START),pointers=useRef(new Map()),gesture=useRef(null),lastTap=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[open]);
  // Keeps the plan covering the viewport: no panning past its edges, zoom within MIN_ZOOM–MAX_ZOOM.
  function setView(next){const box=viewport.current?.getBoundingClientRect();if(!box)return;const s=clamp(next.s,MIN_ZOOM,MAX_ZOOM),v={s,x:clamp(next.x,box.width*(1-s),0),y:clamp(next.y,box.height*(1-s),0)};current.current=v;setViewState(v)}
  // Zooms to scale s while keeping the plan point under (px,py) in place.
  function zoomAt(s,px,py,from=current.current){const k=clamp(s,MIN_ZOOM,MAX_ZOOM)/from.s;setView({s:from.s*k,x:px-(px-from.x)*k,y:py-(py-from.y)*k})}
  const local=e=>{const box=viewport.current.getBoundingClientRect();return {x:e.clientX-box.left,y:e.clientY-box.top}};
  useEffect(()=>{
    const el=viewport.current;if(!open||!el)return;
    const wheel=e=>{e.preventDefault();const p=local(e);zoomAt(current.current.s*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),p.x,p.y)};
    el.addEventListener('wheel',wheel,{passive:false});
    return ()=>el.removeEventListener('wheel',wheel);
  },[open]);
  function startGesture(){
    const list=[...pointers.current.values()];
    if(list.length>=2){const [a,b]=list;gesture.current={type:'pinch',from:current.current,dist:Math.hypot(a.x-b.x,a.y-b.y)||1,mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}}
    else if(list.length===1)gesture.current={type:'pan',from:current.current,start:list[0],moved:false};
    else gesture.current=null;
  }
  function down(e){if(e.button>0)return;viewport.current.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,local(e));startGesture();setDragging(true)}
  function move(e){
    if(!pointers.current.has(e.pointerId))return;
    pointers.current.set(e.pointerId,local(e));const g=gesture.current,list=[...pointers.current.values()];if(!g)return;
    if(g.type==='pinch'&&list.length>=2){const [a,b]=list,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},s=clamp(g.from.s*Math.hypot(a.x-b.x,a.y-b.y)/g.dist,MIN_ZOOM,MAX_ZOOM),k=s/g.from.s;setView({s,x:mid.x-(g.mid.x-g.from.x)*k,y:mid.y-(g.mid.y-g.from.y)*k})}
    else if(g.type==='pan'){const p=list[0],dx=p.x-g.start.x,dy=p.y-g.start.y;if(Math.hypot(dx,dy)>6)g.moved=true;setView({s:g.from.s,x:g.from.x+dx,y:g.from.y+dy})}
  }
  function up(e){
    if(!pointers.current.has(e.pointerId))return;
    const p=pointers.current.get(e.pointerId),g=gesture.current;pointers.current.delete(e.pointerId);
    // Double tap or double click: zoom in on that spot, or back out when already zoomed.
    if(e.type==='pointerup'&&g?.type==='pan'&&!g.moved&&!pointers.current.size){const t=lastTap.current,now=e.timeStamp;if(t&&now-t.time<320&&Math.hypot(p.x-t.x,p.y-t.y)<30){lastTap.current=null;if(current.current.s>MIN_ZOOM)setView(START);else zoomAt(TAP_ZOOM,p.x,p.y)}else lastTap.current={...p,time:now}}
    startGesture();if(!pointers.current.size)setDragging(false);
  }
  function keys(e){
    const box=viewport.current.getBoundingClientRect(),cx=box.width/2,cy=box.height/2,{s,x,y}=current.current,step=60;
    const action={'+':()=>zoomAt(s*1.25,cx,cy),'=':()=>zoomAt(s*1.25,cx,cy),'-':()=>zoomAt(s/1.25,cx,cy),'0':()=>setView(START),ArrowLeft:()=>setView({s,x:x+step,y}),ArrowRight:()=>setView({s,x:x-step,y}),ArrowUp:()=>setView({s,x,y:y+step}),ArrowDown:()=>setView({s,x,y:y-step})}[e.key];
    if(action){e.preventDefault();action()}
  }
  // Opens (or pages to) plan i with the zoom reset.
  function goTo(i){current.current=START;setViewState(START);setFailed(false);setIndex((i+count)%count)}
  function show(i=0){goTo(i);dialog.current.showModal();setOpen(true)}
  function close(){dialog.current.close()}
  return <>
    <div className="floorplan-placeholder"><button type="button" className="floorplan-open" onClick={()=>show(0)} aria-label={`Open ${label(0).toLowerCase()}`}><PreviewImage className="sample-floorplan" src={plans[0]} alt={label(0)} loading="lazy"/><small><Icon name="maximize"/> {count>1?`Open floor plans (${count})`:'Open floor plan'}</small></button>{count>1&&<div className="floorplan-thumbs">{plans.map((plan,i)=><button type="button" key={i+plan} onClick={()=>show(i)} aria-label={`Open ${label(i).toLowerCase()}`}><PreviewImage src={plan} alt="" loading="lazy" draggable={false}/></button>)}</div>}</div>
    <dialog ref={dialog} className="floorplan-dialog" aria-labelledby={titleId} onClose={()=>{setOpen(false);pointers.current.clear();setDragging(false)}} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="floorplan-dialog-heading"><h2 id={titleId}>{name} · Floor plan{count>1&&` ${index+1} of ${count}`}</h2><div className="floorplan-dialog-actions">{count>1&&<><button type="button" onClick={()=>goTo(index-1)} aria-label="Previous floor plan"><Icon name="chevronLeft"/></button><button type="button" onClick={()=>goTo(index+1)} aria-label="Next floor plan"><Icon name="chevronRight"/></button></>}<button type="button" onClick={close} aria-label="Close floor plan" autoFocus><Icon name="x"/></button></div></div>
      <p className="floorplan-help">Pinch or scroll to zoom, drag to move. Double-tap to zoom in or out.<output aria-live="polite" aria-label="Zoom level">{Math.round(view.s*100)}%</output></p>
      <div className={`floorplan-viewport${view.s>MIN_ZOOM?' is-zoomed':''}${dragging?' is-dragging':''}`} ref={viewport} tabIndex={0} role="region" aria-label="Zoomable floor plan. Use plus and minus to zoom, arrow keys to move, 0 to reset." onKeyDown={keys} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {open&&(failed?<p role="status">This floor plan could not load. Close and reopen it to try again.</p>:<div className="floorplan-canvas" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.s})`}}><img key={index} src={src} alt={label(index)} onError={()=>setFailed(true)} draggable={false}/></div>)}
      </div>
    </dialog>
  </>;
}
