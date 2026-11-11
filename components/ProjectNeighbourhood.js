'use client';
import {useEffect,useRef,useState} from 'react';
import ProjectMap from './ProjectMap';
import Icon from './Icon';
import {hasProjectInfo} from '../lib/project-visibility';
import {NEARBY_CATEGORIES} from '../lib/nearby-places';

export default function ProjectNeighbourhood({project,hasCoordinates}){
 const [selected,setSelected]=useState(null);
 const section=useRef(null);
 const location=hasProjectInfo(project.location)?project.location:null;
 const mapsUrl=hasCoordinates?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${project.latitude},${project.longitude}`):null;
 useEffect(()=>{
  const el=section.current;
  if(!el||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){el.classList.add('location-in-view');observer.disconnect()}},{threshold:.08});
  el.classList.add('location-reveal-ready');observer.observe(el);
  return()=>{observer.disconnect();el.classList.remove('location-reveal-ready','location-in-view')};
 },[]);
 return <section ref={section} className="project-story-neighbourhood location-atlas" id="location" aria-labelledby="location-title">
  <div className="location-atlas-stage">
   <aside className="location-atlas-sidebar">
    <div className="location-atlas-heading"><span className="eyebrow">THE NEIGHBOURHOOD</span><h2 id="location-title">Location<span>.</span></h2><p>{hasCoordinates?'Choose a category to explore within 3 km.':'Around your next address.'}</p></div>
    <nav className="location-atlas-categories" aria-label="Nearby place categories">
     <button type="button" disabled={!hasCoordinates} aria-pressed={!selected} aria-controls="projectMap" onClick={()=>setSelected(null)}><span className="location-category-arrow"><Icon name="home"/></span><span>Project location</span></button>
     {NEARBY_CATEGORIES.map((category,index)=><button type="button" key={category.id} disabled={!hasCoordinates} aria-pressed={selected===category.id} aria-controls="projectMap" onClick={()=>setSelected(category.id)} style={{'--location-order':index+1}}><span className="location-category-arrow"><Icon name={category.icon}/></span><span>{category.label}</span><Icon name="arrowUpRight"/></button>)}
    </nav>
    <div className="location-atlas-address"><Icon name="mapPin"/><strong>{project.name}</strong>{location&&<p>{location}</p>}{mapsUrl&&<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps <Icon name="arrowUpRight"/></a>}</div>
   </aside>
   <div className="location-atlas-map">{hasCoordinates?<ProjectMap project={project} category={selected}/>:<div className="location-atlas-fallback"><Icon name="mapPin"/><h3>{location||project.name}</h3><p>Add the project's map coordinates to explore nearby places.</p></div>}</div>
  </div>
 </section>;
}
