'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';

const TOOLS=[
 ['/tools/loan-calculator','calculator','Loan calculator','Plan your monthly repayments'],
 ['/tools/upfront-cash-calculator','wallet','Upfront cash','Understand your starting costs'],
 ['/tools/loan-eligibility','shieldCheck','Loan eligibility','Estimate your borrowing range'],
 ['/tools/roi-calculator','trendingUp','ROI calculator','Explore your potential returns'],
];
const PAGES=[['/','Home'],['/projects','Penang projects'],['/about','About me']];

export default function Header(){
 const path=usePathname();
 const drawer=useRef(null),tools=useRef(null),trigger=useRef(null),hoveringTools=useRef(false),header=useRef(null),compact=useRef(null);
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false),[expanded,setExpanded]=useState(false);
 const collapsed=scrolled&&!expanded&&!open;
 const active=href=>href==='/'?path==='/':path===href||path.startsWith(href+'/');
 const close=()=>drawer.current?.close();
 const show=()=>{tools.current.open=false;drawer.current.showModal();drawer.current.querySelector('button').focus();setOpen(true)};
 useEffect(()=>{
  let previousY=window.scrollY,frame=0;
  const update=()=>{frame=0;const y=window.scrollY;setScrolled(y>80);if(y!==previousY&&!header.current?.querySelector(':focus-visible'))setExpanded(false);previousY=y};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const outside=e=>{if(tools.current&&!tools.current.contains(e.target))tools.current.open=false;if(!header.current?.contains(e.target))setExpanded(false)};
  const escape=e=>{if(e.key==='Escape'&&tools.current?.open){tools.current.open=false;tools.current.querySelector('summary').focus()}else if(e.key==='Escape'&&!drawer.current?.open){setExpanded(false);if(window.scrollY>80)requestAnimationFrame(()=>compact.current?.focus())}};
  update();window.addEventListener('scroll',schedule,{passive:true});document.addEventListener('click',outside);document.addEventListener('keydown',escape);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);document.removeEventListener('click',outside);document.removeEventListener('keydown',escape)};
 },[]);
 useEffect(()=>{drawer.current?.close();if(tools.current)tools.current.open=false},[path]);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[open]);
 const brand=<Link prefetch={false} className="logo hz-brand" href="/" aria-label="Hauszy home">hauszy</Link>;
 return <>
  <header ref={header} className={'hz-header'+(scrolled?' is-scrolled':'')+(collapsed?' is-collapsed':'')+(scrolled&&!collapsed?' is-expanded':'')} onPointerEnter={e=>{if(e.pointerType==='mouse')setExpanded(true)}} onPointerLeave={e=>{if(e.pointerType==='mouse'&&!header.current.querySelector(':focus-visible')){setExpanded(false);tools.current.open=false}}} onFocusCapture={e=>{if(e.target!==compact.current)setExpanded(true)}} onBlurCapture={e=>{if(!header.current.contains(e.relatedTarget))setExpanded(false)}}>
   <button ref={compact} type="button" className="hz-compact-logo" aria-label="Expand navigation" aria-expanded={!collapsed} aria-controls="hauszy-expanded-navigation" tabIndex={collapsed?0:-1} inert={!collapsed} onClick={()=>{setExpanded(true);requestAnimationFrame(()=>trigger.current?.focus())}}>hauszy</button>
   <div id="hauszy-expanded-navigation" className="hz-expanded-bar" inert={collapsed}>
   <button ref={trigger} type="button" className="hz-menu-button" aria-label="Open navigation menu" aria-expanded={open} aria-controls="hauszy-navigation-panel" onClick={show}><span/><span/></button>
   <nav className="hz-primary" aria-label="Primary navigation">
    <Link prefetch={false} className="hz-nav-link" href="/" aria-current={active('/')?'page':undefined}>Home</Link>
    <Link prefetch={false} className="hz-nav-link" href="/projects" aria-current={active('/projects')?'page':undefined}>Penang<br/>projects</Link>
    {brand}
    <details className="hz-tools" ref={tools} onPointerEnter={e=>{if(e.pointerType==='mouse'){hoveringTools.current=true;tools.current.open=true}}} onPointerLeave={e=>{if(e.pointerType==='mouse'){hoveringTools.current=false;if(!tools.current.contains(document.activeElement))tools.current.open=false}}}>
     <summary onClick={e=>{if(hoveringTools.current&&e.detail>0)e.preventDefault()}} className="hz-nav-link" aria-current={path.startsWith('/tools/')?'true':undefined}>Property<br/>tools <Icon name="chevronDown"/></summary>
     <div className="hz-tools-popover"><span className="hz-menu-label">PLAN YOUR NEXT MOVE</span>{TOOLS.map(([href,icon,label,description])=><Link prefetch={false} key={href} href={href} aria-current={active(href)?'page':undefined} onClick={()=>tools.current.open=false}><Icon name={icon}/><span><strong>{label}</strong><small>{description}</small></span><Icon name="arrowUpRight"/></Link>)}</div>
    </details>
    <Link prefetch={false} className="hz-nav-link" href="/about" aria-current={active('/about')?'page':undefined}>About<br/>me</Link>
   </nav>
   <Link prefetch={false} className="hz-header-cta" href="/projects"><span className="hz-cta-label">Find your space</span><span className="hz-cta-short">Explore</span><Icon name="chevronRight"/></Link>
   </div>
  </header>
  <dialog id="hauszy-navigation-panel" className="hz-drawer" ref={drawer} aria-label="Explore Hauszy" onKeyDown={e=>{if(e.key!=='Tab')return;const items=[...drawer.current.querySelectorAll('a[href],button')].filter(el=>el.getClientRects().length),first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===drawer.current)){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}} onClose={()=>{setOpen(false);trigger.current?.focus()}} onClick={e=>{if(e.target!==drawer.current)return;const rect=drawer.current.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close()}}>
   <div className="hz-drawer-top"><button type="button" className="hz-menu-button hz-close" aria-label="Close navigation menu" onClick={close}><Icon name="x"/></button><Link prefetch={false} className="logo" href="/" onClick={close} aria-label="Hauszy home">hauszy</Link></div>
   <nav className="hz-drawer-pages" aria-label="All pages">{PAGES.map(([href,label])=><Link prefetch={false} key={href} href={href} onClick={close} aria-current={active(href)?'page':undefined}>{label}<span><Icon name="chevronRight"/></span></Link>)}</nav>
   <div className="hz-drawer-tools"><span className="hz-menu-label">PROPERTY TOOLS</span><nav aria-label="Property calculators">{TOOLS.map(([href,icon,label])=><Link prefetch={false} key={href} href={href} onClick={close} aria-current={active(href)?'page':undefined}><Icon name={icon}/>{label}<Icon name="arrowUpRight"/></Link>)}</nav></div>
   <div className="hz-drawer-bottom"><span className="hz-menu-label">PENANG ISLAND & MAINLAND</span><p>Your next move.<br/><em>A little closer.</em></p><Link prefetch={false} href="/about" onClick={close}>Meet your property contact <Icon name="arrowUpRight"/></Link></div>
  </dialog>
 </>;
}
