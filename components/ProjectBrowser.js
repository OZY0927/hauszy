'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {preloadProjectImages} from '../lib/project-image-preload';
import CardPhoto from './ProjectCardPhoto';
import CollectionCard from './CollectionCard';
import PropertyTypeFilter from './PropertyTypeFilter';
import {DEFAULT_PROJECT_ORDER,PROJECT_BATCH_SIZE,SORTS,MORE_FILTERS,cleanMoreFilters,moreFilterCount,compactMoney,filterProjects,listingName,projectPageCount,projectPageItems,projectPagePath,startingPrice,sortProjects,unitLeast,unitMin} from '../lib/project';
import MoreFilters from './MoreFilters';
import CompareProjects from './CompareProjects';
import Icon from './Icon';
import ProjectListRow from './ProjectListRow';
import {LISTING_SCROLL_KEY,listingReturnSnapshot,isListingReturn} from '../lib/listing-scroll';
export function ProjectCard({project:p,saved=false,onSave}){const [lead,amount]=startingPrice(p)||[],name=listingName(p);return <article className="card"><div className="card-photo"><CardPhoto src={p.images[0]} alt={name}/><span className="badge">{p.mode}</span>{onSave&&<button className={'save '+(saved?'saved':'')} onClick={()=>onSave(p.id)} aria-label={`${saved?'Unsave':'Save'} ${name}`} aria-pressed={saved}><Icon name="heart" filled={saved}/></button>}</div><div className="card-body"><div className="price">{amount?<>{lead&&<small>{lead} </small>}{amount}</>:'Price on enquiry'}</div><h3>{name}</h3><div className="address"><Icon name="mapPin"/> {p.location}</div><div className="specs">{[['bedrooms','bed','bed','beds'],['bathrooms','bath','bath','baths'],['size','ruler','sqft','sqft']].map(([key,icon,one,many])=>{const v=key==='size'?unitMin(p.units,key)?.toLocaleString('en-MY'):unitLeast(p.units,key);return v!=null&&<span key={key}><Icon name={icon}/> {v}{/^\d/.test(v)&&` ${v==='1'?one:many}`}</span>})}</div><div className="card-bottom"><span>{p.type} · {p.tag}</span><Link className="details" href={'/projects/'+encodeURIComponent(p.id)} onNavigate={()=>preloadProjectImages(p)}>Explore project <Icon name="arrowRight"/></Link></div></div></article>}
const GRID_ROWS_PER_PAGE=3;

function CataloguePagination({page,lastPage,pageSize,shown,total,onPage}){
 const numbers=[...new Set([1,page-1,page,page+1,lastPage])].filter(n=>n>=1&&n<=lastPage).sort((a,b)=>a-b);
 function control(target,label,content,className='catalogue-page-control'){
  if(target<1||target>lastPage)return <button type="button" className={className} aria-label={label} disabled>{content}</button>;
  if(target===page)return <span className={className} aria-current="page" aria-label={label}>{content}</span>;
  return onPage
   ? <button type="button" className={className} aria-label={label} onClick={()=>onPage(target)}>{content}</button>
   : <Link className={className} href={projectPagePath(target)} aria-label={label} prefetch={false}>{content}</Link>;
 }
 return <div className={lastPage>1?'catalogue-pagination catalogue-pagination-bar':'catalogue-pagination'}>
  {lastPage>1&&<nav aria-label="Project pages">
    {control(page-1,'Previous page',<><Icon name="chevronLeft"/><span>Previous</span></>,'catalogue-page-control catalogue-page-direction')}
    <div className="catalogue-page-numbers">
     {numbers.map((n,index)=><span className="catalogue-page-number" key={n}>
      {index>0&&n-numbers[index-1]>1&&<span className="catalogue-page-gap" aria-hidden="true">…</span>}
      {control(n,`Page ${n}`,n)}
     </span>)}
    </div>
    {control(page+1,'Next page',<><span>Next</span><Icon name="chevronRight"/></>,'catalogue-page-control catalogue-page-direction')}
  </nav>}
  <p role="status" aria-live="polite">Showing {(page-1)*pageSize+1}–{(page-1)*pageSize+shown} of {total} {total===1?'project':'projects'}</p>
 </div>;
}

export default function ProjectBrowser({projects=[],error=false,home=false,initialPage=1}){
const [location,setLocation]=useState(''),[type,setType]=useState(''),[minimum,setMin]=useState(0),[maximum,setMax]=useState(null);
const [savedOnly,setSavedOnly]=useState(false),[saved,setSaved]=useState([]),[order,setOrder]=useState(DEFAULT_PROJECT_ORDER),[comparing,setComparing]=useState(false),[resultOffset,setResultOffset]=useState(null);
const [gridPageSize,setGridPageSize]=useState(PROJECT_BATCH_SIZE);
const [more,setMore]=useState(MORE_FILTERS),patchMore=patch=>setMore(value=>({...value,...patch})),moreKey=JSON.stringify(more);
const [filtersOpen,setFiltersOpen]=useState(false),[view,setView]=useState('grid'),[compactTools,setCompactTools]=useState(false),[preferencesReady,setPreferencesReady]=useState(false);
const cards=useRef(null),filterToggle=useRef(null),filterBar=useRef(null),floatingTrigger=useRef(null),filterForm=useRef(null),restoringListing=useRef(false),returnPosition=useRef(null);
useEffect(()=>{try{const value=JSON.parse(localStorage.getItem('hauszy-saved')||'[]');if(Array.isArray(value))setSaved(value.map(String))}catch{}setPreferencesReady(true)},[]);
useEffect(()=>{if(!restoringListing.current)setResultOffset(null)},[location,type,minimum,maximum,moreKey,savedOnly,order]);
useEffect(()=>{if(home)return;try{if(!restoringListing.current)setView(localStorage.getItem('hauszy-project-view')==='list'?'list':'grid')}catch{}},[home]);
useLayoutEffect(()=>{
 if(home||!isListingReturn(window.__hauszyHistoryTarget,window.location.pathname))return;
 window.__hauszyHistoryTarget=null;
 const path=window.location.pathname.replace(/\/+$/,'');
 let state;
 try{
  const raw=sessionStorage.getItem(LISTING_SCROLL_KEY+path)||(path==='/projects'?sessionStorage.getItem(LISTING_SCROLL_KEY):null);
  state=listingReturnSnapshot(raw,projects.length);
 }catch{}
 if(!state)return;
 restoringListing.current=true;
 returnPosition.current=state.y;
 setLocation(state.location);setType(state.type);setMin(state.minimum);setMax(state.maximum);setMore(cleanMoreFilters(state.more));setSavedOnly(state.savedOnly);
 setOrder(SORTS.some(([value])=>value===state.order)?state.order:DEFAULT_PROJECT_ORDER);
 setView(state.view);
 setResultOffset(state.resultOffset!==undefined?state.resultOffset:state.resultPage!==undefined?(state.resultPage-1)*PROJECT_BATCH_SIZE:null);
},[home,initialPage,projects.length]);
useLayoutEffect(()=>{if(home||!preferencesReady||returnPosition.current===null)return;let second;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{window.scrollTo({top:returnPosition.current,left:0,behavior:'instant'});returnPosition.current=null;restoringListing.current=false})});return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)}},[home,preferencesReady,location,type,minimum,maximum,moreKey,savedOnly,order,view,resultOffset,gridPageSize,saved]);
function rememberListing(event){
 if(home||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const anchor=event.target.closest?.('a[href]');
 if(!anchor)return;
 const url=new URL(anchor.href,window.location.href);
 if(url.origin!==window.location.origin||!/^\/projects\/[^/]+\/?$/.test(url.pathname))return;
 const path=window.location.pathname.replace(/\/+$/,'');
 try{sessionStorage.setItem(LISTING_SCROLL_KEY+path,JSON.stringify({y:window.scrollY,resultOffset,location,type,minimum,maximum,more,savedOnly,order,view}))}catch{}
}
function save(id){const value=saved.includes(id)?saved.filter(v=>v!==id):[...saved,id];setSaved(value);try{localStorage.setItem('hauszy-saved',JSON.stringify(value))}catch{}}
const ceiling=Math.ceil(Math.max(1000000,...projects.map(p=>p.priceMax||p.price||0),minimum,maximum||0)/100000)*100000;
const found=sortProjects(filterProjects(projects,{location,type,minimum,maximum,more:home?undefined:more,savedOnly,saved}),order);
const savedProjects=saved.map(id=>projects.find(p=>p.id===id)).filter(Boolean);
const customResults=Boolean(location.trim()||type||minimum>0||maximum!==null||moreFilterCount(more)||savedOnly||order!==DEFAULT_PROJECT_ORDER);
const pageSize=view==='grid'?gridPageSize:PROJECT_BATCH_SIZE;
const offset=resultOffset??(customResults?0:(initialPage-1)*PROJECT_BATCH_SIZE);
const lastPage=projectPageCount(found.length,pageSize);
const page=Math.min(Math.floor(offset/pageSize)+1,lastPage);
const shown=home?found.slice(0,6):projectPageItems(found,page,pageSize);
const hasResults=found.length>0;
useLayoutEffect(()=>{
 const grid=cards.current;
 if(home||view!=='grid'||!grid)return;
 function measureColumns(){
  const style=getComputedStyle(grid);
  const cardWidth=parseFloat(style.getPropertyValue('--catalogue-card-width'));
  const gap=parseFloat(style.columnGap);
  const width=grid.getBoundingClientRect().width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  if(!(width>0)||!(cardWidth>0)||!Number.isFinite(gap))return;
  const columns=Math.max(1,Math.floor((width+gap)/(cardWidth+gap)));
  setGridPageSize(columns*GRID_ROWS_PER_PAGE);
 }
 measureColumns();
 if(typeof ResizeObserver==='undefined'){
  window.addEventListener('resize',measureColumns);
  return ()=>window.removeEventListener('resize',measureColumns);
 }
 const observer=new ResizeObserver(measureColumns);
 observer.observe(grid);
 return ()=>observer.disconnect();
},[home,view,hasResults,error]);
function changeResultPage(nextPage){
 setResultOffset((nextPage-1)*pageSize);
 requestAnimationFrame(()=>{
  cards.current?.focus({preventScroll:true});
  cards.current?.scrollIntoView({block:'start',behavior:'instant'});
 });
}
useEffect(()=>{if(home||!filtersOpen)return;const outside=event=>{if(!filterBar.current?.contains(event.target)&&!floatingTrigger.current?.contains(event.target))setFiltersOpen(false)};const escape=event=>{if(event.key==='Escape'){setFiltersOpen(false);(compactTools?floatingTrigger.current:filterToggle.current)?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[home,filtersOpen,compactTools]);
useEffect(()=>{if(home)return;let frame=0;const update=()=>{frame=0;const rect=filterBar.current?.getBoundingClientRect();if(rect){const threshold=window.innerWidth<=800?88:108;setCompactTools(previous=>rect.bottom<=threshold+(previous?16:0))}};const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)}},[home]);
useEffect(()=>{if(home||!compactTools||!filtersOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const target=filterForm.current;const frame=requestAnimationFrame(()=>target?.querySelector('button')?.focus());const trap=event=>{if(event.key!=='Tab')return;const items=[...target.querySelectorAll('button:not(:disabled),input,select,a[href]')].filter(el=>el.getClientRects().length&&!el.closest('[inert]'));const first=items[0],last=items[items.length-1];if(event.shiftKey&&(document.activeElement===first||!target.contains(document.activeElement))){event.preventDefault();last?.focus()}else if(!event.shiftKey&&(document.activeElement===last||!target.contains(document.activeElement))){event.preventDefault();first?.focus()}};document.addEventListener('keydown',trap);return()=>{cancelAnimationFrame(frame);document.body.style.overflow=previous;document.removeEventListener('keydown',trap)}},[home,compactTools,filtersOpen]);
function changeView(value){setView(value);try{localStorage.setItem('hauszy-project-view',value)}catch{}}
function reset(){setLocation('');setType('');setMin(0);setMax(null);setMore(MORE_FILTERS);if(home)setSavedOnly(false)}const developers=[...new Set(projects.map(p=>String(p.developer||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
const sqft=v=>Number(v).toLocaleString('en-MY');
const moreChips=[
 more.beds&&['beds',more.beds==='studio'?'Studio':more.beds+'+ bed',{beds:''}],
 more.baths&&['baths',more.baths+'+ bath',{baths:''}],
 (more.sizeMin||more.sizeMax)&&['size',more.sizeMin&&more.sizeMax?sqft(more.sizeMin)+' – '+sqft(more.sizeMax)+' sqft':more.sizeMin?'From '+sqft(more.sizeMin)+' sqft':'Up to '+sqft(more.sizeMax)+' sqft',{sizeMin:'',sizeMax:''}],
 more.tenure&&['tenure',more.tenure,{tenure:''}],
 more.status&&['status',more.status,{status:''}],
 more.readyBy&&['ready','Ready by '+more.readyBy,{readyBy:''}],
 more.developer.trim()&&['developer',more.developer.trim(),{developer:''}],
 more.newLaunch&&['launch','New launches',{newLaunch:false}],
].filter(Boolean);
const rangeText=!minimum&&maximum===null?'Any budget':`${compactMoney(minimum)||'RM 0'} – ${maximum===null?'Any':compactMoney(maximum)||'RM 0'}`;
const narrowGridTools=!home&&view==='grid'&&(gridPageSize===GRID_ROWS_PER_PAGE||shown.length===1);
return <div style={!home&&view==='grid'&&shown.length?{'--catalogue-visible-projects':shown.length}:undefined} data-motion-pending={preferencesReady?undefined:''} onClickCapture={rememberListing} className={home?'home-project-browser':`project-catalog catalog-top catalog-view-${view}${compactTools?' catalog-tools-compact':''}${narrowGridTools?' catalog-tools-narrow':''}`}>{!home&&<button ref={floatingTrigger} inert={!compactTools} tabIndex={compactTools?0:-1} type="button" className="catalog-floating-trigger" aria-label="Open project filters and sorting" title="Project filters and sorting" aria-expanded={filtersOpen} aria-controls="catalog-filter-form" onClick={()=>setFiltersOpen(value=>!value)}><Icon name={filtersOpen?'x':'sliders'}/>{(location||type||minimum>0||maximum!==null||moreFilterCount(more)>0)&&<span className="catalog-floating-dot"/>}</button>}{!home&&compactTools&&<button type="button" className={`catalog-sidebar-backdrop${filtersOpen?' is-open':''}`} inert={!filtersOpen} tabIndex={-1} aria-label="Close project filters" onClick={()=>{setFiltersOpen(false);floatingTrigger.current?.focus()}}/>}<section ref={filterBar} className={'search-wrap'+(!home?' catalog-filters'+(filtersOpen?' is-open':''):'')} aria-label="Project filters">{!home&&<div className="catalog-filter-heading">
 <div className="catalog-collection-tabs" role="group" aria-label="Project collection"><button type="button" aria-pressed={!savedOnly} onClick={()=>{setSavedOnly(false);setFiltersOpen(false)}}>All projects <span>{projects.length}</span></button><button type="button" aria-pressed={savedOnly} onClick={()=>{setSavedOnly(true);setFiltersOpen(false)}}><Icon name="heart"/>Saved <span>{savedProjects.length}</span></button></div>
 <span className="catalog-bar-count" aria-live="polite"><strong>{found.length}</strong> {found.length===1?'result':'results'}</span>
 <div className="catalog-bar-actions">
 <button type="button" ref={filterToggle} className="catalog-filter-toggle" aria-expanded={filtersOpen} aria-controls="catalog-filter-form" onClick={()=>setFiltersOpen(v=>!v)}><Icon name="sliders"/><span>Filters</span>{(location||type||minimum>0||maximum!==null||moreFilterCount(more)>0)&&<b>{Number(!!location)+Number(!!type)+Number(minimum>0||maximum!==null)+moreFilterCount(more)}</b>}<Icon name={filtersOpen?'x':'chevronDown'}/></button>
 <label className="catalog-sort-control"><Icon name="sort"/><span className="catalog-screen-reader">Sort projects</span><select aria-label="Sort projects" value={order} onChange={e=>setOrder(e.target.value)}>{SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <button type="button" className="catalog-compare-button" aria-label={`Compare ${savedProjects.length} saved projects`} disabled={savedProjects.length<2} title={savedProjects.length<2?'Save at least two projects to compare':undefined} onClick={()=>{setFiltersOpen(false);setComparing(true)}}><Icon name="compare"/><span>Compare</span><b>{savedProjects.length}</b></button>
 <div className="catalog-view-toggle" role="group" aria-label="Project view"><button type="button" aria-label="Grid view" title="Grid view" aria-pressed={view==='grid'} onClick={()=>changeView('grid')}><Icon name="grid"/></button><button type="button" aria-label="List view" title="List view" aria-pressed={view==='list'} onClick={()=>changeView('list')}><Icon name="list"/></button></div>
 </div></div>}<form ref={filterForm} className={!home&&compactTools?'catalog-filter-sidebar':undefined} role={!home&&compactTools?'dialog':undefined} aria-modal={!home&&compactTools&&filtersOpen?true:undefined} aria-label={!home&&compactTools?'Project filters and sorting':undefined} inert={!home&&!filtersOpen} aria-hidden={!home&&!filtersOpen} id={home?undefined:"catalog-filter-form"} onSubmit={e=>{e.preventDefault();if(home)document.getElementById('listings')?.scrollIntoView({behavior:'smooth'});else {setFiltersOpen(false);requestAnimationFrame(()=>(compactTools?floatingTrigger.current:filterToggle.current)?.focus())}}}>{!home&&compactTools&&<div className="catalog-sidebar-heading"><div><span className="eyebrow">FILTER & SORT</span><h2>Find your space.</h2></div><button type="button" aria-label="Close filters and sorting" onClick={()=>{setFiltersOpen(false);floatingTrigger.current?.focus()}}><Icon name="x"/></button></div>}{!home&&compactTools&&<div className="catalog-floating-options"><div className="catalog-collection-tabs" role="group" aria-label="Project collection"><button type="button" aria-pressed={!savedOnly} onClick={()=>setSavedOnly(false)}>All projects</button><button type="button" aria-pressed={savedOnly} onClick={()=>setSavedOnly(true)}><Icon name="heart"/>Saved <span>{savedProjects.length}</span></button></div><label className="catalog-floating-sort"><span className="catalog-screen-reader">Sort projects</span><Icon name="sort"/><select aria-label="Sort projects" value={order} onChange={e=>setOrder(e.target.value)}>{SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button type="button" className="catalog-compare-button" disabled={savedProjects.length<2} onClick={()=>{setFiltersOpen(false);setComparing(true)}} aria-label={`Compare ${savedProjects.length} saved projects`}><Icon name="compare"/>Compare <b>{savedProjects.length}</b></button></div>}<label className="location"><Icon name="mapPin"/> LOCATION<input type="search" list="locations" placeholder="e.g. Bayan Lepas, Batu Kawan" value={location} onChange={e=>setLocation(e.target.value)}/><datalist id="locations">{[...new Set(projects.map(p=>p.location))].map(v=><option key={v} value={v}/>)}</datalist></label>{home?<label><Icon name="building"/> PROPERTY TYPE<select value={type} onChange={e=>setType(e.target.value)}><option value="">All property types</option>{[...new Set(projects.map(p=>p.type))].map(v=><option key={v}>{v}</option>)}</select></label>:<PropertyTypeFilter value={type} onChange={setType}/>}<div className="price-filter"><div className="price-filter-heading"><span><Icon name="banknote"/> PRICE RANGE</span><output>{rangeText}</output></div><div className="dual-price-range"><div className="range-track" style={{background:`linear-gradient(to right,var(--line) ${minimum/ceiling*100}%,var(--primary) ${minimum/ceiling*100}%,var(--primary) ${(maximum??ceiling)/ceiling*100}%,var(--line) ${(maximum??ceiling)/ceiling*100}%)`}}/><input id="priceMin" type="range" aria-label="Minimum project price" min="0" max={ceiling} step="1000" value={minimum} onChange={e=>setMin(Math.min(+e.target.value,maximum??ceiling))}/><input id="price" type="range" aria-label="Maximum project price" min="0" max={ceiling} step="1000" value={maximum??ceiling} onChange={e=>setMax(Math.max(minimum,+e.target.value))}/></div><div className="price-range-ends"><label className="exact-price-label">Min RM <input type="number" min="0" aria-label="Exact minimum price in RM" value={minimum||''} placeholder="0" onChange={e=>{const n=Math.max(0,+e.target.value);setMin(n);if(maximum!==null&&n>maximum)setMax(n)}}/></label><label className="exact-price-label">Max RM <input type="number" min="0" aria-label="Exact maximum price in RM" value={maximum??''} placeholder="Any" onChange={e=>{const n=e.target.value===''?null:Math.max(0,+e.target.value);setMax(n);if(n!==null&&n<minimum)setMin(n)}}/></label></div></div>{!home&&<MoreFilters value={more} onChange={patchMore} developers={developers}/>}{home?<button className="search-btn">Find my space <Icon name="search"/></button>:<p className="catalog-filter-note"><span aria-live="polite">{found.length} {found.length===1?'space matches':'spaces match'} your search</span><span>Filters update automatically.</span></p>}{!home&&<button className="catalog-apply-filters" type="submit">Show {found.length} projects <Icon name="arrowRight"/></button>}</form></section><section className="collection" id="listings"><div className="section-heading" hidden={!home}><div><div className="eyebrow">PENANG ISLAND & MAINLAND</div><h2>Start your Penang shortlist.</h2></div><p>Compare locations, layouts and prices.<br/>Find a space that fits your plans.</p></div>{home?<div className="listing-toolbar"><div className="chips"><button className={!savedOnly?'selected':''} onClick={()=>setSavedOnly(false)}>All projects</button><button className={savedOnly?'selected':''} onClick={()=>setSavedOnly(true)}><Icon name="heart"/> Saved projects</button><button className="compare-chip" disabled={savedProjects.length<2} title={savedProjects.length<2?'Save at least two projects to compare':undefined} onClick={()=>setComparing(true)}><Icon name="compare"/> Compare saved{savedProjects.length?` (${savedProjects.length})`:''}</button></div><div className="listing-meta"><span>{found.length} {found.length===1?'project':'projects'}</span><label className="sort-by"><Icon name="sort"/> Sort by<select value={order} onChange={e=>setOrder(e.target.value)}>{SORTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div></div>:<div className="listing-toolbar catalog-summary-bar"><div className="catalog-current-search"><span>{savedOnly?'YOUR SHORTLIST':'THE COLLECTION'} / {found.length} {found.length===1?'PROJECT':'PROJECTS'}</span><div className="catalog-active-chips" aria-label="Active filters">{location&&<button type="button" aria-label="Remove location filter" onClick={()=>setLocation('')}>{location}<Icon name="x"/></button>}{type&&<button type="button" aria-label="Remove property type filter" onClick={()=>setType('')}>{type.replace(/^group:/,'')}<Icon name="x"/></button>}{(minimum>0||maximum!==null)&&<button type="button" aria-label="Remove budget filter" onClick={()=>{setMin(0);setMax(null)}}>{rangeText}<Icon name="x"/></button>}{moreChips.map(([key,text,clear])=><button type="button" key={key} aria-label={'Remove '+text+' filter'} onClick={()=>patchMore(clear)}>{text}<Icon name="x"/></button>)}</div></div>{(location||type||minimum>0||maximum!==null||moreChips.length>0)&&<button type="button" className="catalog-reset-all" onClick={reset}>Reset filters<Icon name="refresh"/></button>}</div>}<CompareProjects projects={savedProjects} open={comparing} onClose={()=>setComparing(false)} onRemove={save}/>{error?<div className="empty-state" role="alert"><Icon name="circleAlert"/> Projects could not be loaded. <button className="outline" onClick={()=>window.location.reload()}><Icon name="refresh"/> Try again</button></div>:found.length?<div className="cards" ref={home?undefined:cards} tabIndex={home?undefined:-1} aria-label={home?undefined:"Project results"}>{shown.map(p=>home?<ProjectCard key={p.id} project={p} saved={saved.includes(p.id)} onSave={save}/>:view==='list'?<ProjectListRow key={p.id} project={p} saved={saved.includes(p.id)} onSave={save}/>:<CollectionCard key={p.id} project={p} saved={saved.includes(p.id)} onSave={save} variant="tour"/>)}</div>:<div className="empty-state">{savedOnly?(savedProjects.length?'No saved projects match your filters.':'Your shortlist starts here. Tap the heart on a project to save it.') : projects.length?'No projects match your filters.':'Penang property listings will appear here as they become available. Please check back soon.'}</div>}{!home&&!error&&found.length>0&&<CataloguePagination page={page} lastPage={lastPage} pageSize={pageSize} shown={shown.length} total={found.length} onPage={customResults||pageSize!==PROJECT_BATCH_SIZE?changeResultPage:undefined}/>}{home?<Link className="outline all-project-link" href="/projects">View all Penang projects <Icon name="arrowRight"/></Link>:null}</section></div>}
