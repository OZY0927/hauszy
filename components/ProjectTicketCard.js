'use client';
import Link from 'next/link';
import {propertyCategory} from '../lib/property-category';
import {preloadProjectImages} from '../lib/project-image-preload';
import {listingName,startingPrice,unitMin,unitLeast} from '../lib/project';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';

const rooms=(value,singular,plural)=>value==null?null:`${value}${/^\d/.test(value)?` ${value==='1'?singular:plural}`:''}`;

// Ticket-style card for the listing grid: a cut-corner panel with a framed photo above a detachable stub.
export default function ProjectTicketCard({project:p,saved=false,onSave}){
 const [lead,amount]=startingPrice(p)||[],name=listingName(p),size=unitMin(p.units,'size');
 const facts=[rooms(unitLeast(p.units,'bedrooms'),'bed','beds'),rooms(unitLeast(p.units,'bathrooms'),'bath','baths'),size!=null&&`${size.toLocaleString('en-MY')} sqft`].filter(Boolean);
 return <article className="ticket-card" data-category={propertyCategory(p)}>
  <Link onNavigate={()=>preloadProjectImages(p)} className="ticket-card-link" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
   <div className="ticket-card-main">
    <div className="ticket-card-head"><h3>{name}</h3><span className="ticket-card-no" aria-hidden="true"/></div>
    <div className="ticket-card-frame"><div className="ticket-card-photo"><CardPhoto src={p.images[0]} alt={name}/></div></div>
   </div>
   <div className="ticket-card-stub">
    <span className="ticket-card-type">{p.type}{p.tag&&<> · {p.tag}</>}</span>
    <p className="ticket-card-location">{p.location}</p>
    {facts.length>0&&<p className="ticket-card-facts">{facts.join(' · ')}</p>}
    <p className="ticket-card-price">{amount&&<span>{lead}</span>}<strong>{amount||'Price on enquiry'}</strong><Icon name="arrowUpRight"/></p>
   </div>
  </Link>
  {onSave&&<button type="button" className={'ticket-card-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
 </article>
}
