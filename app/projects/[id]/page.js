import {ContainerScroll} from '../../../components/ui/container-scroll-animation';
import HighlightNumber from '../../../components/HighlightNumber';
import ProjectFacilities from '../../../components/ProjectFacilities';
import {pageMetadata,projectStructuredData} from '../../../lib/seo';
import JsonLd from '../../../components/JsonLd';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getProfile,getPublishedProject,getPublishedProjects} from '../../../lib/firestore-server';
import {whatsappNumber,whatsappLink,projectMessage} from '../../../lib/whatsapp';
import {hasProjectInfo,visibleFacts,projectSections} from '../../../lib/project-visibility';
import {sinkingFundText,maintenanceText,money,unitCountRange,safeUrl,startingPrice,cardProject,listingName} from '../../../lib/project';
import ProjectGallery from '../../../components/ProjectGallery';
import ProjectSectionNav,{ProjectStory} from '../../../components/ProjectSectionNav';
import ShowroomGallery from '../../../components/ShowroomGallery';
import ProjectLayouts from '../../../components/ProjectLayouts';
import ProjectNeighbourhood from '../../../components/ProjectNeighbourhood';
import EnquiryCard from '../../../components/EnquiryCard';
import FloatingVideo from '../../../components/FloatingVideo';
import {videoSource} from '../../../lib/video';
import RelatedProjectGrid from '../../../components/RelatedProjectGrid';
import Icon from '../../../components/Icon';
import ProjectScrollIntroduction from '../../../components/ProjectScrollIntroduction';
import ProjectDetails from '../../../components/ProjectDetails';

export async function generateStaticParams(){return []}
export async function generateMetadata({params}){const {id}=await params;const p=await getPublishedProject(id);if(!p)return {title:'Project unavailable',robots:{index:false,follow:false}};return pageMetadata(listingName(p),`${listingName(p)} in ${p.location}. Explore layouts, facilities and project details.`,`/projects/${encodeURIComponent(id)}/`,p.images.slice(0,1))}
function Facts({rows}){return <dl className="property-facts">{visibleFacts(rows).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
function SectionHeading({label,title,children}){return <div className="project-story-section-heading"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div>{children&&<div className="project-story-section-note">{children}</div>}</div>}

export default async function Project({params}){
 const {id}=await params;
 const [project,all,profile]=await Promise.all([getPublishedProject(id),getPublishedProjects().catch(()=>null),getProfile().catch(()=>null)]);
 if(!project)notFound();
 const p={...project,name:listingName(project)};
 const visibility=projectSections(p),related=(all||[]).filter(v=>v.id!==id).sort((a,b)=>Number(b.mode===p.mode)-Number(a.mode===p.mode)).slice(0,12);
 const sections=[...(visibility.overview||visibility.photos?[['overview','The project']]:[]),...(visibility.photos&&p.images.length?[['project-photos','Gallery']]:[]),...(visibility.details?[['details','Details']]:[]),...(visibility.units.length?[['units','Layouts']]:[]),...(visibility.facilities.length?[['amenities','Facilities']]:[]),...(visibility.location?[['location','Neighbourhood']]:[]),...(visibility.maintenance?[['maintenance','Charges']]:[]),...(visibility.showroom.length?[['showroom','Showroom']]:[])];
 return <ProjectStory key={id} previewImages={[...(visibility.photos?p.images:[]),...visibility.units.flatMap(unit=>unit.floorPlanUrls),...visibility.showroom]}>
  <JsonLd data={projectStructuredData(p)}/>
  <ProjectGallery photos={visibility.photos?p.images:[]} name={p.name} hero={{id:p.id,location:hasProjectInfo(p.location)?p.location:null,type:p.type,mode:p.mode,price:startingPrice(p),target:sections[0]?.[0]||(visibility.enquiry?'enquiry':null)}}/>
  <ProjectSectionNav sections={sections} enquiry={visibility.enquiry}/>


  {(visibility.overview||visibility.photos)&&<ProjectScrollIntroduction photos={visibility.photos?p.images:[]}>
   {visibility.overview&&<>
   <div className="project-story-intro-main"><div className="eyebrow">THE PROJECT</div><h2>{hasProjectInfo(p.title)&&p.title.trim().toLowerCase()!==p.name.trim().toLowerCase()?p.title:<>A closer look.<br/>A place to call yours.</>}</h2>{hasProjectInfo(p.location)&&<span className="project-overview-location"><Icon name="mapPin"/>{p.location}</span>}<p>Explore the layouts, spaces and details. Picture the possibilities for your next chapter.</p>{visibility.enquiry&&<a className="project-story-pill" href="#enquiry">Enquire about this project <Icon name="arrowUpRight"/></a>}</div>

   </>}
  </ProjectScrollIntroduction>}

  {visibility.photos&&p.images.length>0&&<section className="project-story-section project-story-photography" id="project-photos"><ContainerScroll titleComponent={<SectionHeading label="TAKE A LOOK AROUND" title={<>A first look at<br/>{p.name}.</>}><p>Explore the project, one photo at a time.</p></SectionHeading>}><ProjectGallery photos={p.images} name={p.name}/></ContainerScroll></section>}

  {visibility.overview&&[p.beds,p.baths,p.size,p.tag].some(hasProjectInfo)&&<section className="project-story-highlights" aria-label="Project highlights"><div className="project-story-highlights-inner">{[[unitCountRange(p.units,'bedrooms'),'Bedrooms','bed'],[unitCountRange(p.units,'bathrooms'),'Bathrooms','bath'],[p.size,'Built-up · sqft','ruler'],[p.tag,'Tenure','key']].filter(([v])=>hasProjectInfo(v)).map(([value,label,icon])=><div key={label} data-reveal><Icon name={icon}/><HighlightNumber value={value}/><span>{label}</span></div>)}</div></section>}

  {visibility.details&&<ProjectDetails project={p}/>}

  {visibility.units.length>0&&<ProjectLayouts units={visibility.units.map(unit=>({...unit,enquiryHref:whatsappNumber(profile)?whatsappLink(whatsappNumber(profile),projectMessage({kind:'enquiry',agent:profile?.name,project:p.name,layout:unit.name||'Unit layout'})):'#enquiry'}))} enquiry={visibility.enquiry}/>}

  {visibility.facilities.length>0&&<section className="project-story-section project-story-facilities" id="amenities"><ProjectFacilities facilities={visibility.facilities}/></section>}

  {visibility.location&&<ProjectNeighbourhood project={{id:p.id,name:p.name,location:p.location,latitude:p.latitude??null,longitude:p.longitude??null}} hasCoordinates={visibility.hasCoordinates} amenities={visibility.nearby}/>}

  {visibility.maintenance&&<section className="project-story-section project-story-charges" id="maintenance"><SectionHeading label="PLAN THE EVERYDAY DETAILS" title={<><span className="charges-heading-line">A clearer view</span><span className="charges-heading-line">of ongoing costs.</span></>}/><Facts rows={[["Maintenance fee",hasProjectInfo(p.maintenance)?maintenanceText(p):null],["Sinking fund",sinkingFundText(p)]]}/></section>}

  {visibility.showroom.length>0&&<section className="project-story-section project-story-showroom" id="showroom"><SectionHeading label="STEP INSIDE" title={<>Picture the<br/>possibilities.</>}><p>A look inside the showroom.</p></SectionHeading><ShowroomGallery photos={visibility.showroom} name={p.name}/><p className="project-story-fine-print">Showroom units are for illustration only and may include furnishings and finishes not included in the sale.</p></section>}

  {visibility.enquiry&&<section className="project-story-contact"><div className="project-story-section project-story-contact-grid"><div className="project-story-contact-copy" data-reveal><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Come see<br/>the possibilities.</h2><p>Have a question about {p.name}? Get the latest details, plan your budget, or arrange a viewing with your property contact.</p><span className="project-story-contact-location"><Icon name="mapPin"/>{hasProjectInfo(p.location)?p.location:'Penang'}</span></div><EnquiryCard project={p} agent={{name:String(profile?.name||'').trim(),ren:profile?.ren||'',agency:profile?.agency||'',portrait:safeUrl(profile?.portrait)?profile.portrait:'',whatsapp:whatsappNumber(profile)}}/></div></section>}
  {visibility.video&&videoSource(p.videoUrl)&&<FloatingVideo url={p.videoUrl} name={p.name}/>}
  {visibility.related&&related.length>0&&<section className="project-story-section project-story-related" id="keep-exploring"><SectionHeading label="KEEP EXPLORING" title={<>Another place.<br/>Another possibility.</>}><Link className="project-story-pill" href="/projects">All Penang projects <Icon name="arrowUpRight"/></Link></SectionHeading><RelatedProjectGrid projects={related.map(cardProject)}/></section>}
 </ProjectStory>;
}
