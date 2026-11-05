import {uploadSupabasePhoto} from '../lib/supabase-upload-client.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {authorizeImageUpload,validateUploadRequest,MAX_IMAGE_BYTES} from '../lib/storage-upload.js';
import {supabaseOrigin} from '../lib/supabase-config.js';
import {isOptimizedImage,hideStorageUrls,mediaSource} from '../lib/media.js';
import {safeUrl} from '../lib/project.js';
import {securityHeaders} from '../lib/security-headers.js';
const valid={folder:'projects/project-id',contentType:'image/webp',size:1234};
test('only image metadata and valid project/profile folders can request uploads',()=>{
 assert.equal(validateUploadRequest(valid),valid);assert.doesNotThrow(()=>validateUploadRequest({...valid,folder:'profile',size:MAX_IMAGE_BYTES}));
 for(const data of [null,[],{...valid,folder:'projects/../profile'},{...valid,folder:'other'},{...valid,folder:'projects/id/extra'},{...valid,contentType:'image/svg+xml'},{...valid,contentType:'__proto__'},{...valid,size:0},{...valid,size:MAX_IMAGE_BYTES+1},{...valid,size:'1234'},{...valid,bucket:'someone-else'}])assert.throws(()=>validateUploadRequest(data),error=>error.status===400);
});
test('signing uses random server-selected names, no overwrite, and exposes no secret',async()=>{
 const calls=[];
 const storage={
  createSignedUploadUrl:async(path,options)=>{calls.push({path,options});return {data:{token:'signed-token'}}},
  getPublicUrl:path=>({data:{publicUrl:`https://project.supabase.co/storage/v1/object/public/website-images/${path}`}})
 };
 const client={storage:{from:bucket=>{assert.equal(bucket,'website-images');return storage}}};
 const result=await authorizeImageUpload(valid,{bucket:'website-images',uuid:()=> 'random-id',client});
 assert.deepEqual(calls,[{path:'projects/project-id/random-id.webp',options:{upsert:false}}]);assert.equal(result.token,'signed-token');assert.ok(result.publicUrl.endsWith('/projects/project-id/random-id.webp'));assert.deepEqual(Object.keys(result).sort(),['bucket','path','publicUrl','token']);
});
test('Supabase failures never become successful upload authorizations',async()=>{
 for(const response of [{error:{message:'sensitive upstream detail'}},{data:{}}])await assert.rejects(authorizeImageUpload(valid,{bucket:'website-images',client:{storage:{from:()=>({createSignedUploadUrl:async()=>response})}}}),error=>error.status===502&&!error.message.includes('sensitive upstream detail'));
});
test('storage SDK signed-upload contract is compatible with the server authorization helper',async()=>{
 const calls=[];const client=createClient('https://project.supabase.co','sb_secret_test-only',{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:async(url,options)=>{calls.push({url:String(url),method:options.method,body:JSON.parse(options.body)});return Response.json({url:'/object/upload/sign/website-images/profile/id.png?token=signed-token'})}}});
 const result=await authorizeImageUpload({folder:'profile',contentType:'image/png',size:500},{client,bucket:'website-images',uuid:()=> 'id'});
 assert.equal(calls[0].method,'POST');assert.ok(calls[0].url.endsWith('/storage/v1/object/upload/sign/website-images/profile/id.png'));assert.equal(result.token,'signed-token');assert.equal(result.publicUrl,'https://project.supabase.co/storage/v1/object/public/website-images/profile/id.png');
});
test('Supabase origin is allowed in the admin CSP only, and public pages use /media/ images',()=>{
 const previous=process.env.NEXT_PUBLIC_SUPABASE_URL;process.env.NEXT_PUBLIC_SUPABASE_URL='https://project.supabase.co';
 try{assert.equal(supabaseOrigin(),'https://project.supabase.co');assert.equal(isOptimizedImage('/media/website-images/profile/id.webp'),false);assert.equal(isOptimizedImage('https://project.supabase.co/storage/v1/object/public/website-images/profile/id.webp'),false);assert.equal(isOptimizedImage('https://firebasestorage.googleapis.com/v0/b/hauszy.firebasestorage.app/o/photo'),true);const csp=nonce=>securityHeaders(true,nonce).find(h=>h.key==='Content-Security-Policy').value;assert.ok(csp('abc').includes(' https://project.supabase.co'));assert.ok(!csp().includes('supabase.co'));assert.ok(!csp('abc').includes('https://*.supabase.co'));for(const url of ['http://project.supabase.co','https://user:pass@project.supabase.co','https://project.supabase.co/path','https://project.supabase.co/?key=secret'])assert.throws(()=>supabaseOrigin(url),/HTTPS Supabase project origin/);}finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previous;}
});

test('browser upload sends Firebase credentials only to the local signer and persists only a successful public URL',async()=>{
 const image=new Blob(['test-image'],{type:'image/png'}),calls=[];
 const result=await uploadSupabasePhoto(image,'profile',{getIdToken:async()=> 'firebase-id-token'},{
  request:async(url,options)=>{assert.equal(url,'/api/uploads/sign/');assert.equal(options.headers.Authorization,'Bearer firebase-id-token');assert.deepEqual(JSON.parse(options.body),{folder:'profile',contentType:'image/png',size:image.size});return Response.json({bucket:'website-images',path:'profile/id.png',token:'signed-token',publicUrl:'https://project.supabase.co/photo.png'})},
  client:{storage:{from:bucket=>({uploadToSignedUrl:async(path,token,body,options)=>{calls.push({bucket,path,token,body,options});return {error:null}}})}}
 });
 assert.equal(result,'https://project.supabase.co/photo.png');assert.equal(calls[0].token,'signed-token');assert.equal(calls[0].body,image);assert.equal(calls[0].options.contentType,'image/png');
});
test('authorization and binary upload failures cannot report a saved image URL',async()=>{
 const image=new Blob(['image'],{type:'image/png'}),user={getIdToken:async()=> 'token'};
 await assert.rejects(uploadSupabasePhoto(image,'profile',user,{request:async()=>Response.json({error:'Administrator access required.'},{status:403}),client:{storage:{from:()=>{throw Error('must not upload')}}}}),/Administrator access/);
 await assert.rejects(uploadSupabasePhoto(image,'profile',user,{request:async()=>Response.json({bucket:'website-images',path:'profile/id.png',token:'signed-token',publicUrl:'https://project.supabase.co/photo.png'}),client:{storage:{from:()=>({uploadToSignedUrl:async()=>({error:{message:'bucket restriction'}})})}}}),/Image upload failed/);
});
test('storage links become /media/ paths, and /media/ only maps back to images in the bucket',()=>{
 const origin='https://project.supabase.co',full=`${origin}/storage/v1/object/public/hauszy-project/projects/p1/a.webp`;
 const hidden=hideStorageUrls({images:[full,'https://example.com/x.jpg'],units:[{floorPlanUrl:full}],name:'A',price:1},origin);
 assert.deepEqual(hidden.images,['/media/hauszy-project/projects/p1/a.webp','https://example.com/x.jpg']);assert.equal(hidden.units[0].floorPlanUrl,'/media/hauszy-project/projects/p1/a.webp');assert.equal(hidden.price,1);assert.ok(!JSON.stringify(hidden).includes('supabase'));
 assert.equal(safeUrl('/media/hauszy-project/projects/p1/a.webp'),true);assert.equal(safeUrl('/media/../secret.jpg'),false);
 assert.equal(mediaSource(['hauszy-project','projects','p1','a.webp'],origin,'hauszy-project'),full);
 for(const path of [['other-bucket','a.jpg'],['hauszy-project','..','a.jpg'],['hauszy-project','a.html'],['hauszy-project'],undefined])assert.equal(mediaSource(path,origin,'hauszy-project'),null);
 assert.equal(mediaSource(['hauszy-project','a.jpg'],null,'hauszy-project'),null);
});
