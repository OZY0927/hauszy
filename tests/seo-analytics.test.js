import test from 'node:test';
import assert from 'node:assert/strict';
import {aboutStructuredData,getSiteUrl,homeStructuredData,pageMetadata,projectStructuredData,serializeJsonLd,toolStructuredData} from '../lib/seo.js';
import {analyticsPage} from '../lib/analytics.js';
import {publicationHold,isPublicProject} from '../lib/publication.js';
import {buildProject} from '../lib/project-editor.js';
test('canonical metadata uses the configured origin and project paths, structured data matches visible facts',()=>{
 const previous=process.env.NEXT_PUBLIC_SITE_URL;process.env.NEXT_PUBLIC_SITE_URL='https://hauszy.example';
 try{assert.equal(getSiteUrl(),'https://hauszy.example');assert.equal(pageMetadata('Test','Description','/about/').alternates.canonical,'https://hauszy.example/about/');const data=projectStructuredData({id:'id',name:'Project',location:'Penang',latitude:5,longitude:100});assert.equal(data['@graph'][0].mainEntity.geo.latitude,5);assert.equal(data['@graph'][1].itemListElement[2].item,'https://hauszy.example/projects/id/');assert.ok(!serializeJsonLd({name:'</script><script>alert(1)</script>'}).includes('<'));process.env.NEXT_PUBLIC_SITE_URL='https://hauszy.example/path';assert.throws(getSiteUrl,/origin/);}finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=previous;}
});
test('analytics allowlists public paths and excludes admin, arbitrary paths and query strings',()=>{
 assert.equal(analyticsPage('/admin/','https://hauszy.example'),null);assert.equal(analyticsPage('/api/revalidate/','https://hauszy.example'),null);assert.equal(analyticsPage('/someone@example.com/','https://hauszy.example'),null);assert.equal(analyticsPage('/projects/id/','https://hauszy.example').page_title,'Project details');assert.equal(analyticsPage('/tools/loan-calculator/?income=2000','https://hauszy.example'),null);assert.equal(analyticsPage('/tools/loan-calculator/','https://hauszy.example').page_referrer,'');
});
test('Hauszy uses its verified origin on Vercel production when the site URL is missing',()=>{
 const previousUrl=process.env.NEXT_PUBLIC_SITE_URL,previousVercelEnv=process.env.VERCEL_ENV;
 try{
  delete process.env.NEXT_PUBLIC_SITE_URL;
  process.env.VERCEL_ENV='production';
  assert.equal(getSiteUrl(),'https://www.hauszy.com');
  assert.equal(pageMetadata('Projects','Penang listings','/projects/').alternates.canonical,'https://www.hauszy.com/projects/');
  process.env.VERCEL_ENV='preview';
  assert.equal(getSiteUrl(),null);
 }finally{
  if(previousUrl===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=previousUrl;
  if(previousVercelEnv===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=previousVercelEnv;
 }
});
test('home, profile and tool markup share the site identity and only use supplied profile facts',()=>{
 const previous=process.env.NEXT_PUBLIC_SITE_URL;
 process.env.NEXT_PUBLIC_SITE_URL='https://hauszy.example';
 try{
  const site=homeStructuredData('Hauszy Penang','Browse Penang property projects.')['@graph'][0];
  assert.equal(site['@id'],'https://hauszy.example/#website');
  assert.equal(aboutStructuredData({name:''}),null);
  const about=aboutStructuredData({name:'Public agent',portrait:'/media/portrait.webp',agency:'Public agency',ren:'REN 12345'});
  assert.equal(about.isPartOf['@id'],site['@id']);
  assert.equal(about.mainEntity.image,'https://hauszy.example/media/portrait.webp');
  assert.equal(about.mainEntity.identifier.value,'REN 12345');
  assert.equal(aboutStructuredData({name:'Public agent'}).mainEntity.worksFor,undefined);
  const tool=toolStructuredData(pageMetadata('Loan estimator','Estimate repayments.','/tools/loan-calculator/'));
  assert.equal(tool.isPartOf['@id'],site['@id']);
  assert.equal(tool.breadcrumb.itemListElement[1].item,'https://hauszy.example/tools/loan-calculator/');
 }finally{
  if(previous===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=previous;
 }
});
test('explicit archive instructions prevent publishing and public rendering without blocking ordinary qualifications',()=>{
 const blocked={name:'Project',location:'Penang',status:'Published',sinkingFund:'Developerapprovalrequired;retainarchived.'};assert.ok(publicationHold(blocked));assert.equal(isPublicProject(blocked),false);assert.throws(()=>buildProject(blocked,[],[],'id'),/archived/);assert.equal(isPublicProject({status:'Published',sinkingFund:'Returns are not guaranteed.'}),true);assert.equal(isPublicProject({status:'Archived'}),false);
});
