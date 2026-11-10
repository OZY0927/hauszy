'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import CollectionCard from './CollectionCard';
import PropertyTypeFilter from './PropertyTypeFilter';
import CompareProjects from './CompareProjects';
import Icon from './Icon';
import {SORTS,compactMoney,filterProjects,sortProjects} from '../lib/project';

const BATCH_SIZE=12;
export default function ProjectCatalog({projects=[],error=false}){
 const [location,setLocation]=useState(''),[type,setType]=useState(''),[minimum,setMinimum]=useState(0),[maximum,setMaximum]=useState(null),[savedOnly,setSavedOnly]=useState(false),[saved,setSaved]=useState([]),[order,setOrder]=useState('name-asc'),[view,setView]=useState('grid'),[comparing,setComparing]=useState(false),[open,setOpen]=useState(false),[visibleCount,setVisibleCount]=useState(BATCH_SIZE),[manualLoad,setManualLoad]=useState(false),[island,setIsland]=useState(null),[mounted,setMounted]=useState(false);
 const drawer=useRef(null),filterTrigger=useRef(null),sentinel=useRef(null);
 useEffect(()=>{
  setMounted(true);setIsland(document.getElementById('hauszy-catalog-controls'));
  try{const value=JSON.parse(localStorage.getItem('hauszy-saved')||'[]');if(Array.isArray(value))setSaved(value.map(String));setView(localStorage.getItem('hauszy-catalog-view')==='list'?'list':'grid')}catch{}
  setManualLoad(!('IntersectionObserver' in window));
  const url=new URL(window.location.href);if(url.searchParams.has('page')){url.searchParams.delete('page');window.history.replaceState(window.history.state,'',url)}
 },[]);
 useEffect(()=>{setVisibleCount(BATCH_SIZE)},[location,type,minimum,maximum,savedOnly,order,savedOnly?saved.join(','):'']);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open]);
 const ceiling=Math.ceil(Math.max(1000000,...projects.map(p=>p.priceMax||p.price||0),minimum,maximum||0)/100000)*100000;
 const found=sortProjects(filterProjects(projects,{location,type,minimum,maximum,savedOnly,saved}),order),shown=found.slice(0,visibleCount),hasMore=shown.length<found.length;
 const savedProjects=saved.map(id=>projects.find(p=>p.id===id)).filter(Boolean);
 const filterCount=Number(!!location.trim())+Number(!!type)+Number(minimum>0||maximum!==null);
 const rangeText=!minimum&&maximum===null?'Any budget':`${compactMoney(minimum)||'RM 0'} – ${maximum===null?'Any':compactMoney(maximum)||'RM 0'}`;
 useEffect(()=>{
  if(error||!hasMore||open||!sentinel.current||!('IntersectionObserver' in window))return;
  let active=true;const observer=new IntersectionObserver(entries=>{if(active&&entries.some(e=>e.isIntersecting)){active=false;observer.disconnect();setVisibleCount(count=>count+BATCH_SIZE)}},{rootMargin:'0px 0px 300px 0px'});
  observer.observe(sentinel.current);return()=>{active=false;observer.disconnect()};
 },[error,hasMore,open,visibleCount,found.length,location,type,minimum,maximum,savedOnly,order]);
 function save(id){const value=saved.includes(id)?saved.filter(v=>v!==id):[...saved,id];setSaved(value);try{localStorage.setItem('hauszy-saved',JSON.stringify(value))}catch{}}
 function chooseView(value){setView(value);try{localStorage.setItem('hauszy-catalog-view',value)}catch{}}
 function reset(){setLocation('');setType('');setMinimum(0);setMaximum(null);setSavedOnly(false);setOrder('name-asc')}
 function showFilters(){if(drawer.current&&!drawer.current.open){drawer.current.showModal();setOpen(true)}}
 function closeFilters(){drawer.current?.close()}
 const controls=<div className="catalog-island-controls">
  <button ref={filterTrigger} type="button" className="catalog-filter-trigger" onClick={showFilters} aria-label="Filter and sort projects" aria-haspopup="dialog" aria-expanded={open} aria-controls="catalog-filter-drawer"><Icon name="sliders"/><span>Filter & sort</span>{filterCount>0&&<b>{filterCount}</b>}</button>
  <div className="catalog-view-switch" role="group" aria-label="Project layout">
   <button type="button" aria-label="Grid view" title="Grid view" aria-pressed={view==='grid'} onClick={()=>chooseView('grid')}><Icon name="grid"/></button>
   <button type="button" aria-label="List view" title="List view" aria-pressed={view==='list'} onClick={()=>chooseView('list')}><Icon name="list"/></button>
  </div>
 </div>;
 return <div className={`project-catalog catalog-browser catalog-view-${view}`}>
  {island&&createPortal(controls,island)}
  {mounted&&createPortal(<dialog ref={drawer} id="catalog-filter-drawer" className="catalog-drawer" aria-labelledby="catalog-drawer-title" onClose={()=>{setOpen(false);filterTrigger.current?.focus()}} onClick={event=>{if(event.target!==drawer.current)return;const rect=drawer.current.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeFilters()}}>
   <div className="catalog-drawer-head"><div><span className="eyebrow">YOUR PENANG SHORTLIST</span><h2 id="catalog-drawer-title">Find your space.</h2></div><button type="button" className="catalog-drawer-close" onClick={closeFilters} aria-label="Close filters"><Icon name="x"/></button></div>
   <div className="project-catalog catalog-drawer-content"><section className="search-wrap catalog-filters is-open" aria-label="Project filters">
    <form onSubmit={event=>{event.preventDefault();closeFilters()}} id="catalog-filter-form">
     <label className="catalog-sort-field"><span><Icon name="sort"/> SORT BY</span><select value={order} onChange={event=>setOrder(event.target.value)}>{SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
     <label className="location"><Icon name="mapPin"/> LOCATION<input type="search" list="catalog-locations" placeholder="e.g. Bayan Lepas, Batu Kawan" value={location} onChange={event=>setLocation(event.target.value)}/><datalist id="catalog-locations">{[...new Set(projects.map(p=>p.location))].map(value=><option key={value} value={value}/>)}</datalist></label>
     <PropertyTypeFilter value={type} onChange={setType}/>
     <div className="price-filter"><div className="price-filter-heading"><span><Icon name="banknote"/> PRICE RANGE</span><output>{rangeText}</output></div>
      <div className="dual-price-range"><div className="range-track" style={{background:`linear-gradient(to right,#e7d8c7 ${minimum/ceiling*100}%,var(--primary) ${minimum/ceiling*100}%,var(--primary) ${(maximum??ceiling)/ceiling*100}%,#e7d8c7 ${(maximum??ceiling)/ceiling*100}%)`}}/>
       <input id="priceMin" type="range" aria-label="Minimum project price" min="0" max={ceiling} step="1000" value={minimum} onChange={event=>setMinimum(Math.min(+event.target.value,maximum??ceiling))}/>
       <input id="price" type="range" aria-label="Maximum project price" min="0" max={ceiling} step="1000" value={maximum??ceiling} onChange={event=>setMaximum(Math.max(minimum,+event.target.value))}/>
      </div>
      <div className="price-range-ends"><label className="exact-price-label">Min RM<input type="number" min="0" aria-label="Exact minimum price in RM" value={minimum||''} placeholder="0" onChange={event=>{const n=Math.max(0,+event.target.value);setMinimum(n);if(maximum!==null&&n>maximum)setMaximum(n)}}/></label><label className="exact-price-label">Max RM<input type="number" min="0" aria-label="Exact maximum price in RM" value={maximum??''} placeholder="Any" onChange={event=>{const n=event.target.value===''?null:Math.max(0,+event.target.value);setMaximum(n);if(n!==null&&n<minimum)setMinimum(n)}}/></label></div>
     </div>
     <p className="catalog-filter-note" aria-live="polite">{found.length} {found.length===1?'project matches':'projects match'} your search. Filters update automatically.</p>
    </form>
   </section></div>
   <div className="catalog-drawer-foot"><button type="button" onClick={reset}>Reset all</button><button type="submit" form="catalog-filter-form" className="catalog-show-results">Show {found.length} {found.length===1?'project':'projects'}<Icon name="arrowRight"/></button></div>
  </dialog>,document.body)}
  <section className="collection" id="listings" aria-label="Project collection">
   <div className="catalog-toolbar">
    <label className="catalog-scope"><span className="catalog-sr-only">Browse project collection</span><select value={savedOnly?'saved':'all'} onChange={event=>setSavedOnly(event.target.value==='saved')}><option value="all">Browse all</option><option value="saved">Saved projects ({savedProjects.length})</option></select><Icon name="chevronDown"/></label>
    <span className="catalog-result-count" role="status">{found.length} {found.length===1?'project':'projects'}</span>
    <button type="button" className="catalog-compare" disabled={savedProjects.length<2} onClick={()=>setComparing(true)} title={savedProjects.length<2?'Save at least two projects to compare':undefined}><Icon name="compare"/><span>Compare saved</span>{savedProjects.length>0&&<b>{savedProjects.length}</b>}</button>
    {!island&&<div className="catalog-controls-fallback">{controls}</div>}
   </div>
   {(filterCount>0||savedOnly)&&<div className="catalog-active-filters" aria-label="Active filters">
    {location.trim()&&<button type="button" onClick={()=>setLocation('')} aria-label="Remove location filter">{location}<Icon name="x"/></button>}
    {type&&<button type="button" onClick={()=>setType('')} aria-label="Remove property type filter">{type.replace(/^group:/,'')}<Icon name="x"/></button>}
    {(minimum>0||maximum!==null)&&<button type="button" onClick={()=>{setMinimum(0);setMaximum(null)}} aria-label="Remove price filter">{rangeText}<Icon name="x"/></button>}
    {savedOnly&&<button type="button" onClick={()=>setSavedOnly(false)}>Saved projects<Icon name="x"/></button>}
    <button type="button" className="catalog-reset-link" onClick={reset}>Clear all</button>
   </div>}
   <CompareProjects projects={savedProjects} open={comparing} onClose={()=>setComparing(false)} onRemove={save}/>
   {error?<div className="empty-state" role="alert"><Icon name="circleAlert"/>Projects could not be loaded.<button type="button" className="outline" onClick={()=>window.location.reload()}>Try again</button></div>:found.length?<div className="cards">{shown.map(project=><CollectionCard key={project.id} project={project} saved={saved.includes(project.id)} onSave={save}/>)}</div>:<div className="empty-state"><p>{projects.length?'No projects match your filters.':'Penang property listings will appear here as they become available.'}</p>{projects.length>0&&<button type="button" className="outline" onClick={reset}>Clear filters</button>}</div>}
   {!error&&found.length>0&&<div className="project-scroll-status"><p role="status" aria-live="polite">Showing {shown.length} of {found.length} projects{!hasMore?' · All projects shown':''}</p>{hasMore&&<div ref={sentinel} className="project-scroll-sentinel">{manualLoad?<button type="button" className="outline" onClick={()=>setVisibleCount(count=>count+BATCH_SIZE)}>Show more projects</button>:<span>Scroll to see more projects</span>}</div>}</div>}
  </section>
 </div>;
}
