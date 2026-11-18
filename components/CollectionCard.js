'use client';
import Link from 'next/link';
import {propertyCategory} from '../lib/property-category';
import {preloadProjectImages} from '../lib/project-image-preload';
import {listingName,startingPrice,unitMin,unitLeast,wholeRooms} from '../lib/project';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
// Progressive-blur layers for the tour card: [blur in px, % down the card where the layer starts fading in].
const TOUR_BLUR=[[3,40],[6,54],[10,68],[16,82]];

// Up to three headline stats for the tour card, in order of usefulness, skipping any the project lacks.
function tourStats(p,size){
 const beds=wholeRooms(unitLeast(p.units,'bedrooms')),baths=wholeRooms(unitLeast(p.units,'bathrooms'));
 return [
  beds!=null&&{value:beds,label:'Bedrooms'},
  baths!=null&&{value:baths,label:'Bathrooms'},
  size!=null&&{value:size.toLocaleString('en-MY'),label:'sqft'},
  p.tag&&{value:p.tag,label:'Status',text:true},
 ].filter(Boolean).slice(0,3);
}

// Full-image card for the dedicated property collection. The "tour" variant (project listing grid) puts the
// details on a blurred, tinted lower half with a stats row and a white price button.
export default function CollectionCard({project:p,saved=false,onSave,titleOnly=false,variant}){
 const [lead,amount]=startingPrice(p)||[],name=listingName(p),size=unitMin(p.units,'size');
 const hasRooms=unitLeast(p.units,'bedrooms')!=null||unitLeast(p.units,'bathrooms')!=null;
 if(variant==='tour'){
  const stats=tourStats(p,size);
  return <article data-category={propertyCategory(p)} className="property-tile tour-card">
   <div className="tour-card-frame">
    <div className="property-tile-photo"><CardPhoto src={p.images[0]} alt={name}/></div>
    {/* Progressive blur: copies of the photo blurred more and more strongly, each masked to fade in a little lower,
        so the blur builds steadily to the bottom (steadier than backdrop-filter under the press tilt). */}
    {TOUR_BLUR.map(([blur,start])=><div key={blur} className="tour-card-blur" aria-hidden="true" style={{'--b':blur+'px','--s':start+'%'}}><CardPhoto src={p.images[0]} alt=""/></div>)}
    <div className="tour-card-tint" aria-hidden="true"/>
    <Link onNavigate={()=>preloadProjectImages(p)} className="property-tile-link tour-card-body" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
     <h3 className="tour-card-name">{name}</h3>
     {(p.location||p.type)&&<div className="tour-card-meta">{p.location&&<p className="tour-card-addr">{p.location}</p>}{p.type&&<span className="tour-card-type">{p.type}</span>}</div>}
     {stats.length>0&&<><span className="tour-card-rule" aria-hidden="true"/>
      <dl className="tour-card-stats">{stats.map(s=><div key={s.label} className={'tour-card-stat'+(s.text?' is-text':'')}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl></>}
     <span className="tour-card-cta">{amount?<><span>{lead}</span> {amount}</>:'Price on enquiry'}</span>
    </Link>
    {onSave&&<button type="button" className={'property-tile-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
   </div>
  </article>;
 }
 return <article data-category={propertyCategory(p)} className={'property-tile'+(titleOnly?' property-tile-title-only':'')}>
  <div className="property-tile-photo"><CardPhoto src={p.images[0]} alt={name}/></div>
  <Link onNavigate={()=>preloadProjectImages(p)} className="property-tile-link" href={'/projects/'+encodeURIComponent(p.id)} aria-label={`Explore ${name}`}>
   {titleOnly?<h3 className="property-tile-centered-name">{name}</h3>:<><div className="property-tile-info"><span className="property-tile-type">{p.type}</span><h3>{name}</h3><p>{p.location}</p>
    <div className="property-tile-facts">{size!=null&&<span>{size.toLocaleString('en-MY')} sqft</span>}{p.tag&&<span>{p.tag}</span>}</div>
    {hasRooms&&<div className="property-tile-facts property-tile-rooms">{[['bedrooms','bed','bed','beds'],['bathrooms','bath','bath','baths']].map(([key,icon,singular,plural])=>{const value=unitLeast(p.units,key);return value!=null&&<span className="property-tile-room" key={key} aria-label={`${key==='bedrooms'?'Bedrooms':'Bathrooms'} starting from ${value}`}><Icon name={icon}/>{value}{/^\d/.test(value)?` ${value==='1'?singular:plural}`:''}</span>})}</div>}
   </div>
   <div className="property-tile-bottom"><div className="property-tile-price"><span>{amount?lead:'Let’s talk about your next move'}</span><strong>{amount||'Price on enquiry'}</strong></div><span className="property-tile-arrow"><Icon name="arrowUpRight"/></span></div></>}
  </Link>
  {onSave&&<button type="button" className={'property-tile-save'+(saved?' is-saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}
 </article>
}
