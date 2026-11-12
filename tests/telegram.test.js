import test from 'node:test';
import assert from 'node:assert/strict';
import {enquiryPayload,telegramMessage,sendTelegram} from '../lib/telegram.js';
const valid={kind:'enquiry',projectId:'project-1',name:' Visitor ',phone:{country:'MY',number:'0129846080'},note:'Question'};
test('enquiry validates contact details and strips client-supplied project text',()=>{
 const data=enquiryPayload({...valid,project:'Fake project'});
 assert.equal(data.name,'Visitor');assert.equal(data.phone,'+60129846080');
 assert.ok(telegramMessage(data,{name:'Actual project'}).includes('Actual project'));
 assert.ok(!telegramMessage(data,{name:'Actual project'}).includes('Fake project'));
 for(const body of [{...valid,name:''},{...valid,phone:null},{...valid,phone:{country:'MY',number:'12'}},{...valid,note:'x'.repeat(1501)},{...valid,kind:'spam'}])assert.throws(()=>enquiryPayload(body));
});
test('viewings accept individual minutes but reject past, invalid dates and out-of-hours times',()=>{
 const now=new Date('2026-11-12T00:00:00Z');
 const body={...valid,kind:'viewing',date:'2026-11-13',time:'10:17'};
 assert.equal(enquiryPayload(body,now).time,'10:17');
 for(const change of [{date:'2026-02-30'},{time:'08:59'},{time:'18:31'},{date:'2026-11-11'},{time:'25:00'}])assert.throws(()=>enquiryPayload({...body,...change},now));
});
test('delivery requires Telegram success, posts plain text and hides remote errors',async()=>{
 const settings={bot_token:'secret',chat_id:'123'};
 await sendTelegram(settings,'Name: <hello>',async(url,options)=>{
  assert.equal(url,'https://api.telegram.org/botsecret/sendMessage');
  const body=JSON.parse(options.body);assert.equal(body.chat_id,'123');assert.equal(body.text,'Name: <hello>');assert.equal(body.parse_mode,undefined);
  return {ok:true,json:async()=>({ok:true})};
 });
 for(const send of [async()=>({ok:false,json:async()=>({ok:false,description:'secret'})}),async()=>{throw Error('secret')}])await assert.rejects(()=>sendTelegram(settings,'text',send),error=>error.status===502&&!error.message.includes('secret'));
});

test('optional enquiry email is validated and included in the Telegram message',()=>{
 const data=enquiryPayload({...valid,email:' visitor@example.com '});
 assert.equal(data.email,'visitor@example.com');
 assert.ok(telegramMessage(data,{name:'Project'}).includes('Email: visitor@example.com'));
 assert.equal(enquiryPayload(valid).email,'');
 assert.throws(()=>enquiryPayload({...valid,email:'invalid-address'}));
});
