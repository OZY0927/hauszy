'use client';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// Animate heading styles without mutating React-owned text or sticky ancestors.
export function sectionTransitions(scope,{titles,sections,desktop}){
 gsap.registerPlugin(ScrollTrigger);
 const chapters=[];
 scope.querySelectorAll(titles).forEach(heading=>{
  if(heading.getBoundingClientRect().top<innerHeight*.94)return;
  // Keep cost headings static: no nested masks can crop descenders or wrapped words.
  if(heading.closest('.project-story-charges'))return;
  // Animate the heading itself; never replace/reparent React-owned text nodes.
  gsap.from(heading,{
   y:desktop?24:14,opacity:0,duration:.75,ease:'power3.out',
   clearProps:'transform,opacity',
   scrollTrigger:{trigger:heading,start:'top 92%',once:true},
  });
 });
 scope.querySelectorAll(sections).forEach(section=>{
  section.classList.add('hz-chapter-handoff');chapters.push(section);
  gsap.fromTo(section,{'--chapter-arrival':0},{'--chapter-arrival':1,ease:'none',scrollTrigger:{trigger:section,start:'top 96%',end:'top 28%',scrub:.65}});
 });
 return()=>{chapters.forEach(section=>section.classList.remove('hz-chapter-handoff'))};
}
