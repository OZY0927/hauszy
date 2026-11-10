'use client';
import {useState} from 'react';
import ProjectMap from './ProjectMap';
import Icon from './Icon';
import {nearbyIcon} from '../lib/icon-match';
import {withUnit} from '../lib/project';
import {hasProjectInfo} from '../lib/project-visibility';

export default function ProjectNeighbourhood({project,groups,hasCoordinates}){
 const [selected,setSelected]=useState(null);
 const active=groups.find(group=>group.label===selected)||groups[0];
 const location=hasProjectInfo(project.location)?project.location:null;
 const mapsUrl=hasCoordinates?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${project.latitude},${project.longitude}`):null;
 return <section className="project-story-neighbourhood neighbourhood-editorial" id="location"><div className="project-story-section">
  <div className="neighbourhood-heading" data-reveal><div><span className="eyebrow">THE NEIGHBOURHOOD</span><h2>A place to call<br/><em>your own.</em></h2></div><div className="neighbourhood-address"><Icon name="mapPin"/><div><span>FIND YOURSELF HERE</span><p>{location||project.name}</p>{mapsUrl&&<a href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon name="arrowUpRight"/></a>}</div></div></div>
  <div className={'neighbourhood-workspace'+(!groups.length?' without-places':'')}>
   <div className="neighbourhood-map-card" data-reveal><div className="neighbourhood-map-title"><span><i/> PROJECT LOCATION</span><strong>{project.name}</strong></div>{hasCoordinates?<ProjectMap project={project}/>:<div className="neighbourhood-location-fallback"><Icon name="mapPin"/><h3>{location||project.name}</h3><p>The exact map pin will be added when available.</p></div>}</div>
   {active&&<div className="neighbourhood-directory" data-reveal><div className="neighbourhood-directory-heading"><span className="eyebrow">AROUND THE CORNER</span><h3>Close to what matters<span>.</span></h3></div><div className="neighbourhood-categories" aria-label="Nearby place categories">{groups.map(group=><button type="button" key={group.label} aria-pressed={active.label===group.label} onClick={()=>setSelected(group.label)}><Icon name={nearbyIcon(group.label)}/><span>{group.label}</span><small>{group.rows.length}</small></button>)}</div><div className="neighbourhood-place-panel" key={active.label} aria-live="polite" aria-atomic="true"><div className="neighbourhood-list-label"><span>{active.label}</span><small>{active.rows.length} {active.rows.length===1?'place':'places'}</small></div><ul>{active.rows.map((row,index)=><li key={index}><span className="neighbourhood-place-number">{String(index+1).padStart(2,'0')}</span><div><strong>{row.name}</strong>{(hasProjectInfo(row.distance)||hasProjectInfo(row.travelTime))&&<div className="neighbourhood-place-meta">{hasProjectInfo(row.distance)&&<span><Icon name="mapPin"/>{withUnit(row.distance,'km')}</span>}{hasProjectInfo(row.travelTime)&&<span><Icon name="clock"/>{withUnit(row.travelTime,'mins')}</span>}</div>}</div></li>)}</ul></div></div>}
  </div>
  {groups.length>0&&<p className="project-story-fine-print neighbourhood-note">Distances and travel times are approximate and may vary with conditions.</p>}
 </div></section>;
}
