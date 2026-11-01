'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Icon from './Icon';

export default function FloorPlanViewer({src,name}){
  const dialog=useRef(null),viewport=useRef(null),titleId=useId();
  const [open,setOpen]=useState(false),[zoom,setZoom]=useState(1),[failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[open]);
  function show(){setZoom(1);setFailed(false);dialog.current.showModal();setOpen(true);viewport.current.scrollTo(0,0)}
  function close(){dialog.current.close()}
  function reset(){setZoom(1);viewport.current.scrollTo(0,0)}
  return <>
    <div className="floorplan-placeholder"><button type="button" className="floorplan-open" onClick={show} aria-label={`Open floor plan for ${name}`}><img className="sample-floorplan" src={src} alt={`Floor plan for ${name}`} loading="lazy"/><small><Icon name="maximize"/> Open floor plan</small></button></div>
    <dialog ref={dialog} className="floorplan-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="floorplan-dialog-heading"><h2 id={titleId}>{name} · Floor plan</h2><button type="button" onClick={close} aria-label="Close floor plan" autoFocus><Icon name="x"/></button></div>
      <div className="floorplan-toolbar" role="group" aria-label="Floor plan zoom controls">
        <button type="button" aria-label="Zoom out" disabled={zoom<=1} onClick={()=>setZoom(value=>Math.max(1,value-.5))}>−</button>
        <output aria-live="polite" aria-label="Zoom level">{Math.round(zoom*100)}%</output>
        <button type="button" aria-label="Zoom in" disabled={zoom>=4} onClick={()=>setZoom(value=>Math.min(4,value+.5))}>+</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
      <p className="floorplan-help">Zoom in, then scroll or swipe to explore the plan.</p>
      <div className="floorplan-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Zoomable floor plan">
        {open&&(failed?<p role="status">This floor plan could not load. Close and reopen it to try again.</p>:<div className="floorplan-canvas" style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}><img src={src} alt={`Floor plan for ${name}`} onError={()=>setFailed(true)} draggable={false}/></div>)}
      </div>
    </dialog>
  </>;
}
