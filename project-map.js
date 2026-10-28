function coordinates(project){
 const lat=project.latitude,lng=project.longitude;
 if(lat!==null&&lat!==undefined&&lat!==''&&lng!==null&&lng!==undefined&&lng!==''&&Number.isFinite(+lat)&&Number.isFinite(+lng)&&Math.abs(+lat)<=90&&Math.abs(+lng)<=180)return [+lat,+lng];
 const link=project.mapUrl||'';const match=link.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)||link.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
 if(match&&Math.abs(+match[1])<=90&&Math.abs(+match[2])<=180)return [+match[1],+match[2]];
 return null;
}
export async function initProjectMap(project){
 if(!window.L)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=resolve;script.onerror=reject;document.head.append(script)});
 const point=coordinates(project),center=point||[4.2,102];
 const map=L.map('projectMap',{scrollWheelZoom:false,zoomControl:false}).setView(center,point?15:6);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 L.control.zoom({position:'topright'}).addTo(map);
 if(point){const icon=L.divIcon({className:'hauszy-map-marker',html:'<span class="pin-ripple"></span><span class="brand-pin"><span>h.</span></span>',iconSize:[54,64],iconAnchor:[27,58]});const marker=L.marker(point,{icon,title:project.name}).addTo(map);const popup=document.createElement('div');const title=document.createElement('strong');title.textContent=project.name;const label=document.createElement('p');label.textContent=project.location;popup.append(title,label);marker.bindPopup(popup)}
 document.querySelector('#mapStatus').textContent=point?'Project location · Zoom and drag to explore':'Malaysia overview · Exact project pin has not been added yet';
 document.querySelector('#recenterMap').onclick=()=>map.flyTo(center,point?15:6,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches,duration:1});
 const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(document.querySelector('#projectMap'));
}
