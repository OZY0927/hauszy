import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectImagePreloader} from '../lib/project-image-preload.js';

test('navigation warms at most four unique previews, prioritizes the hero, and deduplicates repeat visits',()=>{
 const requests=[];
 class ImageStub{constructor(){requests.push(this)}}
 const preload=createProjectImagePreloader(ImageStub);
 const images=Array.from({length:6},(_,i)=>`/media/property/projects/photo${i}.jpg`);
 preload({images:[images[0],...images]});
 assert.equal(requests.length,4);
 assert.deepEqual(requests.map(image=>image.src),images.slice(0,4).map(src=>src.replace('.jpg','-preview.webp')));
 assert.equal(requests[0].fetchPriority,'high');
 assert.ok(requests.slice(1).every(image=>image.fetchPriority==='low'));
 preload({images});
 assert.equal(requests.length,4);
});

test('missing previews fall back once to the original and empty projects cause no requests',()=>{
 const requests=[];
 class ImageStub{constructor(){requests.push(this)}}
 const preload=createProjectImagePreloader(ImageStub);
 preload({images:[]});preload({});
 assert.equal(requests.length,0);
 const original='/media/property/projects/older.jpg';
 preload({images:[original]});
 requests[0].onerror();
 assert.equal(requests[0].src,original);
 assert.equal(requests[0].onerror,null);
});

test('listing preview manifest warms additional photos without changing the cover image contract',()=>{
 const requests=[];
 class ImageStub{constructor(){requests.push(this)}}
 const preload=createProjectImagePreloader(ImageStub);
 preload({images:['/cover.jpg'],previewImages:['/one.jpg','/two.jpg']});
 assert.deepEqual(requests.map(image=>image.src),['/one.jpg','/two.jpg']);
});
