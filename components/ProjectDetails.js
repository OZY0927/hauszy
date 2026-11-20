import Link from 'next/link';
import {hasProjectInfo,visibleFacts} from '../lib/project-visibility';
import {money,formatRange,pricePerSqft,priceText,wholeMoney,vpQuarter} from '../lib/project';
import ProjectDetailsCards from './ProjectDetailsCards';
import Icon from './Icon';

export default function ProjectDetails({project:p,purchaseTool}){
 const price='displayPricePerSqft' in p?p.displayPricePerSqft:pricePerSqft(p);
 const facts=visibleFacts([
  ['Project name',p.name],['Developer',p.developer],['Project location',p.location],['Property type',p.type],
  ['Built-up size',hasProjectInfo(p.size)?`${p.size} sqft`:null],['Listed price',priceText(p,wholeMoney)],
  ['Price per sqft',price?money(price)+' / sqft':null],['Tenure',p.tag],['Title',p.titleType],
  ['Total units',p.totalUnits],['Towers / blocks',p.towers],['Total floors',formatRange([p.floors,p.floorsMax])],
  ['Units per floor',formatRange([p.unitsPerFloor,p.unitsPerFloorMax])],['Total lifts',p.totalLifts],
  ['Construction status',p.construction],['Estimated vacant possession',vpQuarter(p.vp)],
 ]);
 const icons={'Project name':'home','Developer':'building','Project location':'mapPin','Property type':'key','Built-up size':'ruler','Listed price':'banknote','Price per sqft':'banknote','Tenure':'shieldCheck','Title':'badgeCheck','Total units':'grid','Towers / blocks':'building','Total floors':'arrowUp','Units per floor':'grid','Total lifts':'sort','Construction status':'industry','Estimated vacant possession':'calendar'};
 return <section className="project-story-section project-details" id="details" aria-labelledby="project-details-title">
  <div className="project-details-inner">
   <div className="project-details-intro project-story-section-heading">
    <div><span className="eyebrow">THE FINER DETAILS</span><h2 id="project-details-title">Every detail.<br/><em>A clearer picture.</em></h2></div><div className="project-details-intro-note"><p>Get to know your next address.<br/>All the essentials, at a glance.</p>
     <div className="project-details-summary">{facts.length} project details <span>One complete picture.</span></div>
     {purchaseTool&&<Link className="project-story-pill" href={purchaseTool[0]}>{purchaseTool[1]} <Icon name="arrowUpRight"/></Link>}
    </div>
   </div>
   <div className="project-details-aura" aria-hidden="true"/>
   <ProjectDetailsCards facts={facts.map(([label,value])=>[label,value,icons[label]])}/>
  </div>
 </section>;
}
