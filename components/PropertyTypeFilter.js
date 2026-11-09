'use client';
import {PROPERTY_CATEGORIES} from '../lib/property-category';
function Building({kind}){
 return <svg viewBox="0 0 120 150" fill="none" aria-hidden="true" className="property-sculpture">
  <path className="sculpture-ground" d="M5 119 53 98l62 27-48 20Z"/>
  <g className="sculpture-building" strokeLinejoin="round" strokeLinecap="round">
   {kind==='Apartment'?<><path className="sculpture-side" d="m64 31 30-15v101l-30 18Z"/><path className="sculpture-front" d="M25 13 64 31v104l-39-18Z"/><path className="sculpture-roof" d="m25 13 30-11 39 14-30 15Z"/>{[38,57,76,95].map(y=><g key={y}><path className="sculpture-detail" d={`m34 ${y} 20 9m-20 0 20 9m20-18 11-6`}/></g>)}<path className="sculpture-detail" d="M40 29v78m10-72v77m27-78v75"/></>:kind==='Landed'?<><path className="sculpture-side" d="m65 77 35-19v53l-35 23Z"/><path className="sculpture-front" d="m18 56 47 21v57l-47-22Z"/><path className="sculpture-roof" d="m13 58 24-35 34 15-6 39Z"/><path className="sculpture-roof sculpture-roof-back" d="m37 23 31-14 37 48-40 20 6-39Z"/><path className="sculpture-detail" d="m29 83 13 6v16l-13-6Zm20 13 10 5v28m17-40 14-8v17l-14 9Z"/></>:<><path className="sculpture-side" d="m62 62 44-20v75l-44 20Z"/><path className="sculpture-front" d="m15 42 47 20v75l-47-21Z"/><path className="sculpture-roof" d="m15 42 43-19 48 19-44 20Z"/><path className="sculpture-sign" d="m23 58 31 14v17L23 75Z"/><path className="sculpture-detail" d="m23 91 13 6v26m6-23 13 6v26m18-50 23-10v36l-23 10Zm12-5v35"/><path className="sculpture-awning" d="m15 78 47 21 8-9-47-20Z"/></>}
  </g>
 </svg>;
}
export default function PropertyTypeFilter({value,onChange}){
 return <fieldset className="catalog-types catalog-sculpture-types"><legend>PROPERTY TYPE</legend><div className="property-sculpture-scene">{PROPERTY_CATEGORIES.map(category=><button type="button" key={category} className={'property-category'+(value==='group:'+category?' is-selected':'')} aria-pressed={value==='group:'+category} onClick={()=>onChange(value==='group:'+category?'':'group:'+category)}><Building kind={category}/><span>{category}</span></button>)}</div><button type="button" className="property-category-all" aria-pressed={!value} onClick={()=>onChange('')}>{value?'Show all property types':'All property types'}<span aria-hidden="true">{value?'↗':'✓'}</span></button></fieldset>;
}
