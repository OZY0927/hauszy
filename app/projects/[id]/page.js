import ProjectFacilities from '../../../components/ProjectFacilities';
import {pageMetadata,projectStructuredData} from '../../../lib/seo';
import JsonLd from '../../../components/JsonLd';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getProfile,getPublishedProject,getPublishedProjects} from '../../../lib/firestore-server';
import {whatsappNumber,whatsappLink,projectMessage} from '../../../lib/whatsapp';
import {hasProjectInfo,visibleFacts,projectSections} from '../../../lib/project-visibility';
import {money,groupAmenities,withUnit,safeUrl,formatRange,pricePerSqft,vpQuarter,startingPrice,cardProject,listingName} from '../../../lib/project';
import ProjectGallery from '../../../components/ProjectGallery';
import ProjectSectionNav,{ProjectStory} from '../../../components/ProjectSectionNav';
import ShowroomGallery from '../../../components/ShowroomGallery';
import FloorPlanViewer from '../../../components/FloorPlanViewer';
import ProjectMap from '../../../components/ProjectMap';
import EnquiryCard from '../../../components/EnquiryCard';
import FloatingVideo from '../../../components/FloatingVideo';
import {videoSource} from '../../../lib/video';
import CollectionCard from '../../../components/CollectionCard';
import Icon from '../../../components/Icon';
import {nearbyIcon} from '../../../lib/icon-match';

export async function generateStaticParams(){return []}
export async function generateMetadata({params}){const {id}=await params;const p=await getPublishedProject(id);if(!p)return {title:'Project unavailable',robots:{index:false,follow:false}};return pageMetadata(listingName(p),`${listingName(p)} in ${p.location}. Explore layouts, facilities and project details.`,`/projects/${encodeURIComponent(id)}/`,p.images.slice(0,1))}
function Facts({rows}){return <dl className="property-facts">{visibleFacts(rows).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
function SectionHeading({label,title,children}){return <div className="project-story-section-heading"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div>{children&&<div className="project-story-section-note">{children}</div>}</div>}

export default async function Project({params}){
 const {id}=await params;
 const [project,all,profile]=await Promise.all([getPublishedProject(id),getPublishedProjects().catch(()=>null),getProfile().catch(()=>null)]);
 if(!project)notFound();
 const p={...project,name:listingName(project)};
 const visibility=projectSections(p),groups=groupAmenities(visibility.nearby),related=(all||[]).filter(v=>v.id!==id&&v.mode===p.mode).slice(0,2);
 const sections=[...(visibility.overview?[['overview','The project']]:[]),...(visibility.photos&&p.images.length?[['project-photos','Gallery']]:[]),...(visibility.details?[['details','Details']]:[]),...(visibility.units.length?[['units','Layouts']]:[]),...(visibility.facilities.length?[['amenities','Facilities']]:[]),...(visibility.location?[['location','Neighbourhood']]:[]),...(visibility.maintenance?[['maintenance','Charges']]:[]),...(visibility.showroom.length?[['showroom','Showroom']]:[])];
 const introFacts=visibleFacts([['Construction',p.construction],['Estimated VP',vpQuarter(p.vp)],['Location',p.location],['Tenure',p.tag]]);
 return <ProjectStory>
  <JsonLd data={projectStructuredData(p)}/>
  <ProjectGallery photos={visibility.photos?p.images:[]} name={p.name} hero={{id:p.id,location:hasProjectInfo(p.location)?p.location:null,type:p.type,mode:p.mode,price:startingPrice(p),target:sections[0]?.[0]||(visibility.enquiry?'enquiry':null)}}/>
  <ProjectSectionNav sections={sections} enquiry={visibility.enquiry}/>

  {visibility.overview&&<section className="project-story-intro project-story-section" id="overview">
   <div className="project-story-intro-main" data-reveal><div className="eyebrow">THE PROJECT</div><h2>{p.title}</h2><p>Explore {p.name}{hasProjectInfo(p.location)?` in ${p.location}`:''}. Discover the layouts, spaces and details that could shape your next move.</p>{visibility.enquiry&&<a className="project-story-pill" href="#enquiry">Let’s talk about this project <Icon name="arrowUpRight"/></a>}</div>
   {introFacts.length>0&&<dl className="project-story-at-a-glance">{introFacts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  </section>}

  {visibility.photos&&p.images.length>0&&<section className="project-story-section project-story-photography" id="project-photos"><SectionHeading label="TAKE A LOOK AROUND" title={<>A first look at<br/>{p.name}.</>}><p>Explore the project, one photo at a time.</p></SectionHeading><ProjectGallery photos={p.images} name={p.name}/><p className="project-story-fine-print">Contact us to confirm current availability and project specifications.</p></section>}

  {visibility.overview&&[p.beds,p.baths,p.size,p.tag].some(hasProjectInfo)&&<section className="project-story-highlights" aria-label="Project highlights"><div className="project-story-highlights-inner">{[[p.beds,'Bedrooms','bed'],[p.baths,'Bathrooms','bath'],[p.size,'Built-up · sqft','ruler'],[p.tag,'Tenure','key']].filter(([v])=>hasProjectInfo(v)).map(([value,label,icon])=><div key={label} data-reveal><Icon name={icon}/><strong>{value}</strong><span>{label}</span></div>)}</div></section>}

  {visibility.details&&<section className="project-story-section" id="details"><SectionHeading label="THE FINER DETAILS" title={<>Get to know<br/>your next address.</>}><p>The key facts, all in one place.</p></SectionHeading><Facts rows={[["Project name",p.name],["Developer",p.developer||null],["Project location",p.location],["Property type",p.type],["Price per sqft",pricePerSqft(p)?money(pricePerSqft(p))+' / sqft':null],["Tenure (freehold / leasehold)",p.tag],["Title (residential / commercial)",p.titleType||null],["Total units",p.totalUnits],["Towers / blocks",p.towers],["Total floors",formatRange([p.floors,p.floorsMax])],["Units per floor",formatRange([p.unitsPerFloor,p.unitsPerFloorMax])],["Total lifts",p.totalLifts],["Construction status",p.construction||null],["Estimated VP",vpQuarter(p.vp)]]}/></section>}

  {visibility.units.length>0&&<section className="project-story-layouts" id="units"><div className="project-story-section"><SectionHeading label="SPACES THAT FIT YOUR LIFE" title={<>Find the layout<br/>that feels like you.</>}><p>Compare the options. Open any floor plan to zoom in and explore the details.</p></SectionHeading><div className="project-story-unit-list">{visibility.units.map((unit,i)=><article className={'unit-preview project-story-unit'+(!unit.floorPlanUrls.length?' without-floorplan':'')} key={i}><div className="project-story-unit-copy"><span className="badge-inline">LAYOUT {String(i+1).padStart(2,'0')}</span><h3>{unit.name||'Unit layout'}</h3><Facts rows={[["Built-up size",hasProjectInfo(unit.size)?unit.size+' sqft':null],["Bedrooms",unit.bedrooms],["Bathrooms",unit.bathrooms],["Car parks",unit.carParks]]}/><strong className="project-story-unit-price">{Number(unit.price)>0?money(unit.price):'Price on enquiry'}</strong><p className="project-story-fine-print">Contact us for current unit pricing and availability.</p>{visibility.enquiry&&<a className="project-story-pill" href={whatsappNumber(profile)?whatsappLink(whatsappNumber(profile),projectMessage({kind:'enquiry',agent:profile?.name,project:p.name,layout:unit.name||'Unit layout'})):'#enquiry'} target={whatsappNumber(profile)?'_blank':undefined} rel={whatsappNumber(profile)?'noopener noreferrer':undefined}>Ask about this layout <Icon name="arrowUpRight"/></a>}</div>{unit.floorPlanUrls.length>0&&<FloorPlanViewer plans={unit.floorPlanUrls} name={unit.name||'Unit layout'}/>}</article>)}</div></div></section>}

  {visibility.facilities.length>0&&<section className="project-story-section project-story-facilities" id="amenities"><SectionHeading label="A LITTLE MORE TO EVERY DAY" title={<>More room<br/>to enjoy life.</>}><p>Explore the facilities and shared spaces within the project.</p></SectionHeading><ProjectFacilities facilities={visibility.facilities}/></section>}

  {visibility.location&&<section className="project-story-neighbourhood" id="location"><div className="project-story-section"><SectionHeading label="BEYOND YOUR FRONT DOOR" title={<>Get to know<br/>the neighbourhood.</>}><p>{hasProjectInfo(p.location)?p.location:'Explore the project surroundings.'}</p></SectionHeading><div className={'project-story-location-grid'+(!groups.length?' map-only':'')}>{visibility.hasCoordinates?<ProjectMap project={{name:p.name,location:p.location,latitude:p.latitude,longitude:p.longitude}}/>:hasProjectInfo(p.location)?<div className="project-story-location-name"><Icon name="mapPin"/><h3>{p.location}</h3></div>:null}{groups.length>0&&<div className="nearby-amenities"><h3>Close to what matters.</h3>{groups.map((group,i)=><details className="nearby-category" key={group.label} open={i===0}><summary><h3><Icon name={nearbyIcon(group.label)}/>{group.label}<small>{group.rows.length}</small><Icon name="chevronDown"/></h3></summary><ul>{group.rows.map((row,i)=><li key={i}><strong>{row.name}</strong>{(hasProjectInfo(row.distance)||hasProjectInfo(row.travelTime))&&<span>{[hasProjectInfo(row.distance)?withUnit(row.distance,'km'):null,hasProjectInfo(row.travelTime)?withUnit(row.travelTime,'mins'):null].filter(Boolean).join(' · ')}</span>}</li>)}</ul></details>)}</div>}</div>{groups.length>0&&<p className="project-story-fine-print">Distances and travel times are approximate. Travel conditions may vary.</p>}</div></section>}

  {visibility.maintenance&&<section className="project-story-section project-story-charges" id="maintenance"><SectionHeading label="PLAN THE EVERYDAY DETAILS" title={<>A clearer view<br/>of ongoing costs.</>}/><Facts rows={[["Maintenance fee per sqft",hasProjectInfo(p.maintenance)?money(p.maintenance)+' / month':null],["Sinking fund",p.sinkingFund]]}/></section>}

  {visibility.showroom.length>0&&<section className="project-story-section project-story-showroom" id="showroom"><SectionHeading label="STEP INSIDE" title={<>Picture the<br/>possibilities.</>}><p>A look inside the showroom.</p></SectionHeading><ShowroomGallery photos={visibility.showroom} name={p.name}/><p className="project-story-fine-print">Showroom units are for illustration only and may include furnishings and finishes not included in the sale.</p></section>}

  {visibility.enquiry&&<section className="project-story-contact"><div className="project-story-section project-story-contact-grid"><div className="project-story-contact-copy" data-reveal><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Come see<br/>the possibilities.</h2><p>Have a question about {p.name}? Get the latest details, plan your budget, or arrange a viewing with your property contact.</p><span className="project-story-contact-location"><Icon name="mapPin"/>{hasProjectInfo(p.location)?p.location:'Penang'}</span></div><EnquiryCard project={p} agent={{name:String(profile?.name||'').trim(),ren:profile?.ren||'',agency:profile?.agency||'',portrait:safeUrl(profile?.portrait)?profile.portrait:'',whatsapp:whatsappNumber(profile)}}/></div></section>}
  {visibility.video&&videoSource(p.videoUrl)&&<FloatingVideo url={p.videoUrl} name={p.name}/>}
  {visibility.related&&related.length>0&&<section className="project-story-section project-story-related"><SectionHeading label="KEEP EXPLORING" title={<>Another place.<br/>Another possibility.</>}><Link className="project-story-pill" href="/projects">All Penang projects <Icon name="arrowUpRight"/></Link></SectionHeading><div className="project-story-related-grid">{related.map(v=><CollectionCard key={v.id} project={cardProject(v)}/>)}</div></section>}
 </ProjectStory>;
}
