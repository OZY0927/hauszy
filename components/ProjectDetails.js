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
 const cardSizes={'Project name':'feature','Developer':'wide','Project location':'wide','Property type':'compact','Price per sqft':'tall','Tenure':'compact','Title':'compact','Total units':'feature','Towers / blocks':'compact','Total floors':'compact','Units per floor':'wide','Total lifts':'compact','Construction status':'wide','Estimated vacant possession':'wide'};
 return <section className="project-story-section project-details" id="details" aria-labelledby="project-details-title">
  <div className="project-details-inner">
   <div className="project-details-intro project-story-section-heading">
    <div><span className="eyebrow">THE FINER DETAILS</span><h2 id="project-details-title">Every detail.<br/><em>A clearer picture.</em></h2><p>Get to know your next address. All the essentials, at a glance.</p>
     <div className="project-details-summary">{facts.length} project details <span>One complete picture.</span></div>
    </div>
   </div>
   <dl className="project-details-content" aria-label="Project specifications">{facts.map(([label,value],index)=><div className="project-detail-card" data-card-size={cardSizes[label]} key={label} style={{'--glass-delay':`${index*-.85}s`}}>
    <dt><span>{label}</span><span className="project-detail-number" aria-hidden="true">{String(index+1).padStart(2,'0')} / {String(facts.length).padStart(2,'0')}</span></dt>
    <dd>{value}</dd>
   </div>)}</dl>
  </div>
 </section>;
}
