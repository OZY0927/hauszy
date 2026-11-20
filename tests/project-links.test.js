import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyProjectSlugs} from '../lib/legacy-project-slugs.js';
import {canonicalGuideProjectHref,isAvailableProjectSlug,isProjectSlug,projectHref,projectSlugCandidate} from '../lib/project-links.js';
import {catalogueStructuredData,projectStructuredData} from '../lib/seo.js';

const seiras='1f0f04ab-2fe3-4c22-8916-bb7cf813c039';

test('public project URLs stay stable when the listing name or area changes',()=>{
 const project={id:seiras,name:'Renamed Project',location:'Different Area'};
 const slugs=Object.values(legacyProjectSlugs);
 assert.ok(slugs.every(isProjectSlug));
 assert.equal(new Set(slugs).size,slugs.length);
 assert.equal(projectHref(project),'/projects/seiras-residences-batu-kawan/');
 assert.equal(isAvailableProjectSlug(legacyProjectSlugs[seiras]),false);
 assert.equal(projectHref({id:'new-id',publicSlug:'new-name-penang',name:'Changed Name'}),'/projects/new-name-penang/');
 assert.equal(projectHref({id:'new-id',publicSlug:legacyProjectSlugs[seiras]}),'/projects/new-id/');
});

test('slug candidates retain name and location, respect hidden data, and support collisions',()=>{
 assert.equal(projectSlugCandidate({name:'Alila²',location:'Tanjung Bungah'}),'alila2-tanjung-bungah');
 assert.equal(projectSlugCandidate({name:'A & B in Teluk Kumbar',location:'Teluk Kumbar'},2),'a-and-b-in-teluk-kumbar-2');
 assert.equal(projectSlugCandidate({name:'New Homes',location:'Secret Area',fieldVisibility:{location:false}}),'new-homes');
 assert.equal(projectSlugCandidate({name:'Browse'}),'project-browse');
 assert.ok(isProjectSlug(projectSlugCandidate({name:'long name '.repeat(100)},12)));
});

test('guide links and project SEO markup resolve to the canonical route',()=>{
 const expected='/projects/seiras-residences-batu-kawan/';
 assert.equal(canonicalGuideProjectHref(`/projects/${seiras}/?utm_source=guide#units`),expected+'?utm_source=guide#units');
 assert.equal(canonicalGuideProjectHref(`https://example.org/projects/${seiras}/`),`https://example.org/projects/${seiras}/`);
 const previous=process.env.NEXT_PUBLIC_SITE_URL;
 process.env.NEXT_PUBLIC_SITE_URL='https://hauszy.example';
 try{
  const project={id:seiras,name:'Seiras Residences',location:'Batu Kawan'};
  const url='https://hauszy.example'+expected;
  const [page,breadcrumb]=projectStructuredData(project)['@graph'];
  assert.equal(page.url,url);
  assert.equal(breadcrumb.itemListElement[2].item,url);
  const list=catalogueStructuredData('/projects/',[project],0);
  assert.equal(list.mainEntity.itemListElement[0].url,url);
 }finally{
  if(previous===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL=previous;
 }
});
