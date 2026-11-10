'use client';
import Link from 'next/link';
import CollectionCard from './CollectionCard';
import Icon from './Icon';
import {listingName,startingPrice,unitMin,unitLeast} from '../lib/project';

// Keep the original photographic card intact; list mode adds a scannable summary beside it.
export default function ProjectListRow({project,saved,onSave}){
 const [lead,amount]=startingPrice(project)||[],size=unitMin(project.units,'size');
 const facts=[['Property type',project.type],['Built-up size',size!=null?`${size.toLocaleString('en-MY')} sqft`:null],['Bedrooms',unitLeast(project.units,'bedrooms')],['Bathrooms',unitLeast(project.units,'bathrooms')],['Tenure',project.tag]].filter(([,value])=>value!==null&&value!==undefined&&value!=='');
 return <div className="catalog-list-row">
  <CollectionCard project={project} saved={saved} onSave={onSave}/>
  <div className="catalog-list-summary">
   <span className="eyebrow">{project.type||'PENANG PROPERTY'}</span>
   <h2><Link href={'/projects/'+encodeURIComponent(project.id)}>{listingName(project)}</Link></h2>
   <p className="catalog-list-location"><Icon name="mapPin"/>{project.location}</p>
   <dl>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   <div className="catalog-list-price"><span>{amount?lead:'Contact us for details'}</span><strong>{amount||'Price on enquiry'}</strong></div>
   <Link className="catalog-list-link" href={'/projects/'+encodeURIComponent(project.id)}>Explore project<Icon name="arrowUpRight"/></Link>
  </div>
 </div>;
}
