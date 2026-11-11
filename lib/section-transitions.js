'use client';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';

// Animate text fragments, never section ancestors that contain sticky scenes or maps.
export function sectionTransitions(scope,{titles,sections,desktop}){
 gsap.registerPlugin(ScrollTrigger,SplitText);
 const splits=[],chapters=[];
 scope.querySelectorAll(titles).forEach(heading=>{
  if(heading.getBoundingClientRect().top<innerHeight*.94)return;
  const split=SplitText.create(heading,{type:desktop?'words,chars':'words',mask:'words',aria:'auto'});
  splits.push(split);
  gsap.from(desktop?split.chars:split.words,{
   yPercent:desktop?110:65,x:desktop?index=>(index%3-1)*8:0,
   rotation:desktop?index=>(index%2?5:-5):0,opacity:.15,
   stagger:{amount:.32,from:'start'},duration:1,ease:'power3.out',
   scrollTrigger:{trigger:heading,start:'top 94%',end:'top 57%',scrub:.55},
  });
 });
 scope.querySelectorAll(sections).forEach(section=>{
  section.classList.add('hz-chapter-handoff');chapters.push(section);
  gsap.fromTo(section,{'--chapter-arrival':0},{'--chapter-arrival':1,ease:'none',scrollTrigger:{trigger:section,start:'top 96%',end:'top 28%',scrub:.65}});
 });
 return()=>{splits.forEach(split=>split.revert());chapters.forEach(section=>section.classList.remove('hz-chapter-handoff'))};
}
