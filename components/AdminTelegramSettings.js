'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';
export default function AdminTelegramSettings({user}){
 const [token,setToken]=useState(''),[chatId,setChatId]=useState(''),[enabled,setEnabled]=useState(false),[configured,setConfigured]=useState(false),[busy,setBusy]=useState(true),[status,setStatus]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{let active=true;(async()=>{try{
  const response=await fetch('/api/admin/telegram/',{headers:{Authorization:'Bearer '+await user.getIdToken()}}),data=await response.json();
  if(!response.ok)throw Error(data.error);
  if(active){setConfigured(data.configured);setChatId(data.chatId);setEnabled(data.enabled);setReady(true)}
 }catch(error){if(active)setStatus(error.message)}finally{if(active)setBusy(false)}})();return()=>{active=false}},[user]);
 async function save(event){event.preventDefault();setBusy(true);setStatus('');try{
  const response=await fetch('/api/admin/telegram/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify({token,chatId,enabled})}),data=await response.json();
  if(!response.ok)throw Error(data.error);
  setToken('');setConfigured(true);setStatus('Telegram settings saved.');
 }catch(error){setStatus(error.message)}finally{setBusy(false)}}
 return <form className="st-card" onSubmit={save}><div className="st-card-head"><div><h3><Icon name="message"/>Telegram enquiries</h3><p>Receive project enquiries and viewing requests in your Telegram chat.</p></div></div><div className="st-card-body">
 <p className="st-note">Create a bot with <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a>, then start a conversation with your bot or add it to your group. Enter that destination’s numeric chat ID below.</p>
 <label className="st-field">Bot token<input type="password" autoComplete="new-password" value={token} onChange={event=>setToken(event.target.value)} placeholder={configured?'Token saved — leave blank to keep it':'Paste bot token'} required={!configured} maxLength={128} disabled={busy||!ready}/></label>
 <label className="st-field">Destination chat ID<input value={chatId} onChange={event=>setChatId(event.target.value)} placeholder="e.g. -1001234567890" required maxLength={21} disabled={busy||!ready}/></label>
 <label className="st-field"><span><input type="checkbox" checked={enabled} onChange={event=>setEnabled(event.target.checked)} disabled={busy||!ready}/> Enable Telegram delivery</span></label>
 <button className="st-btn primary" disabled={busy||!ready}>{busy?'Loading…':'Save Telegram settings'}</button><p className="st-status" role="status">{status}</p>
 </div></form>;
}
