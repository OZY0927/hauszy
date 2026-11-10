'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import HotProjectsShowcase from './HotProjectsShowcase';

const CHAPTERS=[
 {name:'Heritage & culture',place:'GEORGE TOWN',image:'/penang/george-town-lanterns.webp',width:1085,height:1450,alt:'Red lanterns above a George Town heritage street with a passing trishaw',title:<>Streets with stories.<br/>Days with character.</>,copy:'Five-foot ways, shophouses and neighbourhood kopitiams. In George Town, old and new share the same street — and everyday life is part of the charm.',foot:'Wander a little. Look a little closer.'},
 {name:'Coast & calm',place:'THE ISLAND COAST',image:'/penang/tropical-beach.webp',width:1254,height:1254,alt:'A tropical Penang beach with boats, turquoise water and forested hills',title:<>A little sea air.<br/>A different pace.</>,copy:'Trade the city streets for a coastal evening. From seafront neighbourhoods to quieter stretches of shoreline, there’s another side of Penang waiting by the water.',foot:'Make room for the slower moments.'},
 {name:'Hills & horizons',place:'PENANG HILL',image:'/penang/hill-canopy.webp',width:1584,height:993,alt:'A treetop viewing platform surrounded by lush forest on Penang Hill',title:<>City within reach.<br/>Green all around.</>,copy:'Head into the hills and the view changes. Forest trails and treetop views offer a green escape, with the energy of the island never far away. A fresh perspective on familiar surroundings.',foot:'Find the balance that feels like you.'},
];
const INTRO='Heritage in the streets. Possibility on the horizon. A life between the hills and the sea.';

export default function PenangHome({featuredProjects=[],popularProjects=false}){
 const root=useRef(null),filmTrack=useRef(null),tabs=useRef(null),playButton=useRef(null),closeFilm=useRef(null);
 const [chapter,setChapter]=useState(0),[playing,setPlaying]=useState(false);
 const current=CHAPTERS[chapter];
 useEffect(()=>{if(playing)closeFilm.current?.focus({preventScroll:true})},[playing]);
 useEffect(()=>{
  const page=root.current,media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero=page.querySelector('.pg-hero'),heroImage=hero.querySelector('.pg-hero-image'),intro=page.querySelector('.pg-intro-statement'),words=[...intro.querySelectorAll('[data-pg-word]')],track=filmTrack.current,film=track.querySelector('.pg-film-window');
  let frame=0,shift='',read=-1,inset='';
  const update=()=>{
   frame=0;
   const reduced=media.matches,vh=window.innerHeight;
   // Read every rect first, then write, so a scroll frame lays out once. Each value is set on the element that uses it.
   const heroBox=hero.getBoundingClientRect(),box=intro.getBoundingClientRect(),rect=track.getBoundingClientRect();
   const photos=[...page.querySelectorAll('.pg-chapter-photo,.pg-perspective-image')].map(el=>({el,rect:el.getBoundingClientRect()}));
   const nextShift=heroBox.bottom>0?(reduced?'0px':`${Math.min(vh*.2,Math.max(0,-heroBox.top)*.2)}px`):shift;
   if(nextShift!==shift){shift=nextShift;heroImage.style.setProperty('--pg-hero-shift',shift)}
   const progress=reduced?1:Math.max(0,Math.min(1,(vh*.85-box.top)/(vh*.65)));
   const count=words.filter((word,index)=>progress>index/words.length).length;
   if(count!==read){read=count;words.forEach((word,index)=>word.classList.toggle('is-read',index<count))}
   const filmProgress=reduced?1:Math.max(0,Math.min(1,(vh*.3-rect.top)/(vh*.55)));
   const nextInset=`${(1-filmProgress)*9}%`;
   if(nextInset!==inset){inset=nextInset;film.style.setProperty('--pg-film-inset',inset);film.style.setProperty('--pg-film-radius',`${(1-filmProgress)*24}px`)}
   for(const photo of photos){
    if(photo.rect.bottom<0||photo.rect.top>vh)continue;
    const travel=reduced?0:Math.max(-1,Math.min(1,(vh/2-photo.rect.top-photo.rect.height/2)/vh))*(window.innerWidth<=700?12:28);
    photo.el.style.setProperty('--pg-photo-shift',`${travel.toFixed(2)}px`);
   }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.06,rootMargin:'0px 0px -5% 0px'});
  const targets=[...page.querySelectorAll('[data-pg-reveal],[data-pg-section]')];
  targets.forEach(el=>{
   const bounds=el.getBoundingClientRect();
   if(bounds.top<window.innerHeight*.95&&bounds.bottom>0)el.classList.add('is-visible');else observer.observe(el);
  });
  // Keyboard focus always reveals its target immediately, even before the scroll observer fires.
  const focus=event=>{for(const el of targets)if(el.contains(event.target)){el.classList.add('is-visible');observer.unobserve(el)}};
  page.addEventListener('focusin',focus);
  page.classList.add('pg-motion');update();
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);media.addEventListener('change',schedule);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);page.removeEventListener('focusin',focus);page.classList.remove('pg-motion');window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);media.removeEventListener('change',schedule)};
 },[]);
 function changeTab(index){setChapter(index);tabs.current?.querySelectorAll('[role=tab]')[index]?.focus()}
 return <main ref={root} className="penang-home">
  <section className="pg-hero" aria-labelledby="pg-hero-title">
   <img className="pg-hero-image" src="/penang/skyline.jpg" alt="Penang’s skyline, green hills and the Penang Bridge at sunrise" fetchPriority="high" width="2200" height="1467"/>
   <div className="pg-hero-shade"/>
   <div className="pg-corner pg-corner-tl"/><div className="pg-corner pg-corner-tr"/><div className="pg-corner pg-corner-bl"/><div className="pg-corner pg-corner-br"/>
   <div className="pg-hero-copy"><span className="pg-label"><i/> A PLACE TO BELONG · MALAYSIA</span><h1 id="pg-hero-title"><span>Find your rhythm.</span><span>In <em>Penang.</em></span></h1><p>A little heritage. A little sea air.<br/>A whole new way to feel at home.</p></div>
   <div className="pg-hero-bottom"><a className="pg-scroll-link" href="#penang-story"><span className="pg-scroll-icon"><Icon name="arrowDown"/></span><span>SCROLL TO DISCOVER</span></a><span className="pg-hero-location">PENANG ISLAND & MAINLAND<br/><small>A local perspective by Hauszy</small></span><a className="pg-film-shortcut" href="#penang-film">See Penang in motion <span>↗</span></a></div>
  </section>

  <HotProjectsShowcase candidates={featuredProjects} popular={popularProjects}/>

  <section id="penang-story" className="pg-intro pg-grid-bg" data-pg-section>
   <div className="pg-section-meta" data-pg-reveal><span className="pg-label"><i/> 01 / THE FEELING OF PENANG</span><span className="pg-meta-note">MORE THAN AN ADDRESS</span></div>
   <div className="pg-intro-layout"><div className="pg-intro-aside" data-pg-reveal><span className="pg-mini-cross">+</span><p>Before you find a home,<br/>find a place that feels like you.</p></div><div><h2 className="pg-intro-statement" aria-label={INTRO}>{INTRO.split(' ').map((word,index)=><span key={index} data-pg-word aria-hidden="true">{word} </span>)}</h2><p className="pg-intro-note" data-pg-reveal>Penang is a collection of everyday contrasts. Familiar flavours and fresh ideas. Busy streets and quiet coastlines. An island and a mainland, each with its own rhythm.</p></div></div>
   <div className="pg-place-strip" data-pg-reveal aria-label="Places in Penang"><span>GEORGE TOWN</span><span>TANJUNG BUNGAH</span><span>BAYAN LEPAS</span><span>BALIK PULAU</span><span>SEBERANG PERAI</span></div>
  </section>

  <section className="pg-chapters" data-pg-section aria-labelledby="pg-chapter-title">
   <div className="pg-section-meta" data-pg-reveal><span className="pg-label"><i/> 02 / LIFE, IN DIFFERENT LIGHTS</span><span className="pg-meta-note">EXPLORE THE ISLAND</span></div>
   <div className="pg-chapter-heading" data-pg-reveal><h2 id="pg-chapter-title">Different days.<br/><span>Same Penang.</span></h2><p>There’s more than one way to live here.<br/>Find the side that speaks to you.</p></div>
   <div className="pg-chapter-tabs" data-pg-reveal role="tablist" aria-label="Discover Penang" ref={tabs}>{CHAPTERS.map((item,index)=><button type="button" role="tab" key={item.name} id={`pg-tab-${index}`} aria-selected={chapter===index} aria-controls={`pg-panel-${index}`} tabIndex={chapter===index?0:-1} onClick={()=>setChapter(index)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();changeTab(e.key==='Home'?0:e.key==='End'?2:(chapter+(e.key==='ArrowRight'?1:2))%3)}}}><span>0{index+1}</span>{item.name}<Icon name="arrowUpRight"/></button>)}</div>
   <div className="pg-chapter-panel" role="tabpanel" id={`pg-panel-${chapter}`} aria-labelledby={`pg-tab-${chapter}`} key={chapter}>
    <figure className="pg-chapter-photo"><img src={current.image} alt={current.alt} loading="lazy" width={current.width} height={current.height}/><figcaption><span>{current.place}</span><span>0{chapter+1} / 03</span></figcaption></figure>
    <div className="pg-chapter-copy"><span className="pg-label">THE PENANG JOURNAL</span><h3>{current.title}</h3><p>{current.copy}</p><span className="pg-chapter-foot">{current.foot}</span><Link href="/projects" className="pg-line-link">Explore Penang projects <Icon name="arrowUpRight"/></Link></div>
   </div>
  </section>

  <section id="penang-film" ref={filmTrack} className="pg-film-track" aria-labelledby="pg-film-title">
   <div className="pg-film-window">
    <img src="/penang/coast.jpg" alt="The Penang coast at dusk" loading="lazy" width="1600" height="1067"/>
    <div className="pg-film-shade"/>
    {!playing?<div className="pg-film-copy"><span className="pg-label">03 / A CLOSER LOOK</span><h2 id="pg-film-title">Some places<br/>are better <em>felt.</em></h2><button ref={playButton} className="pg-play" type="button" onClick={()=>setPlaying(true)}><span aria-hidden="true">▷</span> Watch the Penang film</button><p>Discover. Indulge. Explore.</p></div>:<div className="pg-film-player"><iframe src="https://player.vimeo.com/video/100688808?autoplay=1&dnt=1" title="MyPenang: Discover, Indulge, Explore — Penang Global Tourism" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/><button ref={closeFilm} className="pg-film-close" type="button" onClick={()=>{setPlaying(false);requestAnimationFrame(()=>playButton.current?.focus({preventScroll:true}))}} aria-label="Close Penang film"><Icon name="x"/></button><h2 id="pg-film-title" className="pg-sr-only">Penang in motion</h2></div>}
    <div className="pg-film-credit"><span>A FILM BY PENANG GLOBAL TOURISM</span><a href="https://vimeo.com/100688808" target="_blank" rel="noopener noreferrer">Watch on Vimeo <Icon name="arrowUpRight"/></a></div>
   </div>
  </section>

  <section className="pg-perspectives pg-grid-bg" data-pg-section aria-labelledby="pg-perspectives-title">
   <div className="pg-section-meta" data-pg-reveal><span className="pg-label"><i/> 04 / TWO SIDES, ONE PENANG</span></div>
   <div className="pg-perspectives-heading" data-pg-reveal><h2 id="pg-perspectives-title">Connected by more<br/>than a bridge.</h2><p>Get to know both sides of Penang.<br/>Your next chapter could begin on either.</p></div>
   <div className="pg-perspectives-grid"><article data-pg-reveal><div className="pg-perspective-image"><img src="/penang/kek-lok-si.webp" alt="Kek Lok Si temple and its pagoda rising above the green hills of Penang" loading="lazy" width="1536" height="1024"/><span>01 / THE ISLAND</span></div><h3>Life, close to everything.</h3><p>From George Town’s streets to coastal neighbourhoods and the hills inland, discover the island beyond the postcard.</p><span className="pg-area-list">GEORGE TOWN · BAYAN LEPAS · TANJUNG BUNGAH</span></article><article data-pg-reveal><div className="pg-perspective-image"><img src="/penang/bridge-sunrise.webp" alt="The Penang bridge crossing the strait towards the mainland at sunrise" loading="lazy" width="1122" height="1402"/><span>02 / THE MAINLAND</span></div><h3>A different kind of possibility.</h3><p>Across the strait, explore Seberang Perai — from Butterworth and Bukit Mertajam to the growing neighbourhoods of Batu Kawan.</p><span className="pg-area-list">BUTTERWORTH · BUKIT MERTAJAM · BATU KAWAN</span></article></div>
  </section>

  <section className="pg-next" data-pg-section aria-labelledby="pg-next-title"><span className="pg-label"><i/> YOUR NEXT CHAPTER</span><div className="pg-next-layout" data-pg-reveal><h2 id="pg-next-title">Like the place?<br/><em>Find your space.</em></h2><div><p>Let’s turn a feeling into a next step. Explore properties across Penang, or start with a conversation.</p><Link className="pg-cta" href="/projects">Explore Penang projects <Icon name="arrowUpRight"/></Link><Link className="pg-line-link" href="/about">Meet your property contact <Icon name="arrowUpRight"/></Link></div></div><div className="pg-next-bottom" data-pg-reveal><span>HAUSZY / PENANG, MALAYSIA</span><span>A PERSONAL APPROACH TO YOUR NEXT MOVE.</span></div></section>
  <details className="pg-credits"><summary>Photography & film credits</summary><p>Additional Penang photography supplied by the site owner. Original photography: <a href="https://www.pexels.com/photo/aerial-view-of-penang-cityscape-at-sunrise-33985412/" target="_blank" rel="noopener noreferrer">Richard L</a> and <a href="https://www.pexels.com/photo/charming-vintage-shophouse-with-street-view-35569657/" target="_blank" rel="noopener noreferrer">Afham Hamsyari</a> / Pexels; <a href="https://unsplash.com/photos/GIZoYv-ltBs" target="_blank" rel="noopener noreferrer">Kelvin Zyteng</a>, <a href="https://unsplash.com/photos/DK5MZuruF_Y" target="_blank" rel="noopener noreferrer">Esmonde Yong</a> and <a href="https://unsplash.com/photos/0S_TppFLCuw" target="_blank" rel="noopener noreferrer">Vismen Subramaniam</a> / Unsplash. Film: Penang Global Tourism, produced by Image Farm.</p></details>
 </main>;
}
