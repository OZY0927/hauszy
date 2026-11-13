'use client';
import {ProjectDeck} from './ui/scroll-stacking-cards';
import FloorPlanViewer from './FloorPlanViewer';
import Icon from './Icon';
import {money} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';
import LayoutAtmosphere from './LayoutAtmosphere';

export default function ProjectLayouts({units,enquiry}){
 return <section className="project-story-layouts layout-studio layout-scroll-studio" id="units"><div className="project-story-section">
  <div className="layout-studio-heading" data-reveal><div><span className="eyebrow">EXPLORE THE LAYOUTS</span><h2>A space for<br/><em>every chapter.</em></h2></div><p>{units.length} {units.length===1?'layout':'layouts'} to explore.</p></div>

  <ProjectDeck renderScene={props=><LayoutAtmosphere {...props}/>}>{units.map((unit,index)=>{
   const facts=[['Built-up size',hasProjectInfo(unit.size)?unit.size+' sqft':null,'ruler'],['Bedrooms',unit.bedrooms,'bed'],['Bathrooms',unit.bathrooms,'bath'],['Car parks',unit.carParks,'car']].filter(([,value])=>hasProjectInfo(value));
   return <article key={index} id={'unit-layout-'+index}><div className={'layout-studio-stage'+(!unit.floorPlanUrls.length?' without-plan':'')}>
    <span className="layout-card-watermark" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
    <div className="layout-studio-details"><div className="layout-studio-detail-heading"><span className="eyebrow">UNIT LAYOUT · {String(index+1).padStart(2,'0')}</span><h3>{unit.name||'Unit layout'}</h3></div><dl className="layout-studio-facts">{facts.map(([label,value,icon])=><div key={label}><dt><Icon name={icon}/>{label}</dt><dd>{value}</dd></div>)}</dl><div className="layout-studio-price">{Number(unit.price)>0&&<span>LAYOUT PRICE</span>}<strong>{Number(unit.price)>0?money(unit.price):'Price on enquiry'}</strong><p>Confirm current pricing and availability with us.</p></div>{enquiry&&<a className="project-story-pill layout-enquiry-desktop" href={unit.enquiryHref} target={unit.enquiryHref.startsWith('#')?undefined:'_blank'} rel={unit.enquiryHref.startsWith('#')?undefined:'noopener noreferrer'}>Ask about this layout <Icon name="arrowUpRight"/></a>}</div>
    {unit.floorPlanUrls.length>0&&<div className="layout-studio-drawing"><div className="layout-drawing-heading"><span>FLOOR PLAN</span><span>{unit.name||'Unit layout'}</span></div><FloorPlanViewer plans={unit.floorPlanUrls} name={unit.name||'Unit layout'}/></div>}
    {enquiry&&<a className="project-story-pill layout-enquiry-mobile" href={unit.enquiryHref} target={unit.enquiryHref.startsWith('#')?undefined:'_blank'} rel={unit.enquiryHref.startsWith('#')?undefined:'noopener noreferrer'}>Ask about this layout <Icon name="arrowUpRight"/></a>}
   </div></article>;
  })}</ProjectDeck>
 </div></section>;
}
