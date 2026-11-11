'use client';
import CollectionCard from './CollectionCard';
import SimpleMarquee from './fancy/blocks/simple-marquee';

export default function RelatedProjectGrid({projects}){
 const count=Math.min(2,projects.length);
 const rows=Array.from({length:count},(_,index)=>projects.slice(Math.floor(index*projects.length/count),Math.floor((index+1)*projects.length/count)));
 return <div className="related-moving-grid">
  <div className="related-grid-controls"><span>{projects.length} more places to discover</span></div>
  <div className="related-marquee-rows">{rows.map((row,index)=><SimpleMarquee key={index} className="related-project-marquee" direction={index%2?'right':'left'} baseVelocity={2} paused={projects.length<2} repeat={projects.length>1?2:1} slowDownFactor={.1} slowdownOnHover scrollAwareDirection useScrollVelocity>
   {row.map(project=><div className="related-marquee-item" key={project.id}><CollectionCard project={project}/></div>)}
  </SimpleMarquee>)}</div>
 </div>;
}
