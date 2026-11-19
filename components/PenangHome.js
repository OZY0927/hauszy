'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';
import CardPhoto from './ProjectCardPhoto';
import {listingName} from '../lib/project';
import {HOT_PROJECT_LIMIT} from '../lib/featured-projects';
import {penangOutline,penangViewBox} from '../lib/penang-outline';

// Landmark renders that float around the hero wordmark (x/y in % of the hero, w in vw, r = resting rotation).
const HERO_LANDMARKS=[
 {src:'/images/kek-lok-si-3d.webp',x:3,y:12,w:21,r:-10,front:false},
 {src:'/images/penang-trishaw-3d.webp',x:39,y:-6,w:19,r:14,front:true},
 {src:'/images/floating-mosque-3d.webp',x:76,y:10,w:19,r:9,front:false},
 {src:'/images/heritage-house-3d.webp',x:-3,y:56,w:23,r:7,front:true},
 {src:'/images/komtar-3d-v3.webp',x:82,y:52,w:15,r:-9,front:true},
];
// "Choose your Penang": one full-colour panel per place, in the five-colour palette.
const PLACES=[
 {key:'george-town',name:'George Town',title:'Streets with stories',tone:'primary',image:'/images/heritage-house-3d.webp',alt:'Penang heritage shophouse',copy:'Five-foot ways, shophouses and neighbourhood kopitiams. In George Town, old and new share the same street — and everyday life is part of the charm.',areas:'GEORGE TOWN · HERITAGE CORE'},
 {key:'coast',name:'The coast',title:'Where the shore slows down',tone:'secondary',image:'/images/floating-mosque-3d.webp',alt:'The Floating Mosque on the Penang coast',copy:'Trade the city streets for a coastal evening. From seafront neighbourhoods to quieter stretches of shoreline, there’s another side of Penang waiting by the water.',areas:'TANJUNG BUNGAH · BATU FERRINGHI'},
 {key:'hills',name:'Penang Hill',title:'Green all around',tone:'ink',image:'/images/penang-hill-3d-v2.webp',alt:'Penang Hill with its funicular railway',copy:'Head into the hills and the view changes. Forest trails and treetop views offer a green escape, with the energy of the island never far away.',areas:'AIR ITAM · PENANG HILL'},
 {key:'island',name:'City centre',title:'Close to everything',tone:'paper',image:'/images/komtar-3d-v3.webp',alt:'The KOMTAR tower in George Town',copy:'Around KOMTAR, Penang’s 65-storey landmark, the island’s main bus hub, shopping and city living meet — with the airport and the industrial south a short drive away.',areas:'KOMTAR · JELUTONG · PULAU TIKUS'},
 {key:'mainland',name:'The mainland',title:'A different kind of possibility',tone:'muted',image:'/images/penang-bridge-3d.webp',alt:'The Penang Bridge crossing to the mainland',copy:'Across the strait, explore Seberang Perai — from Butterworth and Bukit Mertajam to the growing neighbourhoods of Batu Kawan.',areas:'BUTTERWORTH · BUKIT MERTAJAM · BATU KAWAN'},
];
const ARC_PHOTOS=[
 {src:'/penang/george-town-lanterns.webp',alt:'Red lanterns above a George Town heritage street'},
 {src:'/penang/colonial-corner.webp',alt:'A colonial-era corner building in George Town'},
 {src:'/penang/tropical-beach.webp',alt:'A tropical Penang beach with boats and turquoise water'},
 {src:'/penang/kek-lok-si.webp',alt:'Kek Lok Si temple rising above green hills'},
 {src:'/penang/vintage-rickshaw.webp',alt:'A vintage trishaw parked on a Penang street'},
 {src:'/penang/hill-canopy.webp',alt:'A treetop viewing platform on Penang Hill'},
 {src:'/penang/bridge-sunrise.webp',alt:'The Penang Bridge at sunrise'},
 {src:'/penang/heritage.jpg',alt:'Heritage shophouses in George Town'},
];
const MOMENTS=[
 {src:'/penang/george-town-lanterns.webp',title:'A festival in every season',line:'Chinese New Year, Thaipusam, Hari Raya and Deepavali — the island celebrates them all.'},
 {src:'/penang/tropical-beach.webp',title:'Supper by the sea',line:'Char kway teow, laksa and cendol — Penang’s hawkers cook long after dark.'},
 {src:'/penang/hill-canopy.webp',title:'Above the treetops',line:'Ride the funicular up Penang Hill, then walk the rainforest canopy at The Habitat.'},
 {src:'/penang/semiconductor-cleanroom.webp',title:'Silicon Island, since 1972',line:'Chips designed, tested and packaged in Bayan Lepas power devices all over the world.'},
 {src:'/penang/coast.jpg',title:'Some places are better felt.',line:'Discover. Indulge. Explore.',film:true},
];
const TOOLS=[
 {href:'/tools/loan-calculator',title:'Loan calculator',copy:'Plan your monthly repayments before you commit.'},
 {href:'/tools/upfront-cash-calculator',title:'Upfront cash',copy:'Understand your starting costs, from deposit to fees.'},
 {href:'/tools/loan-eligibility',title:'Loan eligibility',copy:'Estimate your borrowing range in a few steps.'},
 {href:'/tools/roi-calculator',title:'ROI calculator',copy:'Explore the potential returns on an investment.'},
];
const FINAL_LANDMARKS=['/images/chinese-temple-3d.webp','/images/hindu-temple-3d.webp','/images/penang-church-3d.webp','/images/pinang-tree-3d.webp','/images/penang-dishes-3d.webp'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
// Hot-projects ring, fitted to the reference: depth toward the viewer (card widths) and inward turn (degrees) for
// |distance from centre| = 0, 1, 2 and a hidden 3rd slot to glide out to; perspective is in card widths too.
const ARC_SLOTS=[[.958,39.5],[2.34,65],[3.4,78]],ARC_PERSPECTIVE=4.93,ARC_GAP=.08,ARC_STEPS=100;
const arcLerp=(t,k)=>{t=Math.min(t,3);const i=Math.min(2,Math.floor(t)),f=t-i,a=i?ARC_SLOTS[i-1][k]:0;return a+(ARC_SLOTS[i][k]-a)*f};
// Screen x (card widths, relative to centre) of a card edge at local offset lx, for a right-hand card at distance t.
const arcEdge=(x,t,lx)=>{const z=arcLerp(t,0),turn=-arcLerp(t,1)*Math.PI/180;return (x+lx*Math.cos(turn))*ARC_PERSPECTIVE/(ARC_PERSPECTIVE-(z-lx*Math.sin(turn)))};
// Sideways offsets are solved rather than interpolated: each card's inner edge sits exactly ARC_GAP card widths past
// its neighbour's outer edge at every scroll position, so cards never touch or overlap while gliding. Built once.
const ARC_X=(()=>{const x=[],outer=[];for(let i=0;i<=3*ARC_STEPS;i++){
 const t=i/ARC_STEPS,target=t<=1?-.5+t*(1+ARC_GAP):outer[i-ARC_STEPS]+ARC_GAP;let lo=-3,hi=6;
 for(let k=0;k<50;k++){const m=(lo+hi)/2;if(arcEdge(m,t,-.5)<target)lo=m;else hi=m}
 x[i]=(lo+hi)/2;outer[i]=arcEdge(x[i],t,.5)}return x})();
const arcSlot=rel=>{const t=Math.min(Math.abs(rel),3),i=Math.min(3*ARC_STEPS-1,Math.floor(t*ARC_STEPS)),f=t*ARC_STEPS-i;return [ARC_X[i]+(ARC_X[i+1]-ARC_X[i])*f,arcLerp(t,0),arcLerp(t,1)]};
// Each landmark flies outward from the hero's centre (--dx/--dy) as the hero scrolls away.
const floatStyle=(l,d)=>({'--x':l.x+'%','--y':l.y+'%','--w':l.w+'vw','--r':l.r+'deg','--d':d,'--dx':((l.x+l.w/2-50)/50).toFixed(2),'--dy':((l.y+12-50)/50).toFixed(2)});

export default function PenangHome({featuredProjects=[],popularProjects=false}){
 const root=useRef(null),placeTabs=useRef(null),playButton=useRef(null),closeFilm=useRef(null);
 const hotProjects=featuredProjects.slice(0,HOT_PROJECT_LIMIT),ringCount=hotProjects.length||ARC_PHOTOS.length;
 const [place,setPlace]=useState(0),[playing,setPlaying]=useState(false);
 const current=PLACES[place];
 useEffect(()=>{if(playing)closeFilm.current?.focus({preventScroll:true})},[playing]);
 // Keep the active place tab visible in the (horizontally scrolling) row as scroll steps through places.
 useEffect(()=>{
  const row=placeTabs.current,tab=row?.querySelectorAll('[role=tab]')[place];
  if(tab&&row.scrollWidth>row.clientWidth)row.scrollTo({left:tab.offsetLeft-row.offsetLeft-(row.clientWidth-tab.offsetWidth)/2,behavior:'smooth'});
 },[place]);

 // One scroll/pointer loop drives every section through CSS custom properties.
 const placeRef=useRef(0),lockUntil=useRef(0);
 useEffect(()=>{
  const page=root.current,media=matchMedia('(prefers-reduced-motion: reduce)');
  const hero=page.querySelector('.hh-hero'),places=page.querySelector('.hh-places'),placesStage=page.querySelector('.hh-places-stage');
  const arc=page.querySelector('.hh-arc'),arcStage=page.querySelector('.hh-arc-stage'),arcCards=[...page.querySelectorAll('.hh-arc-card')],arcRing=page.querySelector('.hh-arc-ring');
  const moments=[...page.querySelectorAll('.hh-moment')],tools=page.querySelector('.hh-tools'),toolsStage=page.querySelector('.hh-tools-stage'),toolCards=[...page.querySelectorAll('.hh-tool')],final=page.querySelector('.hh-final');
  const momentsSection=page.querySelector('.hh-moments'),firstMoment=moments[0],handoff=page.querySelector('.hh-handoff'),handoffFrom=handoff.querySelector('.hh-handoff-from');
  // Give every moment card its own swipe: random tilt direction and angle, a sideways drift that follows the tilt,
  // a pivot on the side it lifts from, and a slightly different lift height. Set after mount, so it never affects
  // server-rendered markup.
  moments.forEach(card=>{
   const dir=Math.random()<.5?-1:1,r=Math.random;
   card.style.setProperty('--hh-rot',(dir*(3+r()*9)).toFixed(1)+'deg');
   card.style.setProperty('--hh-dx',(dir*(3+r()*20)).toFixed(1)+'vw');
   card.style.setProperty('--hh-ox',(dir<0?55+r()*40:5+r()*40).toFixed(0)+'%');
   card.style.setProperty('--hh-lift',(-(108+r()*24)).toFixed(0)+'svh');
  });
  let frame=0;
  // Every style write goes through set(), which skips values that haven't changed since the last frame, so a frame
  // only touches what actually moved (sections far off screen settle and cost nothing).
  const written=new Map();
  const set=(el,key,value)=>{
   let seen=written.get(el);if(!seen)written.set(el,seen={});
   if(seen[key]===value)return;seen[key]=value;
   if(key.startsWith('--'))el.style.setProperty(key,value);else el.style[key]=value;
  };
  const setInert=(el,value)=>{if(el.inert!==value)el.inert=value};
  const flag=(el,value)=>{value=String(value);if(el.dataset.inView!==value)el.dataset.inView=value};
  // A rising dome: the next section's stage enters as a curved panel that flattens as it reaches the top.
  const dome=(el,p)=>{
   if(p>=1||p<=0){set(el,'clipPath',p>=1?'none':'inset(100% 0 0 0)');return}
   const k=p*p*260;set(el,'clipPath',`ellipse(${(55+p*150).toFixed(1)}% ${(100+k).toFixed(1)}% at 50% ${(100+k).toFixed(1)}%)`);
  };
  // The layout is sized in svh, so the loop measures the small viewport too, and only on a real resize. Mobile
  // browsers change innerHeight as the address bar slides away mid-scroll, which made every scroll-linked value jump.
  const probe=document.createElement('div');probe.style.cssText='position:fixed;top:0;left:-9999px;width:1px;height:100svh;visibility:hidden;pointer-events:none';
  page.appendChild(probe);
  let vh=0,cardW=300;
  const measure=()=>{vh=probe.offsetHeight||innerHeight;cardW=arcCards[0]?.offsetWidth||300};
  measure();
  const update=()=>{
   frame=0;const reduced=media.matches;
   // Read every box first, then write: mixing the two forced a fresh layout several times per frame.
   const heroTop=hero.getBoundingClientRect().top,placesTop=places.getBoundingClientRect().top,arcBox=arc.getBoundingClientRect();
   const mBox=firstMoment?.getBoundingClientRect(),deckTop=momentsSection.getBoundingClientRect().top;
   const toolsTop=tools.getBoundingClientRect().top,finalTop=final.getBoundingClientRect().top;
   const n=arcCards.length,last=n-1,limit=2.45,loop=n/2-1>limit;
   const arcP=clamp(-arcBox.top/Math.max(1,arcBox.height-2*vh)),pos=arcP*last;
   const hRaw=clamp(1-(arcBox.bottom-vh)/vh),h=hRaw>.995?1:hRaw,centre=loop?((Math.round(pos)%n)+n)%n:Math.round(pos);
   const flying=!reduced&&h>0&&h<1&&!!mBox,cb=flying?arcCards[centre].getBoundingClientRect():null;
   // Hero: pinned while the wordmark blurs away and the landmarks fly toward the viewer.
   set(hero,'--hh-hero-p',reduced?'0':clamp(-heroTop/vh).toFixed(3));
   // Places: rises over the hero, then stays pinned while each half-screen of scroll steps to the next place.
   dome(placesStage,reduced?1:clamp((vh-placesTop)/vh));
   if(!reduced){
    const raw=-placesTop/(vh*.5),idx=Math.min(PLACES.length-1,Math.max(0,Math.floor(raw)));
    set(places,'--hh-step',clamp(raw-idx).toFixed(3));
    if(idx!==placeRef.current&&performance.now()>lockUntil.current){placeRef.current=idx;setPlace(idx)}
   }else set(places,'--hh-step','.5');
   // Arc: rises over the pinned places, then the sticky stage turns the ring of photos.
   const arcIn=reduced?1:clamp((vh-arcBox.top)/vh);
   dome(arcStage,arcIn);set(arc,'--hh-arc-in',arcIn.toFixed(3));
   const arcVisible=arcBox.top<vh&&arcBox.bottom>0;
   // Decorative loops (bobbing landmarks, drifting blobs, the tools glow, the outline trace) only run while their
   // stage can be seen; a stage is hidden once the next one has risen fully over it.
   flag(arc,arcVisible);flag(hero,placesTop>0);flag(places,placesTop<vh&&arcBox.top>0);flag(tools,toolsTop<vh&&finalTop>0);
   if(reduced){set(arcRing,'perspective','');handoff.hidden=true;if(firstMoment){set(firstMoment,'opacity','');firstMoment.dataset.landed='true'}arcCards.forEach(card=>{set(card,'transform','');set(card,'opacity','');setInert(card,false)})}
   else if(arcVisible||flying){
    // Concave carousel with three measured slots (from the reference layout): the centre card sits flat; the preview
    // on each side is pulled toward the viewer and turned inward so its edges read ~1.15× and ~1.35× the centre's
    // height; the further preview starts ~1.6× tall and runs off screen. Cards glide between the slots with scroll.
    // Every value is a multiple of the card width, so the look holds at any screen size.
    set(arcRing,'perspective',(cardW*ARC_PERSPECTIVE).toFixed(0)+'px');
    // The ring loops: each card's distance from the centre wraps around the card count, so the first project
    // always has the last one peeking in on its left (and vice versa). The wrap seam sits opposite the centre,
    // where cards are hidden, so nothing visibly jumps.
    // With too few cards to keep the seam out of view, the ring simply doesn't loop.
    // Handoff to the moments: the arc stays pinned one extra screen after the ring finishes. Over that screen
    // (h 0→1) the moments section, pulled up underneath, brings its first card to its sticky top exactly as the pin
    // releases, while a copy of the centre card flies straight to where that card will rest (it rides up with the
    // section until then, so its resting top is its current top minus the section's remaining offset).
    set(arc,'--hh-out',clamp(h*2).toFixed(3));
    arcCards.forEach((card,i)=>{
     const rel=loop?((i-pos)%n+n*1.5)%n-n/2:i-pos,visible=Math.abs(rel)<limit&&h<.4,side=Math.sign(rel);
     // Hidden cards keep their last transform: no point moving what can't be seen.
     if(visible){const [x,z,turn]=arcSlot(rel);set(card,'transform',`translate3d(${(side*x*cardW).toFixed(1)}px,0,${(z*cardW).toFixed(1)}px) rotateY(${(-side*turn).toFixed(2)}deg)`)}
     set(card,'opacity',!visible||(i===centre&&h>0)?'0':(1-h*2.5).toFixed(3));setInert(card,!visible);
    });
   }
   if(!reduced){
    // A fixed copy of the centre card flies from where the card sat while pinned to the first moment card,
    // growing to its size and cross-fading to its photo; the real moment card shows once the copy lands.
    if(handoff.hidden!==!flying)handoff.hidden=!flying;
    if(firstMoment){set(firstMoment,'opacity',flying?'0':'');const landed=String(h>=1);if(firstMoment.dataset.landed!==landed)firstMoment.dataset.landed=landed}
    if(flying){
     const e=h*h*(3-2*h),mix=(a,b)=>(a+(b-a)*e).toFixed(1)+'px';
     const from=arcCards[centre].querySelector('img'),src=from?.currentSrc||from?.src;
     if(src&&handoffFrom.src!==src)handoffFrom.src=src;
     set(handoff,'left',mix(cb.left,mBox.left));set(handoff,'top',mix(cb.top,mBox.top-deckTop));
     set(handoff,'width',mix(cb.width,mBox.width));set(handoff,'height',mix(cb.height,mBox.height));
     set(handoff,'--hh-hand',clamp(h*1.6).toFixed(3));
    }
   }
   // Moments deck: after the handoff lands, each further 90% of a screen swipes the top card up and off with a
   // slight tilt, uncovering the next card, which brightens and settles to full size underneath it.
   const deck=reduced?0:clamp(-deckTop/(vh*.9),0,moments.length-1);
   moments.forEach((card,i)=>{
    const t=clamp(deck-i),swipe=t*t*(3-2*t),under=clamp(deck-i+1);
    set(card,'--hh-swipe',i<moments.length-1?swipe.toFixed(4):'0');
    set(card,'--hh-under',i===0?'1':under.toFixed(4));
    // Until the deck pins, only the first card exists (the handoff copy is flying into it).
    set(card,'visibility',!reduced&&((i>0&&deckTop>.5)||i>Math.floor(deck)+1||(i<moments.length-1&&t>=1))?'hidden':'');
   });
   // Plan the move: rises over the last moment as a dome, then each 60% of a screen slides the next tool card into
   // the centre; cards about two slots away or more are hidden and taken out of the tab order.
   dome(toolsStage,reduced?1:clamp((vh-toolsTop)/vh));
   const toolPos=clamp(-toolsTop/(vh*.6),0,toolCards.length-1);
   toolCards.forEach((card,i)=>{
    if(reduced){set(card,'--rel','');set(card,'--abs','');set(card,'zIndex','');set(card,'visibility','');setInert(card,false);return}
    const rel=i-toolPos,away=Math.abs(rel),visible=away<1.9;
    set(card,'--rel',rel.toFixed(4));set(card,'--abs',away.toFixed(4));
    set(card,'zIndex',String(10-Math.round(away*2)));set(card,'visibility',visible?'':'hidden');setInert(card,!visible);
   });
   set(final,'--hh-final',reduced?'1':clamp((vh-finalTop)/(vh*.85)).toFixed(3));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const resize=()=>{measure();schedule()};
  const pointer=event=>{
   if(event.pointerType!=='mouse'||media.matches)return;
   hero.style.setProperty('--hh-mx',((event.clientX/innerWidth)*2-1).toFixed(3));
   hero.style.setProperty('--hh-my',((event.clientY/innerHeight)*2-1).toFixed(3));
  };
  update();
  // Decode the photos further down while the browser is idle, so the first scroll through each section doesn't stall
  // on fetching and decoding them mid-frame. One image per idle slot keeps the main thread free.
  const idle=window.requestIdleCallback?cb=>requestIdleCallback(cb,{timeout:1500}):cb=>setTimeout(cb,200);
  let warmCancelled=false;
  const warm=()=>{
   const queue=[...page.querySelectorAll('img')].filter(img=>img.getBoundingClientRect().top>innerHeight);
   const next=()=>{if(warmCancelled)return;const img=queue.shift();if(!img)return;if(img.loading==='lazy')img.loading='eager';(img.decode?img.decode():Promise.resolve()).catch(()=>{}).finally(()=>idle(next))};
   idle(next);
  };
  if(document.readyState==='complete')warm();else addEventListener('load',warm,{once:true});
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);media.addEventListener('change',schedule);hero.addEventListener('pointermove',pointer);
  return()=>{warmCancelled=true;removeEventListener('load',warm);cancelAnimationFrame(frame);probe.remove();removeEventListener('scroll',schedule);removeEventListener('resize',resize);media.removeEventListener('change',schedule);hero.removeEventListener('pointermove',pointer)};
 },[]);

 // Tabs stay usable: picking one scrolls the pinned section to that place's step.
 function choosePlace(index,focus){
  setPlace(index);placeRef.current=index;
  if(focus)placeTabs.current?.querySelectorAll('[role=tab]')[index]?.focus({preventScroll:true});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const top=root.current.querySelector('.hh-places').getBoundingClientRect().top+scrollY;
  lockUntil.current=performance.now()+1000;
  scrollTo({top:top+(index+.4)*innerHeight*.5,behavior:'smooth'});
 }
 return <main ref={root} className="hh-home">
  {/* 1. Hero: giant wordmark with floating landmarks */}
  <section className="hh-hero" aria-labelledby="hh-hero-title">
   <div className="hh-hero-stage">
   <img className="hh-hero-photo" src="/penang/skyline.jpg" alt="Penang’s skyline, green hills and the Penang Bridge at sunrise" fetchPriority="high" width="2200" height="1467"/>
   <div className="hh-hero-shade" aria-hidden="true"/>
   {HERO_LANDMARKS.filter(l=>!l.front).map((l,i)=><img key={l.src} className="hh-float" src={l.src} alt="" aria-hidden="true" width="1254" height="1254" style={floatStyle(l,i)}/>)}
   <h1 id="hh-hero-title" className="hh-hero-title"><span className="hh-hero-kicker">Find your rhythm. In</span><span className="hh-wordmark">Penang</span></h1>
   {HERO_LANDMARKS.filter(l=>l.front).map((l,i)=><img key={l.src} className="hh-float hh-float-front" src={l.src} alt="" aria-hidden="true" width="1254" height="1254" style={floatStyle(l,i+2)}/>)}
   <p className="hh-hero-tagline">A little heritage. A little sea air.<br/>A whole new way to feel at home.</p>
   <a className="hh-hero-scroll" href="#hh-places"><Icon name="arrowDown"/><span>Scroll to discover</span></a>
   </div>
  </section>

  {/* 2. Choose your Penang: full-colour place panels with a thumbnail selector */}
  <section id="hh-places" className="hh-places" data-tone={current.tone} aria-labelledby="hh-places-label">
   <div className="hh-places-stage">
   <div className="hh-blobs" aria-hidden="true"><i/><i/><i/></div>
   <div className="hh-place" role="tabpanel" id={`hh-place-${current.key}`} aria-labelledby={`hh-tab-${current.key}`} key={current.key}>
    <div className="hh-place-copy">
     <span className="hh-place-areas">{current.areas}</span>
     <h2>{current.title}</h2>
     <p>{current.copy}</p>
     <Link className="hh-pill" href="/projects">See homes nearby <Icon name="arrowRight"/></Link>
    </div>
    <img className="hh-place-hero" src={current.image} alt={current.alt} width="1254" height="1254"/>
   </div>
   <div className="hh-place-picker">
    <span id="hh-places-label" className="hh-place-label">Choose your Penang</span>
    <div className="hh-place-tabs" role="tablist" aria-labelledby="hh-places-label" ref={placeTabs}>
     {PLACES.map((p,i)=><button key={p.key} type="button" role="tab" id={`hh-tab-${p.key}`} aria-selected={place===i} aria-controls={`hh-place-${p.key}`} tabIndex={place===i?0:-1} onClick={()=>choosePlace(i)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();choosePlace(e.key==='Home'?0:e.key==='End'?PLACES.length-1:(place+(e.key==='ArrowRight'?1:PLACES.length-1))%PLACES.length,true)}}}><img src={p.image} alt="" width="1254" height="1254"/><span>{p.name}</span></button>)}
    </div>
   </div>
   <div className="hh-place-progress" aria-hidden="true">{PLACES.map((p,i)=><i key={p.key} className={i<place?'is-done':i===place?'is-current':undefined}/>)}</div>
   </div>
  </section>

  {/* 3. Hot projects on a curved arc that turns with scroll, over the traced Penang outline.
      Falls back to Penang photography when no projects could be loaded. */}
  <section id="hot-projects" className="hh-arc" aria-labelledby="hh-arc-title" style={{'--n':ringCount}}>
   <div className="hh-arc-stage">
    <svg className="hh-penang-outline" viewBox={penangViewBox} fill="none" aria-hidden="true" focusable="false">
     <g className="hh-penang-base">{penangOutline.map((d,i)=><path key={i} d={d}/>)}</g>
     <g className="hh-penang-glow">{penangOutline.map((d,i)=><path key={i} d={d} pathLength="1000"/>)}</g>
    </svg>
    <h2 id="hh-arc-title" className="hh-statement">{hotProjects.length?<>Places worth <em>staying for.</em></>:<>Penang, <em>up close.</em></>}</h2>
    <div className="hh-arc-ring">{hotProjects.length?hotProjects.map((item,i)=><figure key={item.id} className="hh-arc-card hh-arc-project">
     <Link href={'/projects/'+encodeURIComponent(item.id)} className="hh-arc-link">
      <span className="hh-arc-photo"><CardPhoto src={item.images?.[0]} alt={listingName(item)}/></span>
      <span className="hh-arc-name">{listingName(item)}{item.location&&<small>{item.location}</small>}</span>
     </Link>
    </figure>):ARC_PHOTOS.map(p=><figure key={p.src} className="hh-arc-card"><img src={p.src} alt={p.alt} loading="lazy"/></figure>)}</div>
    <div className="hh-arc-foot">
     {hotProjects.length?<>
      <p className="hh-arc-note">{popularProjects?'The most-viewed projects.':'Handpicked by Hauszy.'}<span>{popularProjects?'Based on the last 30 days.':'From the island to the mainland.'}</span></p>
      <Link className="hh-pill" href="/projects">Explore all projects <Icon name="arrowUpRight"/></Link>
     </>:<p className="hh-arc-note">Before you find a home,<br/>find a place that feels like you.</p>}
    </div>
   </div>
  </section>

  {/* Shared-element copy that carries the centre project card into the first moment card (see the scroll loop). */}
  <div className="hh-handoff" hidden aria-hidden="true"><img className="hh-handoff-from" alt=""/><img className="hh-handoff-to" src={MOMENTS[0].src} alt=""/></div>

  {/* 4. Moments deck: pinned cards that swipe off one by one with scroll */}
  <section id="penang-film" className="hh-moments" aria-labelledby="hh-moments-title" style={{'--n':MOMENTS.length}}>
   <div className="hh-moments-stage">
   {MOMENTS.map((m,i)=><article key={m.src} className="hh-moment" style={{'--i':i,zIndex:MOMENTS.length-i}}>
    {/* The section title rides on the first card, which the hot-projects ring hands off into. */}
    {i===0&&<h2 id="hh-moments-title" className="hh-moments-title">Different days.<br/><em>Same Penang.</em></h2>}
    {m.film&&playing?<div className="hh-moment-film"><iframe src="https://player.vimeo.com/video/100688808?autoplay=1&dnt=1" title="MyPenang: Discover, Indulge, Explore — Penang Global Tourism" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/><button ref={closeFilm} type="button" className="hh-film-close" onClick={()=>{setPlaying(false);requestAnimationFrame(()=>playButton.current?.focus({preventScroll:true}))}} aria-label="Close Penang film"><Icon name="x"/></button></div>
    :<><img src={m.src} alt="" loading="lazy"/><div className="hh-moment-copy"><h3>{m.title}</h3><p>{m.line}</p>{m.film&&<button ref={playButton} type="button" className="hh-pill hh-pill-light" onClick={()=>setPlaying(true)}><span aria-hidden="true">▷</span> Watch the Penang film</button>}</div></>}
   </article>)}
   </div>
  </section>

  {/* 5. Plan the move: rises over the moments as a dome, then slides the tool cards through the centre */}
  <section className="hh-tools" aria-labelledby="hh-tools-title" style={{'--n':TOOLS.length}}>
   <div className="hh-tools-stage">
   <div className="hh-tools-glow" aria-hidden="true"/>
   <h2 id="hh-tools-title" className="hh-tools-title">Plan the move before you make it.</h2>
   <div className="hh-tool-deck">{TOOLS.map((t,i)=><Link key={t.href} href={t.href} className="hh-tool"><span className="hh-tool-no">0{i+1}</span><h3>{t.title}</h3><p>{t.copy}</p><Icon name="arrowUpRight"/></Link>)}</div>
   </div>
  </section>

  {/* 6. Closing call to action: headline sharpens as landmarks fly in */}
  <section className="hh-final" aria-labelledby="hh-final-title">
   <span className="hh-final-mark" aria-hidden="true">hauszy</span>
   {FINAL_LANDMARKS.map((src,i)=><img key={src} className="hh-final-float" src={src} alt="" aria-hidden="true" width="1254" height="1254" style={{'--i':i}}/>)}
   <div className="hh-final-copy">
    <h2 id="hh-final-title"><span>Like the place?</span><em>Find your space.</em></h2>
    <p>Tell us what home looks like to you — a heritage shophouse, a sea-view condo or a family home on the mainland — and we’ll help you find it.</p>
    <div className="hh-final-actions"><Link className="hh-pill hh-pill-solid" href="/projects">Start your search <Icon name="arrowUpRight"/></Link><Link className="hh-pill" href="/about">Meet your property contact <Icon name="arrowUpRight"/></Link></div>
   </div>
  </section>

  <details className="pg-credits hh-credits"><summary>Photography & film credits</summary><p>Additional Penang photography supplied by the site owner. Original photography: <a href="https://www.pexels.com/photo/aerial-view-of-penang-cityscape-at-sunrise-33985412/" target="_blank" rel="noopener noreferrer">Richard L</a> and <a href="https://www.pexels.com/photo/charming-vintage-shophouse-with-street-view-35569657/" target="_blank" rel="noopener noreferrer">Afham Hamsyari</a> / Pexels; <a href="https://unsplash.com/photos/GIZoYv-ltBs" target="_blank" rel="noopener noreferrer">Kelvin Zyteng</a>, <a href="https://unsplash.com/photos/DK5MZuruF_Y" target="_blank" rel="noopener noreferrer">Esmonde Yong</a> and <a href="https://unsplash.com/photos/0S_TppFLCuw" target="_blank" rel="noopener noreferrer">Vismen Subramaniam</a> / Unsplash. Film: Penang Global Tourism, produced by Image Farm.</p></details>
 </main>;
}
