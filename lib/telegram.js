import {RequestError} from './revalidation-security.js';
import {phoneE164,isValidFor} from './phone.js';
export function enquiryPayload(body,now=new Date()){
 if(!body||!['enquiry','viewing'].includes(body.kind)||typeof body.projectId!=='string'||! /^[\w-]{1,128}$/.test(body.projectId))throw new RequestError(400,'Choose a valid project.');
 const name=typeof body.name==='string'?body.name.trim():'';
 const note=typeof body.note==='string'?body.note.trim():'';
 const email=typeof body.email==='string'?body.email.trim():'';
 if(email&&(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))throw new RequestError(400,'Enter a valid email address.');
 if(!body.phone||typeof body.phone!=='object'||typeof body.phone.number!=='string'||typeof body.phone.country!=='string'||!isValidFor(body.phone.country,body.phone.number))throw new RequestError(400,'Enter a valid phone number.');
 const phone=phoneE164(body.phone);
 if(!name||name.length>100||!phone||note.length>1500)throw new RequestError(400,'Enter your name and a valid phone number.');
 const date=body.date||'',time=body.time||'';
 if(body.kind==='viewing'){
  const stamp=Date.parse(`${date}T${time}:00+08:00`),minutes=Number(time.slice(0,2))*60+Number(time.slice(3));
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||!Number.isFinite(stamp)||new Date(stamp+8*3600000).toISOString().slice(0,10)!==date||minutes<540||minutes>1110||stamp<now.getTime()+3600000)throw new RequestError(400,'Choose a viewing time at least one hour ahead, between 9:00 am and 6:30 pm.');
 }
 return {kind:body.kind,projectId:body.projectId,name,phone,email,note,date:body.kind==='viewing'?date:'',time:body.kind==='viewing'?time:''};
}
export function telegramMessage(data,project){
 return [data.kind==='viewing'?'New viewing request':'New project enquiry',`Project: ${project.name}`,`Project ID: ${data.projectId}`,`Name: ${data.name}`,`Phone: ${data.phone}`,data.email&&`Email: ${data.email}`,data.date&&`Preferred viewing: ${data.date} at ${data.time} (Malaysia GMT+8)`,data.note&&`Message: ${data.note}`].filter(Boolean).join('\n');
}
export async function sendTelegram(settings,text,send=fetch){
 try{
  const response=await send(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:settings.chat_id,text}),cache:'no-store',signal:AbortSignal.timeout(10000)});
  const result=await response.json();
  if(!response.ok||result.ok!==true)throw Error();
 }catch{throw new RequestError(502,'Could not send your request. Please try again or contact us on WhatsApp.');}
}
