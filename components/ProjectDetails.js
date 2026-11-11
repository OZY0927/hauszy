import {visibleFacts} from '../lib/project-visibility';
import {money,formatRange,pricePerSqft,vpQuarter} from '../lib/project';

export default function ProjectDetails({project:p}){
 const price=pricePerSqft(p);
 const facts=visibleFacts([
  ['Project name',p.name],['Developer',p.developer],['Project location',p.location],['Property type',p.type],
  ['Price per sqft',price?money(price)+' / sqft':null],['Tenure',p.tag],['Title',p.titleType],
  ['Total units',p.totalUnits],['Towers / blocks',p.towers],['Total floors',formatRange([p.floors,p.floorsMax])],
  ['Units per floor',formatRange([p.unitsPerFloor,p.unitsPerFloorMax])],['Total lifts',p.totalLifts],
  ['Construction status',p.construction],['Estimated vacant possession',vpQuarter(p.vp)],
 ]);
 return <section className="project-story-section project-details" id="details" aria-labelledby="project-details-title">
  <div className="project-details-inner">
   <div className="project-details-intro project-story-section-heading">
    <div><span className="eyebrow">THE FINER DETAILS</span><h2 id="project-details-title">Every detail.<br/><em>A clearer picture.</em></h2><p>Get to know your next address, one detail at a time.</p>
     <div className="project-details-scroll-cue"><span aria-hidden="true">↓</span><span>Scroll to explore <small>{facts.length} project details</small></span></div>
    </div>
   </div>
   <dl className="project-details-content" aria-label="Project specifications">{facts.map(([label,value],index)=><div className="project-detail-card" key={label} style={{'--glass-delay':`${index*-.85}s`}}>
    <dt><span>{label}</span><span className="project-detail-number" aria-hidden="true">{String(index+1).padStart(2,'0')} / {String(facts.length).padStart(2,'0')}</span></dt>
    <dd>{value}</dd>
   </div>)}</dl>
  </div>
 </section>;
}
