'use client';
import {useEffect,useRef} from 'react';
import Link from 'next/link';
import {preloadProjectImages} from '../lib/project-image-preload';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
import {listingName,startingPrice,unitMin,unitLeast,wholeRooms} from '../lib/project';

export default function ProjectListRow({project,saved,onSave}){
 // Glass card tilt: rests flat and eases toward the pointer (ry = x*16, rx = -y*12 with x, y in -0.5..0.5,
 // the reference's ranges), smoothed 6% per frame, and settles back flat on leave.
 const surface=useRef(null),frame=useRef(0),tilt=useRef({tx:0,ty:0,cx:0,cy:0});
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 function step(){
  const t=tilt.current,el=surface.current;frame.current=0;
  if(!el)return;
  t.cx+=(t.tx-t.cx)*.06;t.cy+=(t.ty-t.cy)*.06;
  el.style.setProperty('--ry',`${(t.cx*16).toFixed(2)}deg`);
  el.style.setProperty('--rx',`${(-t.cy*12).toFixed(2)}deg`);
  if(Math.abs(t.tx-t.cx)>.001||Math.abs(t.ty-t.cy)>.001)frame.current=requestAnimationFrame(step);
 }
 const run=()=>{if(!frame.current)frame.current=requestAnimationFrame(step)};
 function moveGlass(event){
  if(event.pointerType!=='mouse'||!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  tilt.current.tx=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width))-.5;
  tilt.current.ty=Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height))-.5;
  run();
 }
 function resetGlass(){tilt.current.tx=0;tilt.current.ty=0;run()}
 const name=listingName(project),href='/projects/'+encodeURIComponent(project.id);
 const [lead,amount]=startingPrice(project)||[],size=unitMin(project.units,'size');
 const bedrooms=wholeRooms(unitLeast(project.units,'bedrooms')),bathrooms=wholeRooms(unitLeast(project.units,'bathrooms'));
 const facts=[['ruler',size!=null?size.toLocaleString('en-MY')+' sqft':null,'Built-up size'],['bed',bedrooms,'Bedrooms'],['bath',bathrooms,'Bathrooms']].filter(([,value])=>value!==null&&value!==undefined&&value!=='');
 return <article ref={surface} className="catalog-list-row" onPointerMove={moveGlass} onPointerLeave={resetGlass} onPointerCancel={resetGlass}>
  <Link className="catalog-list-photo" href={href} onNavigate={()=>preloadProjectImages(project)} aria-label={'View '+name}><CardPhoto src={project.images?.[0]} alt={name}/></Link>
  <div className="catalog-list-summary">
   <div className="catalog-list-title-row"><div className="catalog-list-details">
    <span className="eyebrow">{project.type||'PENANG PROPERTY'}</span>
    <h2><Link href={href} onNavigate={()=>preloadProjectImages(project)}>{name}</Link></h2>
    {project.location&&<p className="catalog-list-location"><Icon name="mapPin"/>{project.location}</p>}
   </div>{onSave&&<button type="button" className="catalog-list-save" aria-label={(saved?'Unsave ':'Save ')+name} title={saved?'Remove from saved projects':'Save project'} aria-pressed={saved} onClick={()=>onSave(project.id)}><Icon name="heart" filled={saved}/></button>}</div>
   {(facts.length>0||project.tag)&&<div className="catalog-list-specifications">{facts.map(([icon,value,label])=><span key={label} aria-label={label+': '+value} title={label}><Icon name={icon}/>{value}</span>)}{project.tag&&<span className="catalog-list-tenure">{project.tag}</span>}</div>}
   <div className="catalog-list-actions"><div className="catalog-list-price">{amount&&lead&&<span>{lead}</span>}<strong>{amount||'Price on enquiry'}</strong></div><Link className="catalog-list-link" href={href} onNavigate={()=>preloadProjectImages(project)} aria-label={'Explore '+name}>View<Icon name="arrowUpRight"/></Link></div>
  </div>
 </article>;
}
