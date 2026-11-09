'use client';
import Link from 'next/link';
import {ViewTransition} from 'react';
import {animateProjectCard} from '../lib/project-transition';
import {listingName,startingPrice,unitMin,unitLeast} from '../lib/project';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
// Full-image card for the dedicated property collection.
export default function CollectionCard({project:p,saved=false,onSave,titleOnly=false}){
 const [lead,amount]=startingPrice(p)||[],name=listingName(p),size=unitMin(p.units,'size');
 return <article className={'property-tile'+(titleOnly?' property-tile-title-only':'')}>
  <ViewTransition name={`project-photo-${p.id}`} share="project-morph" default="none"><div className="property-tile-photo"><CardPhoto src={p.images[0]} alt={name}/></div></ViewTransition>
  <Link onClick={event=>animateProjectCard(event,p.id)} className="property-tile-link" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
   {titleOnly?<ViewTransition name={`project-name-${p.id}`} share="project-morph" default="none"><h3 className="property-tile-centered-name">{name}</h3></ViewTransition>:<><div className="property-tile-info"><span className="property-tile-type">{p.type}</span><ViewTransition name={`project-name-${p.id}`} share="project-morph" default="none"><h3>{name}</h3></ViewTransition><p>{p.location}</p><div className="property-tile-facts">{size!=null&&<span>{size.toLocaleString('en-MY')} sqft</span>}{p.tag&&<span>{p.tag}</span>}</div>{(unitLeast(p.units,'bedrooms')!=null||unitLeast(p.units,'bathrooms')!=null)&&<div className="property-tile-facts property-tile-rooms">{[['bedrooms','bed','bed','beds'],['bathrooms','bath','bath','baths']].map(([key,icon,singular,plural])=>{const value=unitLeast(p.units,key);return value!=null&&<span className="property-tile-room" key={key} aria-label={`${key==='bedrooms'?'Bedrooms':'Bathrooms'} starting from ${value}`}><Icon name={icon}/>{value}{/^\d/.test(value)?` ${value==='1'?singular:plural}`:''}</span>})}</div>}</div>
   <div className="property-tile-bottom"><div className="property-tile-price"><span>{amount?lead:'Let’s talk about your next move'}</span><strong>{amount||'Price on enquiry'}</strong></div><span className="property-tile-arrow"><Icon name="arrowUpRight"/></span></div></>}
  </Link>
  {onSave&&<button type="button" className={'property-tile-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
 </article>
}
