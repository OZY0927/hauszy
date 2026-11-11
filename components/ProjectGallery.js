'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import PreviewImage from './PreviewImage';
import ProjectHeroScroll from './ProjectHeroScroll';

// A full-bleed project opening or an editorial carousel, sharing the same full-size lightbox.
export default function ProjectGallery({photos=[],name,hero=null}){
 const [index,setIndex]=useState(0),[open,setOpen]=useState(false),[failed,setFailed]=useState(false);
 const [transition,setTransition]=useState({previous:null,direction:1,step:0});
 const dialog=useRef(null),items=photos.filter(Boolean),count=items.length,current=Math.min(index,Math.max(0,count-1));
 function show(){if(count){dialog.current.showModal();setOpen(true)}}
 function go(direction){if(count<2)return;setFailed(false);setTransition(t=>({previous:current,direction,step:t.step+1}));setIndex((current+direction+count)%count)}
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open]);
 const controls=count>1?<div className="project-gallery-controls gallery-controls"><button type="button" onClick={()=>go(-1)} aria-label="Previous project photo"><Icon name="arrowLeft"/></button><span>{String(current+1).padStart(2,'0')} <i>/</i> {String(count).padStart(2,'0')}</span><button type="button" onClick={()=>go(1)} aria-label="Next project photo"><Icon name="arrowRight"/></button></div>:null;
 return <>
  {hero?<ProjectHeroScroll enabled={count>0}><section className={'project-story-hero'+(count?' has-photo':'')} data-project-id={hero.id} aria-labelledby="project-story-title">
   {count>0&&<button type="button" className="project-story-cover gallery-tile" onClick={show} aria-label={`Open project photo ${current+1}`}><PreviewImage key={current} src={failed?'/project-placeholder.svg':items[current]} alt={`${name} — project photo ${current+1}`} loading="eager" fetchPriority="high" onError={()=>setFailed(true)}/></button>}
   <div className="project-story-hero-shade"/>
   <Link className="project-story-back" href="/projects"><Icon name="arrowLeft"/> All projects</Link>
   <div className="project-story-hero-copy">{hero.location&&<p>{hero.location}</p>}<h1 id="project-story-title">{name}</h1><span>{hero.type}{hero.mode&&` · ${hero.mode}`}</span></div>
   <div className="project-story-hero-bottom"><div>{controls}{count>0&&<button type="button" className="project-photo-open gallery-tile" onClick={show}><Icon name="images"/> View all {count} photos</button>}</div>{hero.target&&<a className="project-hero-discover" href={'#'+hero.target}>Discover the project <Icon name="arrowDown"/></a>}{hero.price&&<div className="project-hero-price"><small>{hero.price[0]}</small><strong>{hero.price[1]}</strong></div>}</div>
  </section></ProjectHeroScroll>:<div className="project-editorial-gallery project-layered-gallery" role="region" aria-label={`${name} project photography`} aria-roledescription="carousel" onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();go(1)}if(event.key==='ArrowLeft'){event.preventDefault();go(-1)}}}>
   <div className="project-photo-stack" style={{'--photo-direction':transition.direction}}>
    {count>1&&<><div className="project-photo-peek is-left" aria-hidden="true"><PreviewImage src={items[(current-1+count)%count]} alt="" loading="lazy"/></div><div className="project-photo-peek is-right" aria-hidden="true"><PreviewImage src={items[(current+1)%count]} alt="" loading="lazy"/></div></>}
    <button className="project-editorial-photo gallery-tile" type="button" onClick={show} aria-label={`Open project photo ${current+1}`}>
     {transition.previous!==null&&<div key={`out-${transition.step}`} className="project-photo-outgoing" aria-hidden="true"><PreviewImage src={items[transition.previous]} alt=""/></div>}
     <div key={`in-${transition.step}`} className={'project-photo-incoming'+(transition.step?' is-changing':'')}><PreviewImage src={items[current]||'/project-placeholder.svg'} alt={`${name} — project photo ${current+1}`} loading="lazy"/></div>
     <span><Icon name="maximize"/> Open gallery</span>
    </button>
    {count>1&&<><button type="button" className="project-stack-arrow is-previous" onClick={()=>go(-1)} aria-label="Previous project photo"><Icon name="arrowLeft"/></button><button type="button" className="project-stack-arrow is-next" onClick={()=>go(1)} aria-label="Next project photo"><Icon name="arrowRight"/></button></>}
   </div>
   <div className="project-gallery-caption"><p>{name}<span>Project photography</span></p><span className="project-photo-count" aria-live="polite" aria-atomic="true">{String(current+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span></div>
  </div>}
  {count>0&&<dialog ref={dialog} className="photo-lightbox project-story-lightbox" aria-label={`${name} photo gallery`} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();go(1)}if(event.key==='ArrowLeft'){event.preventDefault();go(-1)}}}>
   <button className="close" type="button" onClick={()=>dialog.current.close()} aria-label="Close gallery"><Icon name="x"/></button><img key={current} src={items[current]} alt={`${name} photo ${current+1}`}/>{controls}
  </dialog>}
 </>;
}
