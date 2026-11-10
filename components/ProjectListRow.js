'use client';
import Link from 'next/link';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
import {listingName,startingPrice,unitMin,unitLeast} from '../lib/project';

// Compact image-only thumbnail; all project information sits alongside it.
export default function ProjectListRow({project,saved,onSave}){
 const [lead,amount]=startingPrice(project)||[],size=unitMin(project.units,'size');
 const facts=[['Property type',project.type],['Built-up size',size!=null?`${size.toLocaleString('en-MY')} sqft`:null],['Bedrooms',unitLeast(project.units,'bedrooms')],['Bathrooms',unitLeast(project.units,'bathrooms')],['Tenure',project.tag]].filter(([,value])=>value!==null&&value!==undefined&&value!=='');
 return <article className="catalog-list-row">
  <Link className="catalog-list-photo" href={'/projects/'+encodeURIComponent(project.id)} aria-label={`View ${listingName(project)}`}><CardPhoto src={project.images?.[0]} alt={listingName(project)}/></Link>
  <div className="catalog-list-summary">
   <div className="catalog-list-details">
   <span className="eyebrow">{project.type||'PENANG PROPERTY'}</span>
   <h2><Link href={'/projects/'+encodeURIComponent(project.id)}>{listingName(project)}</Link></h2>
   <p className="catalog-list-location"><Icon name="mapPin"/>{project.location}</p>
   <dl>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   </div>
   <div className="catalog-list-actions">
   <div className="catalog-list-price"><span>{amount?lead:'Contact us for details'}</span><strong>{amount||'Price on enquiry'}</strong></div>
   <Link className="catalog-list-link" href={'/projects/'+encodeURIComponent(project.id)}>Explore project<Icon name="arrowUpRight"/></Link>
   {onSave&&<button type="button" className="catalog-list-save" aria-label={`${saved?'Unsave':'Save'} ${listingName(project)}`} aria-pressed={saved} onClick={()=>onSave(project.id)}><Icon name="heart" filled={saved}/>{saved?'Saved':'Save project'}</button>}
   </div>
  </div>
 </article>;
}
