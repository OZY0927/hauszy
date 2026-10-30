import {phoneE164} from './phone';
// The agent's WhatsApp number as digits with country code ("60129846080"): the WhatsApp field, else the phone field, else ''.
export function whatsappNumber(profile){const p=profile||{};return (phoneE164(p.whatsapp)||phoneE164(p.phone)).slice(1)}
const bold=text=>`*${String(text).replace(/\*/g,'').trim()}*`,firstName=name=>String(name||'').trim().split(/\s+/)[0]||'';
const viewingDate=value=>{const t=Date.parse(value+'T00:00:00+08:00');return Number.isFinite(t)?new Date(t).toLocaleDateString('en-MY',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}):value};
// Message text for the three project buttons. kind: 'interest' (WhatsApp now), 'enquiry' or 'viewing'.
export function projectMessage({kind='interest',agent='',project,name,phone,date,time,note,url}){const hi=`Hi${firstName(agent)?' '+firstName(agent):''}, `;
  const opening=kind==='viewing'?`${hi}I'd like to book a viewing for ${bold(project)}.`:kind==='enquiry'?`${hi}I'd like to enquire about ${bold(project)}.`:`${hi}I'm interested in ${bold(project)}. Please contact me, thanks!`;
  const details=[name&&`Name: ${name}`,phone&&`Phone: ${phone}`,date&&`Preferred date: ${viewingDate(date)}`,time&&`Preferred time: ${time}`,note&&`Message: ${note}`].filter(Boolean);
  return [opening,details.length?'\n'+details.join('\n'):'',url?'\n'+url:''].filter(Boolean).join('\n')}
export const whatsappLink=(number,text)=>`https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(text)}`;
