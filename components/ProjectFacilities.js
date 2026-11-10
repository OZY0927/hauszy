'use client';
import {useEffect,useId,useRef,useState} from 'react';
import Icon from './Icon';
import {facilityIcon} from '../lib/icon-match';

function FacilityList({items,className=''}){
  return <ul className={`facility-list ${className}`}>{items.map((label,index)=><li key={index}><Icon name={facilityIcon(label)}/><span>{label}</span></li>)}</ul>;
}

export default function ProjectFacilities({facilities}){
  const dialog=useRef(null),titleId=useId(),[open,setOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[open]);
  function show(){dialog.current.showModal();setOpen(true)}
  function close(){dialog.current.close()}
  return <>
    <FacilityList items={facilities.slice(0,8)} className="facility-preview"/>
    {facilities.length>8&&<button type="button" className="facilities-see-all" onClick={show} aria-haspopup="dialog">See all {facilities.length} facilities</button>}
    <dialog ref={dialog} className="facilities-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)close()}}>
      <div className="facilities-dialog-heading"><h2 id={titleId}>Project Facilities</h2><button type="button" onClick={close} aria-label="Close facilities" autoFocus><Icon name="x"/></button></div>
      <div className="facilities-dialog-body"><FacilityList items={facilities}/></div>
    </dialog>
  </>;
}
