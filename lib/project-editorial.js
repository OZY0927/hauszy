import {isSafeHttpsUrl} from './secure-url.js';
import {hasProjectInfo} from './project-visibility.js';
import {unitRange} from './project.js';

export const editorialFields=[
 ['publicSummary','Public project summary','textarea'],
 ['officialSourceUrl','Official project or brochure URL','url'],
 ['progressSourceUrl','Construction update URL','url'],
 ['sourcesCheckedOn','Sources checked on','date'],
];

const starterContent={
 '1f0f04ab-2fe3-4c22-8916-bb7cf813c039':{
  publicSummary:'Seiras Residences is a freehold serviced apartment development by Paramount Property in Utropolis Batu Kawan. The two published layouts are both 1,033 sq ft. Type A is dual-key and Type B is triple-key. Paramount reported that Seiras topped out on 22 October 2026.',
  officialSourceUrl:'https://paramountproperty.my/developments/utropolis-batu-kawan/seiras-residences/',
  progressSourceUrl:'https://paramountproperty.my/paramount-property-marks-topping-out-of-seiras-at-utropolis-batu-kawan/',
 },
 'a1aa9beb-4209-41f4-979b-c3583b595736':{
  publicSummary:'Alton Skyvillas is a freehold condominium by Dutamas Permai in Jelutong. Its published plans include a 1,132 sq ft Type A with three bedrooms and two bathrooms and a 1,658 sq ft Type B1 with three bedrooms and five bathrooms.',
  officialSourceUrl:'https://hims.kpkt.gov.my/files/14300/P45/P45-20241016-00013520/IKLAN_BROSUR_01.pdf',
 },
 '05da735a-f2db-448b-83ad-350c7aa325bc':{
  publicSummary:'Iconic Harmony is a freehold mixed development by Iconic Maison in Alma, Bukit Mertajam. The published residential layout is 900 sq ft with three bedrooms and two bathrooms. The development also includes commercial shop lots.',
  officialSourceUrl:'https://iconicharmony.com.my/',
 },
};

export function projectEditorialFields(project={}){
 const starter=starterContent[project.id];
 return Object.fromEntries(editorialFields.map(([key])=>[
  key,Object.hasOwn(project,key)?project[key]??'':key==='sourcesCheckedOn'&&starter?'2026-11-20':starter?.[key]??'',
 ]));
}

export function isSourceDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T00:00:00Z');
 return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value;
}

export function projectEditorial(project,visibility){
 const info=projectEditorialFields(project);
 const starter=starterContent[project.id];
 const isStarter=starter&&info.publicSummary===starter.publicSummary;
 const isStarterVisible=visibility.details&&visibility.units.length&&
  [project.location,project.type,project.developer,project.tag,project.size,project.beds,project.baths].every(hasProjectInfo)&&
  (!starter?.progressSourceUrl||hasProjectInfo(project.construction));
 const location=hasProjectInfo(project.location)?` in ${project.location}`:'';
 const tenure=visibility.details&&/^(freehold|leasehold)$/i.test(project.tag)?project.tag.toLowerCase()+' ':'';
 const type=tenure+(hasProjectInfo(project.type)&&project.type!=='Property'?project.type.toLowerCase():'property project');
 const developer=visibility.details&&hasProjectInfo(project.developer)?` by ${project.developer}`:'';
 const sizes=unitRange(visibility.units,'size',' sq ft');
 const layouts=sizes?(sizes.includes('–')?` Listed built-up sizes span ${sizes}.`:` The listed built-up size is ${sizes}.`):'';
 const summary=typeof info.publicSummary==='string'&&info.publicSummary.trim()&&(!isStarter||isStarterVisible)
  ?info.publicSummary.trim():`${project.name} is ${/^[aeiou]/i.test(type)?'an':'a'} ${type}${developer}${location}.${layouts}`;
 const sources=[
  ['Official project details',info.officialSourceUrl],
  ['Construction update',info.progressSourceUrl],
 ].filter(([,url])=>isSafeHttpsUrl(url));
 return {summary,sources,checkedOn:sources.length&&isSourceDate(info.sourcesCheckedOn)?info.sourcesCheckedOn:null};
}
