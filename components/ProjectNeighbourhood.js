'use client';
import {useEffect,useRef,useState} from 'react';
import ProjectMap from './ProjectMap';
import Icon from './Icon';
import {nearbyIcon} from '../lib/icon-match';
import {withUnit} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';

export default function ProjectNeighbourhood({project,groups,hasCoordinates}){
 const [selected,setSelected]=useState(null);
 const section=useRef(null);
 const active=groups.find(group=>group.label===selected)||groups[0];
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
    <div className="location-atlas-heading"><span className="eyebrow">THE NEIGHBOURHOOD</span><h2 id="location-title">Location<span>.</span></h2><p>Around your next address.</p></div>
    {active&&<nav className="location-atlas-categories" aria-label="Nearby place categories">{groups.map((group,index)=><button type="button" key={group.label} aria-pressed={active.label===group.label} aria-controls="location-places" onClick={()=>setSelected(group.label)} style={{'--location-order':index}}><span className="location-category-arrow"><Icon name="arrowUpRight"/></span><span>{group.label}</span><small>{String(group.rows.length).padStart(2,'0')}</small></button>)}</nav>}
    <div className="location-atlas-address"><Icon name="mapPin"/><strong>{project.name}</strong>{location&&<p>{location}</p>}{mapsUrl&&<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps <Icon name="arrowUpRight"/></a>}</div>
   </aside>
   <div className="location-atlas-map">{hasCoordinates?<ProjectMap project={project}/>:<div className="location-atlas-fallback"><Icon name="mapPin"/><h3>{location||project.name}</h3><p>The exact map pin will be added when available.</p></div>}</div>
  </div>
  {active&&<div className="project-story-section location-atlas-directory" id="location-places">
   <div className="location-directory-intro"><span className="eyebrow">AROUND THE CORNER</span><h3>Close to<br/>what matters.</h3><p>Explore the places nearby.</p></div>
   <div className="location-places" key={active.label} aria-live="polite" aria-atomic="true"><div className="location-places-heading"><h4><Icon name={nearbyIcon(active.label)}/>{active.label}</h4><span>{active.rows.length} {active.rows.length===1?'place':'places'}</span></div><ul>{active.rows.map((row,index)=><li key={index} style={{'--location-order':Math.min(index,6)}}><span className="location-place-index">{String(index+1).padStart(2,'0')}</span><div><strong>{row.name}</strong><div className="location-place-meta">{hasProjectInfo(row.distance)&&<span><Icon name="mapPin"/>{withUnit(row.distance,'km')}</span>}{hasProjectInfo(row.travelTime)&&<span><Icon name="clock"/>{withUnit(row.travelTime,'mins')}</span>}</div></div><Icon name={nearbyIcon(active.label)}/></li>)}</ul><p className="project-story-fine-print">Distances and travel times are approximate and may vary with conditions.</p></div>
  </div>}
 </section>;
}
