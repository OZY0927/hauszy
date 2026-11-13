import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoadingIconPreloader} from '../lib/loading-icon-preload.js';
import {PROJECT_LOADING_IMAGES} from '../lib/project-loading-icons.js';

test('warms only the requested icon once and waits for decoding before selection',async()=>{
 const requests=[];let decoded;
 class ImageStub{constructor(){requests.push(this)}decode(){return new Promise(resolve=>{decoded=resolve})}}
 const preload=createLoadingIconPreloader(ImageStub);
 const first=preload('komtar');
 assert.equal(preload('komtar'),first);
 assert.equal(requests.length,1);
 assert.equal(requests[0].fetchPriority,'low');
 assert.equal(requests[0].src,PROJECT_LOADING_IMAGES.komtar);
 let ready=false;first.then(value=>{ready=value});
 requests[0].onload();await Promise.resolve();assert.equal(ready,false);
 decoded();assert.equal(await first,true);
 assert.equal(requests[0].onload,null);
});

test('failed or unknown icons never become ready and do not trigger other downloads',async()=>{
 const requests=[];
 class ImageStub{constructor(){requests.push(this)}}
 const preload=createLoadingIconPreloader(ImageStub);
 assert.equal(await preload('unknown'),false);
 assert.equal(requests.length,0);
 const failed=preload('bridge');requests[0].onerror();
 assert.equal(await failed,false);assert.equal(requests.length,1);
 assert.equal(requests[0].onerror,null);
});

test('decode failure keeps the already displayed fallback icon',async()=>{
 const requests=[];
 class ImageStub{constructor(){requests.push(this)}decode(){return Promise.reject(new Error('decode failed'))}}
 const preload=createLoadingIconPreloader(ImageStub);
 const result=preload('flag');requests[0].onload();
 assert.equal(await result,false);
});
