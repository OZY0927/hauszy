import test from 'node:test';
import assert from 'node:assert/strict';
import {guideContent,guideHref,guideRecords,publishedGuides,suggestGuideSlug} from '../lib/guides.js';
import {STARTER_GUIDES} from '../lib/starter-guides.js';
import {validateUploadRequest} from '../lib/storage-upload.js';

test('draft edits stay private while published and withdrawn guides update the public collection',()=>{
 const original=STARTER_GUIDES[0],slug=original.slug;
 const current={...original,isPublished:true,revision:0};
 const form={...original,title:'A revised guide'};
 const now='2026-11-21T03:00:00.000Z';
 const {draft,publication}=guideRecords({slug,form,current,action:'draft',now});
 assert.equal(publication,null);
 assert.equal(draft.isPublished,true);
 assert.equal(draft.hasDraftChanges,true);
 assert.equal(draft.revision,1);
 assert.equal(publishedGuides(STARTER_GUIDES,[]).find(item=>item.slug===slug).title,original.title);
 const published=guideRecords({slug,form,current:draft,action:'publish',now});
 assert.equal(published.publication.publishedAt,original.publishedAt);
 assert.equal(published.publication.title,form.title);
 assert.equal(published.publication.revision,undefined);
 assert.equal(published.draft.hasDraftChanges,false);
 const withdrawn=guideRecords({slug,current:published.draft,action:'withdraw',now});
 assert.deepEqual(withdrawn.publication,{status:'Withdrawn'});
 assert.equal(withdrawn.draft.body,form.body);
 assert.equal(publishedGuides(STARTER_GUIDES,[{slug,...withdrawn.publication}]).some(item=>item.slug===slug),false);
});

test('article links and cover uploads accept Hauszy paths and safe URLs',()=>{
 assert.equal(suggestGuideSlug('  First home – Penang? '),'first-home-penang');
 assert.equal(guideHref('/tools/upfront-cash-calculator/'),'/tools/upfront-cash-calculator/');
 assert.equal(guideHref('https://example.com/guide'), 'https://example.com/guide');
 for(const url of ['javascript:alert(1)','//example.com','/\\example.com','data:text/html,hello'])assert.equal(guideHref(url),'');
 const guide=STARTER_GUIDES[0];
 assert.throws(()=>guideContent({...guide,coverAlt:''},true),/Describe the cover/);
 assert.throws(()=>guideContent({...guide,sources:[{label:'One',url:'https://example.com',checkedOn:'2026-02-29'}]},true),/valid source check date/);
 assert.equal(validateUploadRequest({folder:'guides/first-home-penang',contentType:'image/webp',size:128}).folder,'guides/first-home-penang');
 assert.throws(()=>validateUploadRequest({folder:'guides/../profile',contentType:'image/webp',size:128}),/valid project, guide or profile/);
});
