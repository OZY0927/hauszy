'use client';
import Link from 'next/link';
import {listingName,startingPrice,unitMin} from '../lib/project';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
// Full-image card for the dedicated property collection.
export default function CollectionCard({project:p,saved=false,onSave}){
 const [lead,amount]=startingPrice(p)||[],name=listingName(p),size=unitMin(p.units,'size');
 return <article className="property-tile">
  <div className="property-tile-photo"><CardPhoto src={p.images[0]} alt={name}/></div>
  <Link className="property-tile-link" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
   <div className="property-tile-info"><span className="property-tile-type">{p.type}</span><h3>{name}</h3><p>{p.location}</p><div className="property-tile-facts">{size!=null&&<span>{size.toLocaleString('en-MY')} sqft</span>}{p.tag&&<span>{p.tag}</span>}</div></div>
   <div className="property-tile-bottom"><div className="property-tile-price"><span>{amount?lead:'Let’s talk about your next move'}</span><strong>{amount||'Price on enquiry'}</strong></div><span className="property-tile-arrow"><Icon name="arrowUpRight"/></span></div>
  </Link>
  {onSave&&<button type="button" className={'property-tile-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
 </article>
}
