import {uploadSupabasePhoto} from '../lib/supabase-upload-client.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {authorizeImageUpload,validateUploadRequest,MAX_IMAGE_BYTES} from '../lib/storage-upload.js';
import {supabaseOrigin,supabaseImagePattern,isOptimizedProjectImage} from '../lib/supabase-config.js';
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
test('configured Supabase origin is narrowly allowed in CSP and image optimization while legacy images work',()=>{
 const previous=process.env.NEXT_PUBLIC_SUPABASE_URL;process.env.NEXT_PUBLIC_SUPABASE_URL='https://project.supabase.co';
 try{assert.equal(supabaseOrigin(),'https://project.supabase.co');assert.equal(supabaseImagePattern().hostname,'project.supabase.co');assert.equal(isOptimizedProjectImage('https://project.supabase.co/storage/v1/object/public/website-images/profile/id.webp'),true);assert.equal(isOptimizedProjectImage('https://other.supabase.co/storage/v1/object/public/x'),false);assert.equal(isOptimizedProjectImage('https://firebasestorage.googleapis.com/v0/b/hauszy.firebasestorage.app/o/photo'),true);const csp=securityHeaders(true).find(h=>h.key==='Content-Security-Policy').value;assert.ok(csp.includes(' https://project.supabase.co'));assert.ok(!csp.includes('https://*.supabase.co'));for(const url of ['http://project.supabase.co','https://user:pass@project.supabase.co','https://project.supabase.co/path','https://project.supabase.co/?key=secret'])assert.throws(()=>supabaseOrigin(url),/HTTPS Supabase project origin/);}finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previous;}
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
