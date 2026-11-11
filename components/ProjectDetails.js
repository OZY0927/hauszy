import {visibleFacts} from '../lib/project-visibility';
import {money,formatRange,pricePerSqft,vpQuarter} from '../lib/project';

export default function ProjectDetails({project:p}){
 const price=pricePerSqft(p);
 const groups=[
  {id:'address',title:'The address',rows:[['Project name',p.name],['Developer',p.developer],['Project location',p.location],['Property type',p.type]]},
  {id:'building',title:'The building',figures:true,rows:[['Total units',p.totalUnits],['Towers / blocks',p.towers],['Total floors',formatRange([p.floors,p.floorsMax])],['Units per floor',formatRange([p.unitsPerFloor,p.unitsPerFloorMax])],['Total lifts',p.totalLifts]]},
  {id:'ownership',title:'Ownership & timeline',rows:[['Tenure',p.tag],['Title',p.titleType],['Price per sqft',price?money(price)+' / sqft':null],['Construction status',p.construction],['Estimated vacant possession',vpQuarter(p.vp)]]},
 ].map(group=>({...group,rows:visibleFacts(group.rows)})).filter(group=>group.rows.length);
 return <section className="project-story-section project-details" id="details" aria-labelledby="project-details-title">
  <div className="project-details-inner">
   <div className="project-details-intro project-story-section-heading">
    <div><span className="eyebrow">THE FINER DETAILS</span><h2 id="project-details-title">Every detail.<br/><em>A clearer picture.</em></h2><p>The address, the architecture and the essentials of ownership. Get to know what comes next.</p>
     <nav className="project-details-index" aria-label="Project specification groups">{groups.map((group,index)=><a key={group.id} href={'#details-'+group.id}><span>{String(index+1).padStart(2,'0')}</span>{group.title}<span aria-hidden="true">↗</span></a>)}</nav>
    </div>
   </div>
   <div className="project-details-content">{groups.map((group,index)=><section className={'project-details-group'+(group.figures?' project-details-figures':'')} id={'details-'+group.id} key={group.id} aria-labelledby={'details-'+group.id+'-title'}>
    <div className="project-details-group-heading"><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3 id={'details-'+group.id+'-title'}>{group.title}</h3></div>
    <dl className="project-details-facts">{group.rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   </section>)}</div>
  </div>
 </section>;
}
