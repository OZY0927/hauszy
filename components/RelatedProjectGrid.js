'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import CardPhoto from './ProjectCardPhoto';
import Icon from './Icon';
import {listingName,startingPrice} from '../lib/project';

export default function RelatedProjectGrid({projects}){
 const root=useRef(null),[visible,setVisible]=useState(false);
 useEffect(()=>{if(!('IntersectionObserver' in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)),{rootMargin:'100px'});if(root.current)observer.observe(root.current);return()=>observer.disconnect()},[]);
 const rows=projects.length>3?[projects.filter((_,i)=>i%2===0),projects.filter((_,i)=>i%2===1)]:[projects];
 return <div ref={root} className={'related-moving-grid'+(visible?' is-visible':'')}>
  <div className="related-grid-controls"><span>{projects.length} more places to discover</span></div>
  <div className="related-grid-lanes">{rows.map((row,index)=><div className={'related-grid-lane'+(row.length<2?' is-static':'')} key={index}><div className="related-grid-track" style={{'--lane-duration':Math.max(40,row.length*11)+'s'}}>{[0,...(row.length>1?[1]:[])].map(copy=><div className="related-grid-group" key={copy} aria-hidden={copy===1?true:undefined}>{row.map(project=>{const name=listingName(project),price=startingPrice(project);return <article className="related-grid-card" key={project.id}><div className="related-grid-photo"><CardPhoto src={project.images[0]} alt=""/></div><Link href={'/projects/'+encodeURIComponent(project.id)} tabIndex={copy===1?-1:undefined} aria-label={`Explore ${name}`}><div className="related-grid-card-top"><span>{project.location}</span><h3>{name}</h3></div><div className="related-grid-card-bottom"><span>{price?<><small>{price[0]}</small><strong>{price[1]}</strong></>:<strong>Price on enquiry</strong>}</span><span className="related-grid-arrow"><Icon name="arrowUpRight"/></span></div></Link></article>})}</div>)}</div></div>)}</div>
 </div>;
}
