'use client';
import {PROPERTY_CATEGORIES} from '../lib/property-category';
const categoryImages={Apartment:'/property-types/apartment.svg',Landed:'/property-types/landed.svg',Commercial:'/property-types/commercial.svg'};
export default function PropertyTypeFilter({value,onChange}){
 return <fieldset className="catalog-types catalog-sculpture-types"><legend>PROPERTY TYPE</legend><div className="property-sculpture-scene">{PROPERTY_CATEGORIES.map(category=><button type="button" key={category} className={'property-category'+(value==='group:'+category?' is-selected':'')} aria-pressed={value==='group:'+category} onClick={()=>onChange(value==='group:'+category?'':'group:'+category)}><img className="property-category-image" src={categoryImages[category]} width="512" height="512" alt="" draggable={false}/><span>{category}</span></button>)}</div><button type="button" className="property-category-all" aria-pressed={!value} onClick={()=>onChange('')}>{value?'Show all property types':'All property types'}<span aria-hidden="true">{value?'↗':'✓'}</span></button></fieldset>;
}
