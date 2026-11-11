'use client';
import {useEffect,useRef,useState} from 'react';
import ProjectMap from './ProjectMap';
import Icon from './Icon';
import {hasProjectInfo} from '../lib/project-visibility';
import {groupAmenities,withUnit} from '../lib/project';
import {nearbyIcon} from '../lib/icon-match';

export default function ProjectNeighbourhood({project,hasCoordinates,amenities=[]}){
 const [selected,setSelected]=useState(null);
 const section=useRef(null);
 const map=useRef(null);
 const groups=groupAmenities(amenities),active=groups.find(group=>group.label===selected);
 const places=active&&<div key={active.label} className="nearby-map-results manual-amenity-results" id="location-places" aria-live="polite" aria-atomic="true"><div className="nearby-map-results-heading"><Icon name={nearbyIcon(active.label)}/><strong>{active.label}</strong><small>{active.rows.length}</small></div><ol aria-label={active.label}>{active.rows.map((row,index)=><li key={index}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{row.name}</strong><div className="manual-amenity-meta">{hasProjectInfo(row.distance)&&<span>{withUnit(row.distance,'km')}</span>}{hasProjectInfo(row.travelTime)&&<span><Icon name="clock"/>{withUnit(row.travelTime,'mins')}</span>}</div></div></li>)}</ol>{active.rows.some(row=>hasProjectInfo(row.distance)||hasProjectInfo(row.travelTime))&&<p className="nearby-map-note">Distances and travel times are approximate.</p>}</div>;
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
    <nav className="location-atlas-categories" aria-label="Nearby place categories">
     <button type="button" aria-pressed={!active} aria-controls={hasCoordinates?'projectMap':undefined} onClick={()=>{setSelected(null);map.current?.recenter()}}><span className="location-category-arrow"><Icon name="home"/></span><span>Project location</span></button>
     {groups.map((group,index)=><button type="button" key={group.label} aria-pressed={active?.label===group.label} aria-controls={active?.label===group.label?'location-places':undefined} onClick={()=>setSelected(group.label)} style={{'--location-order':index+1}}><span className="location-category-arrow"><Icon name={nearbyIcon(group.label)}/></span><span>{group.label}</span><small>{String(group.rows.length).padStart(2,'0')}</small></button>)}
    </nav>
    <div className="location-atlas-address"><Icon name="mapPin"/><strong>{project.name}</strong>{location&&<p>{location}</p>}{mapsUrl&&<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps <Icon name="arrowUpRight"/></a>}</div>
   </aside>
   <div className="location-atlas-map">{hasCoordinates?<ProjectMap ref={map} project={project}>{places}</ProjectMap>:<div className="nearby-map-stage"><div className="location-atlas-fallback"><Icon name="mapPin"/><h3>{location||project.name}</h3></div>{places}</div>}</div>
  </div>
 </section>;
}
