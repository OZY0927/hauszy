'use client';
import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';
import {coordinates,NEARBY_CATEGORIES} from '../lib/nearby-places';

const EMPTY=[];
export default function ProjectMap({project,category=null}){
 const container=useRef(null),mapRef=useRef(null),cached=useRef(null);
 const [ready,setReady]=useState(false),[mapError,setMapError]=useState(false),[attempt,setAttempt]=useState(0);
 const [search,setSearch]=useState({id:null,status:'idle',data:null,error:''});
 const active=NEARBY_CATEGORIES.find(item=>item.id===category);
 const data=search.id===project.id?search.data:null;
 const places=active&&data?data.categories[active.id]||EMPTY:EMPTY;
 const searching=Boolean(active)&&!data&&search.status!=='error';
 const error=active&&search.id===project.id&&search.status==='error'?search.error:'';
 const wantsPlaces=Boolean(active);
 useEffect(()=>{
  if(!wantsPlaces||!project.id)return;
  if(cached.current?.id===project.id){setSearch({id:project.id,status:'ready',data:cached.current.data,error:''});return}
  const controller=new AbortController();
  setSearch({id:project.id,status:'loading',data:null,error:''});
  fetch(`/api/projects/${encodeURIComponent(project.id)}/nearby/`,{signal:controller.signal}).then(async response=>{
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Nearby places are temporarily unavailable.');
   if(!result.categories)throw Error('Nearby places could not be loaded.');
   return result;
  }).then(result=>{
   if(controller.signal.aborted)return;
   cached.current={id:project.id,data:result};setSearch({id:project.id,status:'ready',data:result,error:''});
  }).catch(error=>{if(!controller.signal.aborted)setSearch({id:project.id,status:'error',data:null,error:error.message})});
  return()=>controller.abort();
 },[project.id,wantsPlaces,attempt]);
 useEffect(()=>{
  let cancelled=false,map,observer;
  setReady(false);setMapError(false);
  import('leaflet').then(module=>{
   if(cancelled)return;
   const L=module.default,point=coordinates(project.latitude,project.longitude);
   if(!point)throw Error('Missing project coordinates');
   map=L.map(container.current,{scrollWheelZoom:false,zoomControl:false}).setView(point,15);
   const layer=L.layerGroup().addTo(map);
   mapRef.current={map,L,point,layer,markers:new Map()};
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
   L.control.zoom({position:'topright'}).addTo(map);
   const icon=L.divIcon({className:'hauszy-map-marker',html:'<span class="pin-ripple"></span><span class="brand-pin"><span>h.</span></span>',iconSize:[54,64],iconAnchor:[27,58]});
   const label=document.createElement('strong');label.textContent=project.name;
   L.marker(point,{icon,title:project.name,zIndexOffset:1000}).addTo(map).bindPopup(label);
   observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(container.current);setReady(true);
  }).catch(()=>{if(!cancelled)setMapError(true)});
  return()=>{cancelled=true;observer?.disconnect();map?.remove();mapRef.current=null};
 },[project.latitude,project.longitude,project.name]);
 useEffect(()=>{
  if(!ready||!mapRef.current)return;
  const {map,L,point,layer,markers}=mapRef.current;
  layer.clearLayers();markers.clear();map.closePopup();map.stop();
  places.forEach((place,index)=>{
   const popup=document.createElement('div');popup.className='nearby-map-popup';
   const name=document.createElement('strong');name.textContent=place.name;popup.append(name);
   const detail=document.createElement('p');detail.textContent=`${place.kind} · ${(place.distance/1000).toFixed(1)} km in a straight line`;popup.append(detail);
   const link=document.createElement('a');link.href=`https://www.openstreetmap.org/${place.id}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='View on OpenStreetMap';popup.append(link);
   const icon=L.divIcon({className:'nearby-map-marker',html:`<span>${index+1}</span>`,iconSize:[30,30],iconAnchor:[15,15]});
   const marker=L.marker([place.latitude,place.longitude],{icon,title:place.name,alt:place.name}).addTo(layer).bindPopup(popup);
   markers.set(place.id,marker);
  });
  const animate=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(places.length){
   const compact=matchMedia('(max-width:650px)').matches;
   map.fitBounds(L.latLngBounds([point,...places.map(place=>[place.latitude,place.longitude])]),{paddingTopLeft:compact?[25,190]:[270,35],paddingBottomRight:[40,35],maxZoom:16,animate});
  }else map.setView(point,15,{animate});
 },[ready,places,category]);
 function focusPlace(place){
  const state=mapRef.current;if(!state)return;
  state.map.panTo([place.latitude,place.longitude],{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});state.markers.get(place.id)?.openPopup();
 }
 const status=mapError?'Map could not load. Please refresh to try again.':!ready?'Loading map…':searching?'Finding nearby places…':error?'Nearby search unavailable.':active?`${places.length===30?'Up to ':''}${places.length} ${active.label.toLowerCase()} places within 3 km`:'Project location · Choose a category to see nearby places';
 return <div className="project-map-shell">
  <div className="map-heading"><span>EXPLORE THE NEIGHBOURHOOD</span><strong>{project.location}</strong></div>
  <div className="nearby-map-stage">
   <div id="projectMap" ref={container} role="region" aria-label="Interactive project location map"/>
   {active&&<div className="nearby-map-results" aria-busy={searching}>
    <div className="nearby-map-results-heading"><Icon name={active.icon}/><strong>{active.label}</strong>{data&&<small>{places.length===30?'30 max':places.length}</small>}</div>
    <div role="status" className="nearby-map-message">{searching?'Finding places within 3 km…':error?<><p>{error}</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>Try again</button></>:data&&!places.length?'No mapped places found in this category within 3 km.':null}</div>
    {places.length>0&&<><ol aria-label={`Nearby ${active.label.toLowerCase()}`}>{places.map((place,index)=><li key={place.id}><button type="button" onClick={()=>focusPlace(place)}><span>{index+1}</span><strong>{place.name}</strong><small>{(place.distance/1000).toFixed(1)} km</small></button></li>)}</ol><p className="nearby-map-note">Tap a place or pin. Straight-line distances.</p></>}
    <p className="nearby-map-source">OpenStreetMap data · Coverage may vary.</p>
   </div>}
  </div>
  <div className="map-footer"><span role="status">{status}</span><button type="button" id="recenterMap" disabled={!ready||mapError} onClick={()=>{const state=mapRef.current;if(state)state.map.setView(state.point,15,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches})}}><Icon name="locate"/> Recenter</button></div>
 </div>;
}
