'use client';
import Link from 'next/link';
import {useId} from 'react';
import {propertyCategory} from '../lib/property-category';
import {preloadProjectImages} from '../lib/project-image-preload';
import {listingName,startingPrice,unitMin,unitLeast} from '../lib/project';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
// Full-image card for the dedicated property collection.
export default function CollectionCard({project:p,saved=false,onSave,titleOnly=false}){
 function tilt(event){
  if(event.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return;
  const el=event.currentTarget,rect=el.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  el.style.setProperty('--card-tilt-x',`${(0.5-y)*10}deg`);el.style.setProperty('--card-tilt-y',`${(x-0.5)*12}deg`);
  el.style.setProperty('--card-light-x',`${x*100}%`);el.style.setProperty('--card-light-y',`${y*100}%`);
 }
 function resetTilt(event){const el=event.currentTarget;el.style.setProperty('--card-tilt-x','0deg');el.style.setProperty('--card-tilt-y','0deg')}
 const frameId='card-frame-'+useId().replaceAll(':','');
 const [lead,amount]=startingPrice(p)||[],name=listingName(p),size=unitMin(p.units,'size');
 return <article onPointerMove={tilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt} style={{'--card-image-clip':`url(#${frameId})`}} data-category={propertyCategory(p)} className={'property-tile'+(titleOnly?' property-tile-title-only':'')}>
  {!titleOnly&&<svg className="property-tile-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id={frameId} clipPathUnits="objectBoundingBox"><path d="M .05 .01 H .75 Q .78 .01 .80 .025 L .83 .055 Q .85 .07 .88 .07 H .95 Q .99 .07 .99 .11 V .95 Q .99 .99 .95 .99 H .76 Q .74 .99 .725 .975 L .69 .95 Q .675 .94 .65 .94 H .35 Q .325 .94 .31 .95 L .275 .975 Q .26 .99 .24 .99 H .05 Q .01 .99 .01 .95 V .05 Q .01 .01 .05 .01 Z"/></clipPath></defs><path d="M 5 1 H 75 Q 78 1 80 2.5 L 83 5.5 Q 85 7 88 7 H 95 Q 99 7 99 11 V 95 Q 99 99 95 99 H 76 Q 74 99 72.5 97.5 L 69 95 Q 67.5 94 65 94 H 35 Q 32.5 94 31 95 L 27.5 97.5 Q 26 99 24 99 H 5 Q 1 99 1 95 V 5 Q 1 1 5 1 Z"/></svg>}
  <div className="property-tile-photo"><CardPhoto src={p.images[0]} alt={name}/></div>
  <Link onNavigate={()=>preloadProjectImages(p)} className="property-tile-link" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
   {!titleOnly&&<div className="property-tile-edition" aria-hidden="true"><span>HZ<span>®</span></span><span>HAUSZY COLLECTION</span></div>}
   {titleOnly?<h3 className="property-tile-centered-name">{name}</h3>:<><div className="property-tile-info"><span className="property-tile-type">{p.type}</span><h3>{name}</h3><p>{p.location}</p><div className="property-tile-facts">{size!=null&&<span>{size.toLocaleString('en-MY')} sqft</span>}{p.tag&&<span>{p.tag}</span>}</div>{(unitLeast(p.units,'bedrooms')!=null||unitLeast(p.units,'bathrooms')!=null)&&<div className="property-tile-facts property-tile-rooms">{[['bedrooms','bed','bed','beds'],['bathrooms','bath','bath','baths']].map(([key,icon,singular,plural])=>{const value=unitLeast(p.units,key);return value!=null&&<span className="property-tile-room" key={key} aria-label={`${key==='bedrooms'?'Bedrooms':'Bathrooms'} starting from ${value}`}><Icon name={icon}/>{value}{/^\d/.test(value)?` ${value==='1'?singular:plural}`:''}</span>})}</div>}</div>
   <div className="property-tile-bottom"><div className="property-tile-price"><span>{amount?lead:'Let’s talk about your next move'}</span><strong>{amount||'Price on enquiry'}</strong></div><span className="property-tile-arrow"><Icon name="arrowUpRight"/></span></div></>}
  </Link>
  {!titleOnly&&<span className="property-tile-footer" aria-hidden="true">HAUSZY / PENANG PROPERTY COLLECTION</span>}
  {onSave&&<button type="button" className={'property-tile-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
 </article>
}
