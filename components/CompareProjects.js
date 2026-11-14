'use client';
import {useEffect,useRef} from 'react';
import Link from 'next/link';
import {compactMoney,listingName,completionTime,largestSize,maintenanceFee,maintenanceBasis,maintenanceText,priceLow,priceText,pricePerSqft,unitRange,unitText,vpQuarter} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';
import Icon from './Icon';
const text=v=>hasProjectInfo(v)?String(v):null,fmt=n=>n.toLocaleString('en-MY');
const completion=p=>[vpQuarter(p.vp),text(p.construction)].filter(Boolean).join(' · ')||null;
// [label, shown text, figure to rank by, 'low'|'high' is better, tag on the best]
const ROWS=[
 ['Price',p=>priceText(p,compactMoney),priceLow,'low','Lowest'],
 ['Price per sqft',p=>{const v=pricePerSqft(p);return v?`RM ${fmt(v)}`:null},pricePerSqft,'low','Lowest'],
 ['Built-up size',p=>unitRange(p.units,'size',' sqft'),largestSize,'high','Largest'],
 ['Bedrooms',p=>unitText(p.units,'bedrooms')],
 ['Bathrooms',p=>unitText(p.units,'bathrooms')],
 ['Tenure',p=>text(p.tenure)],
 ['Maintenance fee',maintenanceText],
 ['Completion',completion,completionTime,'low','Earliest'],
 ['Property type',p=>text(p.type)],
 ['Developer',p=>text(p.developer)],
 ['Location',p=>text(p.location)]];
function winners(projects,value,better){if(!value)return new Set();const rows=projects.map(p=>[p.id,value(p)]).filter(([,v])=>v!=null);if(rows.length<2)return new Set();const values=rows.map(([,v])=>v),target=better==='low'?Math.min(...values):Math.max(...values);return values.every(v=>v===target)?new Set():new Set(rows.filter(([,v])=>v===target).map(([id])=>id))}
// Side-by-side table of the visitor's saved projects, in a modal dialog.
export default function CompareProjects({projects,open,onClose,onRemove}){const dialog=useRef(null);
  useEffect(()=>{const d=dialog.current;if(!d)return;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close()},[open]);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open]);
  return <dialog ref={dialog} className="compare-dialog" style={{'--compare-projects':projects.length}} aria-labelledby="compareTitle" onClose={onClose}>
    <button className="close" onClick={()=>dialog.current?.close()} aria-label="Close comparison"><Icon name="x"/></button>
    <div className="compare-head"><div><div className="eyebrow">A CLOSER LOOK AT YOUR SHORTLIST</div><h2 id="compareTitle">Good places.<br/>A clearer choice<span>.</span></h2></div><span className="compare-count">{String(projects.length).padStart(2,'0')}<small>projects to compare</small></span></div>
    {projects.length<2?<p className="compare-empty"><Icon name="heart"/> Save at least two projects to compare them.</p>:
    <div className="compare-scroll" tabIndex={0} role="region" aria-label="Project comparison table"><table className="compare-table"><thead><tr><th scope="col"><span className="compare-hint">The details<br/>that matter.</span></th>{projects.map(p=><th key={p.id} scope="col"><div className="compare-project"><img src={p.images[0]||'/project-placeholder.svg'} alt="" loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/project-placeholder.svg'}}/><Link href={'/projects/'+encodeURIComponent(p.id)}><span>{listingName(p)}</span> <Icon name="arrowUpRight"/></Link><button type="button" className="compare-remove" onClick={()=>onRemove(p.id)} aria-label={`Remove ${listingName(p)} from saved projects`}><Icon name="x"/> <span>Remove</span></button></div></th>)}</tr></thead>
      <tbody>{ROWS.map(([label,show,value,better,tag])=>{const feeValue=label==='Maintenance fee'&&new Set(projects.filter(p=>maintenanceFee(p)!=null).map(maintenanceBasis)).size===1?maintenanceFee:value;const best=winners(projects,feeValue,label==='Maintenance fee'?'low':better);return <tr key={label} className={label==='Price'?'compare-price-row':undefined}><th scope="row">{label}</th>{projects.map(p=>{const shown=show(p);return <td key={p.id} className={best.has(p.id)?'best':undefined}>{shown??<span className="compare-missing">Not stated</span>}{best.has(p.id)&&<span className="compare-best"><Icon name="check"/> {tag||'Lowest'}</span>}</td>})}</tr>})}</tbody></table></div>}
    <p className="compare-note">Figures come from each project's listing and may change. Price per sqft is the lowest layout price divided by the smallest layout size.</p>
  </dialog>}
