'use client';
import {useEffect,useState} from 'react';
import {doc,setDoc,serverTimestamp} from 'firebase/firestore';
import {getFirebase} from '../lib/firebase-client';
import {optionGroups} from '../lib/project-options';
import {authErrorMessage} from '../lib/auth-errors';
import Icon from './Icon';
const clean=values=>[...new Set((values||[]).map(v=>v.trim()).filter(Boolean))],same=(a,b)=>JSON.stringify(clean(a))===JSON.stringify(clean(b)),fold=v=>v.trim().toLowerCase();
// Indexes of values that repeat an earlier one, ignoring case and spaces.
const repeats=values=>new Set(values.map((v,i)=>fold(v)&&values.findIndex(w=>fold(w)===fold(v))<i?i:-1).filter(i=>i>=0));
export default function CategoryEditor({options,onSave,ready,error,onRetry}){
 const [saved,setSaved]=useState(options),[draft,setDraft]=useState(options),[active,setActive]=useState(optionGroups[0].key),[entry,setEntry]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState({text:'',tone:''});
 const group=optionGroups.find(g=>g.key===active),values=draft[active]||[],dupes=repeats(values),taken=values.some(v=>fold(v)&&fold(v)===fold(entry)),changed=key=>!same(draft[key],saved[key]),dirty=optionGroups.some(g=>changed(g.key)),locked=busy||!ready;
 useEffect(()=>{if(!dirty)return;const warn=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 const setValues=next=>{setDraft({...draft,[active]:next});setStatus({text:'',tone:''})};
 function add(e){e.preventDefault();const v=entry.trim();if(!v||taken)return;setValues([...values,v]);setEntry('')}
 function move(i,step){const next=[...values];[next[i],next[i+step]]=[next[i+step],next[i]];setValues(next)}
 async function save(){setBusy(true);setStatus({text:'Saving…',tone:''});try{const value=Object.fromEntries(optionGroups.map(({key,label})=>{const list=clean(draft[key]);if(list.some(v=>v.length>80))throw Error(`${label}: keep each value under 80 characters.`);if(repeats(list).size){setActive(key);throw Error(`${label}: remove the repeated value before saving.`)}return [key,list]}));await setDoc(doc(getFirebase().db,'adminSettings','projectOptions'),{options:value,updatedAt:serverTimestamp()});onSave(value);setSaved(value);setDraft(value);setStatus({text:'Saved. Project dropdowns now use these values.',tone:'good'})}catch(e){setStatus({text:e.code?authErrorMessage(e):e.message,tone:'bad'})}finally{setBusy(false)}}
 return <section className="admin-panel">
  <div className="eyebrow">PROJECT DROPDOWNS</div><h2>Categories & options.</h2>
  <p className="admin-lead">Pick a dropdown, then add, rename, reorder or remove its values. The order here is the order shown in the project editor. Existing projects keep their saved values.</p>
  {error?<div className="option-error" role="alert"><p>{error}</p><button type="button" className="outline" onClick={onRetry}><Icon name="refresh"/>Try again</button></div>:<>
  <div className="option-editor">
   <nav className="option-groups" aria-label="Dropdowns">{optionGroups.map(({key,label})=><button key={key} type="button" aria-current={key===active?'true':undefined} onClick={()=>{setActive(key);setEntry('')}}><span>{label}</span><small>{changed(key)&&<i title="Unsaved changes" aria-label="Unsaved changes"/>}{clean(draft[key]).length}</small></button>)}</nav>
   <div className="option-values">
    <div className="option-values-head"><div><h3>{group.label}</h3><p>{clean(values).length} value{clean(values).length===1?'':'s'}</p></div>{group.defaults.length>0&&<button type="button" className="option-link" disabled={locked||same(values,group.defaults)} onClick={()=>setValues(group.defaults)}><Icon name="refresh"/>Reset to defaults</button>}</div>
    <form className="option-add" onSubmit={add}><input value={entry} maxLength={80} placeholder={`Add a new ${group.label.toLowerCase()}`} aria-label={`New ${group.label} value`} disabled={locked} onChange={e=>setEntry(e.target.value)}/><button className="search-btn" disabled={locked||!entry.trim()||taken}><Icon name="plus"/>Add</button></form>
    {taken&&<p className="option-hint">“{entry.trim()}” is already in this list.</p>}
    {!ready?<p className="option-empty">Loading dropdown values…</p>:values.length===0?<p className="option-empty">No values yet. Add the first one above.</p>:<ol className="option-list">{values.map((v,i)=><li key={i} className={dupes.has(i)?'repeat':undefined}>
     <span className="option-index">{i+1}</span>
     <input value={v} maxLength={80} aria-label={`${group.label} value ${i+1}`} aria-invalid={dupes.has(i)||!v.trim()||undefined} disabled={locked} onChange={e=>setValues(values.map((w,j)=>j===i?e.target.value:w))}/>
     <button type="button" title="Move up" aria-label={`Move ${v||'value'} up`} disabled={locked||i===0} onClick={()=>move(i,-1)}><Icon name="arrowUp"/></button>
     <button type="button" title="Move down" aria-label={`Move ${v||'value'} down`} disabled={locked||i===values.length-1} onClick={()=>move(i,1)}><Icon name="arrowDown"/></button>
     <button type="button" className="option-remove" title="Remove" aria-label={`Remove ${v||'value'}`} disabled={locked} onClick={()=>setValues(values.filter((_,j)=>j!==i))}><Icon name="trash"/></button>
     {dupes.has(i)&&<small>Repeats an earlier value</small>}{!v.trim()&&<small>Empty values are dropped on save</small>}
    </li>)}</ol>}
   </div>
  </div>
  <div className={`admin-savebar${dirty?' dirty':''}`}><p className={`admin-status ${status.tone}`} role="status">{status.text||(dirty?'You have unsaved changes.':'All changes saved.')}</p><button type="button" className="outline" disabled={busy||!dirty} onClick={()=>{setDraft(saved);setStatus({text:'',tone:''})}}>Discard</button><button type="button" className="search-btn" disabled={locked||!dirty} onClick={save}><Icon name="save"/>{busy?'Saving…':'Save changes'}</button></div></>}
 </section>;
}
