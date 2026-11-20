import {ContainerScroll} from '../../../components/ui/container-scroll-animation';
import HighlightNumber from '../../../components/HighlightNumber';
import ProjectFacilities from '../../../components/ProjectFacilities';
import {pageMetadata,projectStructuredData} from '../../../lib/seo';
import JsonLd from '../../../components/JsonLd';
import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import {getProfile,getPublishedGuides,getPublishedProjectForRoute,getPublishedProjects} from '../../../lib/firestore-server';
import {projectHref,projectUrlSegment} from '../../../lib/project-links';
import {guidePath,guideProjectIds} from '../../../lib/guides';
import {whatsappNumber,whatsappLink,projectMessage} from '../../../lib/whatsapp';
import {hasProjectInfo,visibleFacts,projectSections,applyFieldVisibility} from '../../../lib/project-visibility';
import {sinkingFundText,maintenanceText,unitCountRange,safeUrl,startingPrice,priceText,wholeMoney,cardProject,listingName,publicImages} from '../../../lib/project';
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
import {fieldVisibility} from '../../../lib/project-sections';
import {projectEditorial} from '../../../lib/project-editorial';

export async function generateStaticParams(){return []}
function projectDescription(p){
 const location=hasProjectInfo(p.location)?` in ${p.location}`:'';
 const facts=[
  p.type,
  p.tag,
  hasProjectInfo(p.size)?`${p.size} sqft`:null,
  priceText(p,wholeMoney),
 ].filter(hasProjectInfo);
 return `${p.name}${location}. ${facts.length?facts.join(' · ')+'.':'Explore the project details.'}`;
}

export async function generateMetadata({params}){
 const {id}=await params;
 const project=await getPublishedProjectForRoute(id);
 if(!project)return {title:'Project unavailable',robots:{index:false,follow:false}};
 const p=applyFieldVisibility({...project,name:listingName(project)});
 const location=hasProjectInfo(p.location)?String(p.location).trim():'';
 const title=location&&!p.name.toLowerCase().includes(location.toLowerCase())?`${p.name} in ${location}`:p.name;
 return pageMetadata(title,projectDescription(p),projectHref(p),publicImages(p).slice(0,1));
}
function Facts({rows}){return <dl className="property-facts">{visibleFacts(rows).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
function SectionHeading({label,title,children}){return <div className="project-story-section-heading"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div>{children&&<div className="project-story-section-note">{children}</div>}</div>}

export default async function Project({params}){
 const {id:segment}=await params;
 const [project,all,profile,guides]=await Promise.all([getPublishedProjectForRoute(segment),getPublishedProjects().catch(()=>null),getProfile().catch(()=>null),getPublishedGuides().catch(()=>[])]);
 if(!project)notFound();
 if(projectUrlSegment(project)!==segment)permanentRedirect(projectHref(project));
 const id=project.id;
 const p=applyFieldVisibility({...project,name:listingName(project)});
 const visibility=projectSections(p),related=(all||[]).filter(v=>v.id!==id).sort((a,b)=>Number(b.mode===p.mode)-Number(a.mode===p.mode)).slice(0,12);
 const editorial=visibility.overview&&fieldVisibility(project.fieldVisibility).editorial?projectEditorial(p,visibility):null;
 const guide=guides.find(item=>guideProjectIds(item).includes(id));
 const purchaseTool=p.mode==='New launch'&&['Residential','Commercial under HDA'].includes(p.titleType)
  ? ['/tools/upfront-cash-calculator/','Estimate upfront purchase costs']
  : p.titleType==='Residential'?['/tools/loan-calculator/','Estimate monthly loan repayments']:null;
 const sections=[...(visibility.overview||visibility.photos?[['overview','The project']]:[]),...(visibility.photos&&p.images.length?[['project-photos','Gallery']]:[]),...(visibility.details?[['details','Details']]:[]),...(visibility.units.length?[['units','Layouts']]:[]),...(visibility.facilities.length?[['amenities','Facilities']]:[]),...(visibility.location?[['location','Neighbourhood']]:[]),...(visibility.maintenance?[['maintenance','Charges']]:[]),...(visibility.showroom.length?[['showroom','Showroom']]:[])];
 return <ProjectStory key={id} previewImages={[...(visibility.photos?p.images:[]),...visibility.units.flatMap(unit=>unit.floorPlanUrls),...visibility.showroom]}>
  <JsonLd data={projectStructuredData(p,projectDescription(p))}/>
  <ProjectGallery photos={visibility.photos?p.images:[]} name={p.name} hero={{id:p.id,location:hasProjectInfo(p.location)?p.location:null,type:p.type,mode:p.mode,price:startingPrice(p),target:sections[0]?.[0]||(visibility.enquiry?'enquiry':null)}}/>
  <ProjectSectionNav sections={sections} enquiry={visibility.enquiry}/>

  {(visibility.overview||visibility.photos)&&<ProjectScrollIntroduction photos={visibility.photos?p.images:[]}>
   {visibility.overview&&<div className={`project-story-intro-main${editorial?' has-project-summary':''}`}>
    <div className="eyebrow">THE PROJECT</div>
    <h2>{hasProjectInfo(p.title)&&p.title.trim().toLowerCase()!==p.name.trim().toLowerCase()?p.title:<>Project<br/>overview.</>}</h2>
    {editorial&&<p className="project-summary">{editorial.summary}</p>}
    {(Boolean(editorial?.sources.length)||guide)&&<div className="project-summary-sources">
     <ul aria-label={guide?'Project sources and buyer guide':'Project sources'}>
      {editorial?.sources.map(([label,url])=><li key={label}><a href={url}>{label}</a></li>)}
      {guide&&<li><Link href={guidePath(guide.slug)}>Read the buyer guide</Link></li>}
     </ul>
     {editorial?.checkedOn&&<span>Sources checked <time dateTime={editorial.checkedOn}>{new Date(editorial.checkedOn+'T00:00:00Z').toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time></span>}
    </div>}
    {visibility.enquiry&&<a className="project-story-pill" href="#enquiry">Enquire about this project <Icon name="arrowUpRight"/></a>}
   </div>}
  </ProjectScrollIntroduction>}

  {visibility.photos&&p.images.length>0&&<section className="project-story-section project-story-photography" id="project-photos"><ContainerScroll titleComponent={<SectionHeading label="TAKE A LOOK AROUND" title={<>A first look at<br/>{p.name}.</>}><p>Explore the project, one photo at a time.</p></SectionHeading>}><ProjectGallery photos={p.images} name={p.name}/></ContainerScroll></section>}

  {visibility.overview&&[p.beds,p.baths,p.size,p.tag].some(hasProjectInfo)&&<section className="project-story-highlights" aria-label="Project highlights"><div className="project-story-highlights-inner">{[[unitCountRange(p.units,'bedrooms'),'Bedrooms','bed'],[unitCountRange(p.units,'bathrooms'),'Bathrooms','bath'],[p.size,'Built-up · sqft','ruler'],[p.tag,'Tenure','key']].filter(([v])=>hasProjectInfo(v)).map(([value,label,icon])=><div key={label} data-reveal><Icon name={icon}/><HighlightNumber value={value}/><span>{label}</span></div>)}</div></section>}

  {visibility.details&&<ProjectDetails project={p} purchaseTool={visibility.maintenance?null:purchaseTool}/>}

  {visibility.units.length>0&&<ProjectLayouts units={visibility.units.map(unit=>({...unit,enquiryHref:whatsappNumber(profile)?whatsappLink(whatsappNumber(profile),projectMessage({kind:'enquiry',agent:profile?.name,project:p.name,layout:unit.name||'Unit layout'})):'#enquiry'}))} enquiry={visibility.enquiry}/>}

  {visibility.facilities.length>0&&<section className="project-story-section project-story-facilities" id="amenities"><ProjectFacilities facilities={visibility.facilities}/></section>}

  {visibility.location&&<ProjectNeighbourhood project={{id:p.id,name:p.name,location:p.location,latitude:p.latitude??null,longitude:p.longitude??null}} hasCoordinates={visibility.hasCoordinates} amenities={visibility.nearby}/>}

  {visibility.maintenance&&<section className="project-story-section project-story-charges" id="maintenance">
   <SectionHeading label="ONGOING PROPERTY COSTS" title={<><span className="charges-heading-line">Maintenance</span><span className="charges-heading-line">and sinking fund.</span></>}/>
   <Facts rows={[["Maintenance fee",hasProjectInfo(p.maintenance)?maintenanceText(p):null],["Sinking fund",sinkingFundText(p)]]}/>
  </section>}

  {visibility.showroom.length>0&&<section className="project-story-section project-story-showroom" id="showroom"><SectionHeading label="STEP INSIDE" title={<>Picture the<br/>possibilities.</>}><p>A look inside the showroom.</p></SectionHeading><ShowroomGallery photos={visibility.showroom} name={p.name}/><p className="project-story-fine-print">Showroom units are for illustration only and may include furnishings and finishes not included in the sale.</p></section>}

  {visibility.enquiry&&<section className="project-story-contact"><div className="project-story-section project-story-contact-grid"><div className="project-story-contact-copy" data-reveal><span className="eyebrow">PROJECT ENQUIRIES</span><h2>Ask about<br/>a viewing.</h2><p>Contact Hauszy to confirm the latest price and available units for {p.name}, or request a viewing time.</p><span className="project-story-contact-location"><Icon name="mapPin"/>{hasProjectInfo(p.location)?p.location:'Penang'}</span></div><EnquiryCard project={p} agent={{name:String(profile?.name||'').trim(),ren:profile?.ren||'',agency:profile?.agency||'',portrait:safeUrl(profile?.portrait)?profile.portrait:'',whatsapp:whatsappNumber(profile)}}/></div></section>}
  {visibility.video&&videoSource(p.videoUrl)&&<FloatingVideo url={p.videoUrl} name={p.name}/>}
  {visibility.related&&related.length>0&&<section className="project-story-section project-story-related" id="keep-exploring"><SectionHeading label="KEEP EXPLORING" title={<>Another place.<br/>Another possibility.</>}><Link className="project-story-pill" href="/projects">All Penang projects <Icon name="arrowUpRight"/></Link></SectionHeading><RelatedProjectGrid projects={related.map(cardProject)}/></section>}
 </ProjectStory>;
}
