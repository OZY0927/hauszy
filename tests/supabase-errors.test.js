import test from 'node:test';
import assert from 'node:assert/strict';
import {storageFailureMessage,assertStorageSecretKey} from '../lib/supabase-errors.js';
import {DEFAULT_IMAGE_BUCKET} from '../lib/supabase-config.js';
test('uses the owner-confirmed bucket name and gives actionable missing bucket guidance',()=>{
 assert.equal(DEFAULT_IMAGE_BUCKET,'hauszy-project');
 for(const error of [{code:'NoSuchBucket'},{message:'Bucket not found'}])assert.match(storageFailureMessage(error,DEFAULT_IMAGE_BUCKET),/bucket "hauszy-project".*SUPABASE_STORAGE_BUCKET/);
});
test('rejects a publishable key used as the server key without exposing it',()=>{
 assert.throws(()=>assertStorageSecretKey('sb_publishable_private-test-value'),error=>/publishable key/.test(error.message)&&!error.message.includes('private-test-value'));
 assert.doesNotThrow(()=>assertStorageSecretKey('sb_secret_test-value'));
});
test('classifies credential, access and storage restriction errors',()=>{
 assert.match(storageFailureMessage({code:'InvalidJWT'},'hauszy-project'),/same project/);
 assert.match(storageFailureMessage({status:403},'hauszy-project'),/Do not enable public uploads/);
 assert.match(storageFailureMessage({statusCode:'413'},'hauszy-project'),/file-size limit/);
 assert.match(storageFailureMessage({code:'InvalidMimeType'},'hauszy-project'),/image\/webp/);
 assert.match(storageFailureMessage({name:'TimeoutError'},'hauszy-project'),/could not be reached/);
});
test('does not leak raw errors, credentials or signed URLs into user-visible messages',()=>{
 const secret='sb_secret_NEVER_DISPLAY_THIS',url='https://example.test/?token=PRIVATE';
 for(const code of ['NoSuchBucket','InvalidJWT','AccessDenied','unknown']){const message=storageFailureMessage({code,message:`${secret} ${url}`},'hauszy-project');assert.ok(!message.includes(secret));assert.ok(!message.includes(url));}
});
