'use client';
import {useEffect,useRef} from 'react';
export default function EnquiryConfirmation({delivered=false,direct=false,viewing,project,agent,link,onEdit,onClose}){
 const heading=useRef(null);
 useEffect(()=>{heading.current?.focus()},[]);
 return <section className="enquiry-confirmation" aria-labelledby="enquiry-confirmation-title">
  <div className="enquiry-confirmation-mark" aria-hidden="true"><span/><svg viewBox="0 0 80 80" fill="none"><circle className="confirmation-ring" cx="40" cy="40" r="29"/><path className="confirmation-tick" d="M26 40l10 10 19-21"/></svg></div>
  <div className="eyebrow">YOUR NEXT STEP</div>
  <h2 id="enquiry-confirmation-title" ref={heading} tabIndex={-1}>{delivered?(viewing?'Viewing request sent.':'Enquiry sent.'):direct?'Continue in WhatsApp.':viewing?'Viewing request ready.':'Your enquiry is ready.'}</h2>
  <p className="confirmation-project">{project}</p>
  <p>{delivered?<>Your request has been sent to our property team. We’ll contact you using the phone number you provided.</>:direct?<>Your message is ready for {agent||'your property contact'}. Complete your enquiry in WhatsApp.</>:<>Tap <strong>Send in WhatsApp</strong> to send your {viewing?'viewing request':'enquiry'} to {agent||'the agent'}.</>}</p>
  {viewing&&<p className="fine-print">Your preferred viewing date and time are subject to the agent’s confirmation.</p>}
  {!delivered&&<a className="search-btn" href={link} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>}
  {!delivered&&<p className="fine-print">If WhatsApp didn’t open automatically, use the button above. This website cannot confirm message delivery.</p>}
  <div className="confirmation-actions">{!direct&&!delivered&&<button type="button" onClick={onEdit}>Edit details</button>}<button type="button" onClick={onClose}>Done</button></div>
 </section>;
}
