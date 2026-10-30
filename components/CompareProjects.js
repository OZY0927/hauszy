'use client';
import {useEffect,useRef} from 'react';
import Link from 'next/link';
import {completionTime,largestSize,maintenanceFee,money,pricePerSqft,unitRange} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';
import Icon from './Icon';
const text=v=>hasProjectInfo(v)?String(v):null,fmt=n=>n.toLocaleString('en-MY');
const completion=p=>{const t=Date.parse(p.vp),date=Number.isFinite(t)?new Date(t).toLocaleDateString('en-MY',{month:'short',year:'numeric'}):null;return [date,text(p.construction)].filter(Boolean).join(' · ')||null};
// [label, shown text, figure to rank by, 'low'|'high' is better, tag on the best]
const ROWS=[
 ['Price',p=>p.price?(p.priceMax>p.price?`${money(p.price)} – ${money(p.priceMax)}`:`From ${money(p.price)}`):null,p=>p.price||null,'low','Lowest'],
 ['Price per sqft',p=>{const v=pricePerSqft(p);return v?`RM ${fmt(v)}`:null},pricePerSqft,'low','Lowest'],
 ['Built-up size',p=>unitRange(p.units,'size',' sqft'),largestSize,'high','Largest'],
 ['Bedrooms',p=>unitRange(p.units,'bedrooms')],
 ['Bathrooms',p=>unitRange(p.units,'bathrooms')],
 ['Tenure',p=>text(p.tenure)],
 ['Maintenance fee',p=>{const v=maintenanceFee(p);return v?`RM ${v} / sqft`:null},maintenanceFee,'low','Lowest'],
 ['Completion',completion,completionTime,'low','Earliest'],
 ['Property type',p=>text(p.type)],
 ['Developer',p=>text(p.developer)],
 ['Location',p=>text(p.location)]];
function winners(projects,value,better){if(!value)return new Set();const rows=projects.map(p=>[p.id,value(p)]).filter(([,v])=>v!=null);if(rows.length<2)return new Set();const values=rows.map(([,v])=>v),target=better==='low'?Math.min(...values):Math.max(...values);return values.every(v=>v===target)?new Set():new Set(rows.filter(([,v])=>v===target).map(([id])=>id))}
// Side-by-side table of the visitor's saved projects, in a modal dialog.
export default function CompareProjects({projects,open,onClose,onRemove}){const dialog=useRef(null);
  useEffect(()=>{const d=dialog.current;if(!d)return;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close()},[open]);
  return <dialog ref={dialog} className="compare-dialog" aria-labelledby="compareTitle" onClose={onClose}>
    <button className="close" onClick={()=>dialog.current?.close()} aria-label="Close comparison"><Icon name="x"/></button>
    <div className="compare-head"><div className="eyebrow">YOUR SAVED PROJECTS</div><h2 id="compareTitle">Compare side by side</h2></div>
    {projects.length<2?<p className="compare-empty"><Icon name="heart"/> Save at least two projects to compare them.</p>:
    <div className="compare-scroll"><table className="compare-table"><thead><tr><th scope="col"><span className="compare-hint">{projects.length} projects</span></th>{projects.map(p=><th key={p.id} scope="col"><div className="compare-project"><img src={p.images[0]||'/project-placeholder.svg'} alt="" loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/project-placeholder.svg'}}/><Link href={'/projects/'+encodeURIComponent(p.id)}>{p.name} <Icon name="arrowUpRight"/></Link><button type="button" className="compare-remove" onClick={()=>onRemove(p.id)} aria-label={`Remove ${p.name} from saved projects`}><Icon name="heart" filled/> Remove</button></div></th>)}</tr></thead>
      <tbody>{ROWS.map(([label,show,value,better,tag])=>{const best=winners(projects,value,better);return <tr key={label}><th scope="row">{label}</th>{projects.map(p=>{const shown=show(p);return <td key={p.id} className={best.has(p.id)?'best':undefined}>{shown??<span className="compare-missing">Not stated</span>}{best.has(p.id)&&<span className="compare-best"><Icon name="check"/> {tag}</span>}</td>})}</tr>})}</tbody></table></div>}
    <p className="compare-note">Figures come from each project's listing and may change. Price per sqft is worked out from the starting price and smallest layout when the developer hasn't stated it.</p>
  </dialog>}
