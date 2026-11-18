'use client';
import Icon from './Icon';
// Extra listing filters (after PropertyGuru / iProperty): bedrooms, bathrooms, built-up size, tenure, construction
// status, ready-by year, developer and new launches. `value` is a MORE_FILTERS object; `onChange` receives a patch.
const BEDS=[['','Any'],['studio','Studio'],['1','1+'],['2','2+'],['3','3+'],['4','4+'],['5','5+']];
const BATHS=[['','Any'],['1','1+'],['2','2+'],['3','3+'],['4','4+']];
const TENURE=[['','Any'],['Freehold','Freehold'],['Leasehold','Leasehold']];
const STATUS=[['','Any status'],['Completed','Completed'],['Under construction','Under construction'],['Not started','Not started']];
const firstYear=new Date().getFullYear();
// Completed projects always count as ready.
const READY=[['','Any time'],...Array.from({length:5},(_,i)=>{const y=String(firstYear+i);return [y,`By end ${y}`]})];

function Chips({label,icon,options,value,onPick,wide}){
 return <div className={'catalog-more-group'+(wide?' is-wide':'')} role="group" aria-label={label}>
  <span className="catalog-more-label"><Icon name={icon}/>{label.toUpperCase()}</span>
  <div className="catalog-chip-row">{options.map(([v,text])=><button key={v||'any'} type="button" className="catalog-chip" aria-pressed={value===v} onClick={()=>onPick(v)}>{text}</button>)}</div>
 </div>;
}

export default function MoreFilters({value,onChange,developers=[]}){
 const size=key=>event=>{const n=event.target.value;onChange({[key]:n===''?'':String(Math.max(0,Math.round(+n)))})};
 return <fieldset className="catalog-more">
  <legend className="catalog-screen-reader">More filters</legend>
  <Chips label="Bedrooms" icon="bed" options={BEDS} wide value={value.beds} onPick={beds=>onChange({beds})}/>
  <Chips label="Bathrooms" icon="bath" options={BATHS} value={value.baths} onPick={baths=>onChange({baths})}/>
  <Chips label="Tenure" icon="shieldCheck" options={TENURE} value={value.tenure} onPick={tenure=>onChange({tenure})}/>
  <div className="catalog-more-group catalog-more-size">
   <span className="catalog-more-label"><Icon name="ruler"/>BUILT-UP SIZE (SQFT)</span>
   <div className="catalog-more-pair">
    <label><span>Min</span><input type="number" min="0" step="50" inputMode="numeric" placeholder="Any" aria-label="Minimum built-up size in sqft" value={value.sizeMin} onChange={size('sizeMin')}/></label>
    <label><span>Max</span><input type="number" min="0" step="50" inputMode="numeric" placeholder="Any" aria-label="Maximum built-up size in sqft" value={value.sizeMax} onChange={size('sizeMax')}/></label>
   </div>
  </div>
  <label className="catalog-more-group">
   <span className="catalog-more-label"><Icon name="building"/>CONSTRUCTION</span>
   <select className="catalog-more-input" value={value.status} onChange={e=>onChange({status:e.target.value})}>{STATUS.map(([v,t])=><option key={v||'any'} value={v}>{t}</option>)}</select>
  </label>
  <label className="catalog-more-group">
   <span className="catalog-more-label"><Icon name="calendar"/>READY BY (VP)</span>
   <select className="catalog-more-input" value={value.readyBy} onChange={e=>onChange({readyBy:e.target.value})}>{READY.map(([v,t])=><option key={v||'any'} value={v}>{t}</option>)}</select>
  </label>
  <label className="catalog-more-group">
   <span className="catalog-more-label"><Icon name="badgeCheck"/>DEVELOPER</span>
   <input type="search" className="catalog-more-input" list="catalog-developers" placeholder="e.g. Eco World" value={value.developer} onChange={e=>onChange({developer:e.target.value})}/>
   <datalist id="catalog-developers">{developers.map(d=><option key={d} value={d}/>)}</datalist>
  </label>
  <label className="catalog-more-group catalog-more-toggle">
   <input type="checkbox" checked={value.newLaunch} onChange={e=>onChange({newLaunch:e.target.checked})}/>
   <span className="catalog-switch" aria-hidden="true"/>
   <span><strong>New launches only</strong><small>Only projects marked as a new launch</small></span>
  </label>
 </fieldset>;
}
