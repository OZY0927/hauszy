'use client';
import {useEffect,useImperativeHandle,useRef,useState} from 'react';
import {coordinates} from '../lib/nearby-places';

// The map marks the project only. Manually entered amenities remain a text directory.
export default function ProjectMap({project,children,ref}){
 const container=useRef(null),mapRef=useRef(null);
 const [ready,setReady]=useState(false),[mapError,setMapError]=useState(false);
 useImperativeHandle(ref,()=>({recenter(){const state=mapRef.current;if(state){state.map.stop();state.map.closePopup();state.map.setView(state.point,15,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches})}}}),[]);
 useEffect(()=>{
  let cancelled=false,map,observer;
  setReady(false);setMapError(false);
  import('leaflet').then(module=>{
   if(cancelled)return;
   const L=module.default,point=coordinates(project.latitude,project.longitude);
   if(!point)throw Error('Missing project coordinates');
   map=L.map(container.current,{scrollWheelZoom:false,zoomControl:false}).setView(point,15);
   mapRef.current={map,point};
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
   L.control.zoom({position:'topright'}).addTo(map);
   const icon=L.divIcon({className:'hauszy-map-marker',html:'<span class="pin-ripple"></span><span class="brand-pin"><span>h.</span></span>',iconSize:[54,64],iconAnchor:[27,58]});
   const label=document.createElement('strong');label.textContent=project.name;
   L.marker(point,{icon,title:project.name,zIndexOffset:1000}).addTo(map).bindPopup(label);
   if('ResizeObserver' in window){observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(container.current)}
   setReady(true);
  }).catch(()=>{if(!cancelled)setMapError(true)});
  return()=>{cancelled=true;observer?.disconnect();map?.remove();mapRef.current=null};
 },[project.latitude,project.longitude,project.name]);
 const status=mapError?'Map could not load. Please refresh to try again.':!ready?'Loading map…':'Project location';
 return <div className="project-map-shell">
  <div className="map-heading"><span>EXPLORE THE NEIGHBOURHOOD</span><strong>{project.location}</strong></div>
  <div className="nearby-map-stage"><div id="projectMap" ref={container} role="region" aria-label="Interactive project location map"/>{children}</div>
  <span className="project-map-status" role="status">{status}</span>
 </div>;
}
