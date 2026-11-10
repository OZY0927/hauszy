'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import Icon from './Icon';

const FALLBACK_IMAGE='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85';

export default function HomeReveal({image, imageAlt}) {
  const section=useRef(null);
  const stage=useRef(null);
  const windowFrame=useRef(null);
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    const root=section.current;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    // Sticky offset and travel only change with size, so scrolling reads one rect and never forces a style recalc.
    let frame=0,top=0,travel=1,last=-1;
    const measure=()=>{
      top=parseFloat(getComputedStyle(stage.current).top)||0;
      travel=Math.max(1,root.offsetHeight-stage.current.offsetHeight);
      last=-1;
    };
    const update=()=>{
      frame=0;
      const progress=media.matches?1:Math.max(0,Math.min(1,(top-root.getBoundingClientRect().top)/travel));
      if(progress===last)return;
      last=progress;
      // Set on the window, not the section, so only the clipped scene restyles each frame.
      const scene=windowFrame.current.style;
      scene.setProperty('--window-inset',`${18*(1-progress)}%`);
      scene.setProperty('--window-round',`${50*(1-progress)}%`);
      scene.setProperty('--image-scale',`${1.08-.08*progress}`);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    const resize=()=>{measure();schedule()};
    measure();
    update();
    root.classList.add('is-scroll-ready');
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',resize);
    media.addEventListener('change',resize);
    const observer=new ResizeObserver(resize);
    observer.observe(root);
    return()=>{
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',resize);
      media.removeEventListener('change',resize);
    };
  },[]);

  return <section ref={section} className="home-reveal" aria-labelledby="home-reveal-title">
    <div className="home-reveal-intro">
      <div><div className="eyebrow">A LITTLE MORE POSSIBILITY</div><h2>A place for your next chapter.</h2></div>
      <p>For the way you live. For the work you do.<br/>Discover what’s next, right here in Penang.</p>
    </div>
    <div ref={stage} className="home-reveal-stage">
      <div ref={windowFrame} className="home-reveal-window">
        <img className="home-reveal-image" src={failed?FALLBACK_IMAGE:(image||FALLBACK_IMAGE)} alt={failed||!image?'Bright contemporary living space':imageAlt} loading="lazy" onError={()=>setFailed(true)}/>
        <div className="home-reveal-shade"/>
        <div className="home-reveal-content">
          <span className="home-reveal-kicker">PENANG · A PLACE TO BELONG</span>
          <h2 id="home-reveal-title">Room to live.<br/>Space to grow.<br/><em>A place to call yours.</em></h2>
          <div className="home-reveal-bottom"><p>Homes, commercial spaces and industrial properties.<br/>Find the space for your next move.</p><Link href="/projects">Discover your space <Icon name="arrowUpRight"/></Link></div>
        </div>
        <span className="home-reveal-caption">{image&&!failed?'Explore this and more in our project collection':'Illustrative interior photo'}</span>
      </div>
      <div className="home-reveal-hint" aria-hidden="true">SCROLL TO EXPLORE <Icon name="arrowDown"/></div>
    </div>
    <div className="home-reveal-travel" aria-hidden="true"/>
  </section>;
}
