'use client';
import {useEffect,useRef} from 'react';
import Link from 'next/link';
import Gallery from './Gallery';
import Icon from './Icon';
import {whatsappLink} from '../lib/whatsapp';
const steps=[
 {title:<>Your plans.<br/>The starting point.</>,copy:'A home, a business space or your next property in Penang. Start with your budget, preferred location and what matters to you.',image:'/penang/colonial-corner.webp',alt:'A motorcyclist passing a white colonial corner building with green shutters',label:'01 / LISTEN'},
 {title:<>A little clarity.<br/>A clearer direction.</>,copy:'Explore project details and compare locations, layouts and prices. Make room for the options that fit your plans.',image:'/penang/coast.jpg',alt:'An evening along the Penang coastline',label:'02 / EXPLORE'},
 {title:<>See the space.<br/>Feel the possibility.</>,copy:'Ask your questions and arrange a viewing when you’re ready. Take a closer look before deciding on your next move.',image:'/penang/hills.jpg',alt:'Penang homes against a backdrop of green hills',label:'03 / TAKE THE NEXT STEP'},
];
export default function AboutJourney({profile:p,photos,failed}){
 const root=useRef(null);
 useEffect(()=>{
  const el=root.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  el.classList.add('aj-motion');let frame=0,last=-1,read=-1;
  // Elements are found once; rects are read before anything is written, and --aj-travel lives on the scene that uses it.
  const hero=el.querySelector('.aj-hero'),scene=hero.querySelector('.aj-hero-scene'),statement=el.querySelector('.aj-statement'),words=[...statement.querySelectorAll('span')];
  const update=()=>{frame=0;const box=hero.getBoundingClientRect(),bounds=statement.getBoundingClientRect(),travel=Math.min(Math.max(-box.top,0),box.height),progress=Math.max(0,Math.min(1,(innerHeight*.8-bounds.top)/(bounds.height*.85)));
   if(travel!==last){last=travel;scene.style.setProperty('--aj-travel',`${travel}px`)}
   const count=words.filter((word,i)=>i/words.length<=progress).length;if(count!==read){read=count;words.forEach((word,i)=>word.classList.toggle('is-read',i<count))}
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('aj-visible');observer.unobserve(entry.target)}}),{threshold:.12});
  el.querySelectorAll('[data-aj-reveal]').forEach(node=>observer.observe(node));update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);el.classList.remove('aj-motion')};
 },[]);
 return <main className="about-journey" ref={root}>
  <section className="aj-hero" aria-labelledby="aj-title">
   <span className="aj-tag">THE PERSON BEHIND YOUR NEXT MOVE</span>
   <h1 id="aj-title"><span>A Penang focus.</span><span>A personal <em>touch.</em></span></h1>
   <p>Places to discover. Possibilities to explore.<br/>A little guidance along the way.</p>
   <div className="aj-hero-scene">
    <figure className="aj-landscape aj-landscape-left"><img src="/penang/vintage-rickshaw.webp" alt="A vintage trishaw and tropical plant against a vivid blue wall" width="1402" height="1122"/><figcaption>ROOTED IN PENANG</figcaption></figure>
    <a className="aj-portrait" href="#meet"><div className="aj-portrait-image">{p.portrait?<img src={p.portrait} alt={p.name} fetchPriority="high"/>:<span>hauszy</span>}</div><div className="aj-portrait-caption"><span>MEET YOUR PROPERTY CONTACT</span><strong>{p.name}</strong><Icon name="arrowDown"/></div></a>
    <figure className="aj-landscape aj-landscape-right"><img src="/penang/skyline.jpg" alt="Penang skyline and the bridge"/><figcaption>ISLAND & MAINLAND</figcaption></figure>
   </div>
   <div className="aj-hero-bottom"><span>PENANG, MALAYSIA</span><a href="#meet">Get to know me <Icon name="arrowDown"/></a><span>A PERSONAL APPROACH</span></div>
  </section>
  <section className="aj-mission" id="meet"><span className="aj-tag">A LITTLE GUIDANCE HELPS</span><h2 data-aj-reveal>{p.heading}</h2><p className="aj-statement">{p.bio.split(/\s+/).map((word,i)=><span key={i}>{word}{' '}</span>)}</p><div className="aj-signature"><strong>{p.name}</strong><span>{[p.ren,p.agency].filter(Boolean).join(' · ')||'Your Penang property contact'}</span></div>{failed&&<p role="status">Profile updates could not be loaded. Please try again later.</p>}<Link className="aj-button aj-button-light" href="/projects">Explore Penang projects <Icon name="arrowUpRight"/></Link></section>
  <section className="aj-path"><div className="aj-path-heading" data-aj-reveal><span className="aj-tag">YOUR SEARCH, AT YOUR PACE</span><h2>The path<br/>to your next <em>chapter.</em></h2><p>From the first question to a closer look.<br/>Let’s explore what comes next.</p></div>{steps.map((step,i)=><article className={'aj-step aj-step-'+i} key={step.label}><div className="aj-step-image" data-aj-reveal><img src={step.image} alt={step.alt} loading="lazy"/><span aria-hidden="true">0{i+1}</span></div><div className="aj-step-copy" data-aj-reveal><span className="aj-tag">{step.label}</span><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</section>
  <section className="aj-moments"><div className="aj-moments-heading" data-aj-reveal><span className="aj-tag">MOMENTS THAT MATTER</span><h2>New keys.<br/><em>Happy beginnings.</em></h2><p>The people and moments behind the property journeys.</p></div>{photos.length?<Gallery photos={photos} deals/>:<p className="aj-empty">Success stories and photos will be shared here soon.</p>}</section>
  <section className="aj-contact" data-aj-reveal><span className="aj-tag">LET’S FIND YOUR NEXT MOVE</span><h2>It starts with<br/>a <em>conversation.</em></h2><p>Have a place in mind? Or still finding your direction?</p><div>{p.whatsapp&&<a className="aj-button" href={whatsappLink(p.whatsapp,`Hi ${p.name}, I’d like some guidance with my Penang property search.`)} target="_blank" rel="noopener noreferrer">Let’s talk <Icon name="arrowUpRight"/></a>}<Link className="aj-contact-projects" href="/projects">Explore the projects <Icon name="arrowRight"/></Link></div><span className="aj-contact-name">{p.name}{p.ren&&` · ${p.ren}`}{p.agency&&` · ${p.agency}`}</span></section>
 </main>;
}
