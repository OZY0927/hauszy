'use client';
import {useState} from 'react';
import {doc,setDoc,serverTimestamp} from 'firebase/firestore';
import {getFirebase} from '../lib/firebase-client';
import {optionGroups} from '../lib/project-options';
import {authErrorMessage} from '../lib/auth-errors';
export default function CategoryEditor({options,onSave,ready,error}){
 const [draft,setDraft]=useState(options),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 async function save(e){e.preventDefault();setBusy(true);setStatus('Saving…');try{const value=Object.fromEntries(optionGroups.map(({key,label})=>{const values=[...new Set((draft[key]||[]).map(v=>v.trim()).filter(Boolean))];if(values.some(v=>v.length>80))throw Error(`${label}: keep each value under 80 characters.`);return [key,values]}));await setDoc(doc(getFirebase().db,'adminSettings','projectOptions'),{options:value,updatedAt:serverTimestamp()});onSave(value);setDraft(value);setStatus('Saved. Project dropdowns now use these values.')}catch(e){setStatus(e.code?authErrorMessage(e):e.message)}finally{setBusy(false)}}
 return <section className="admin-panel"><div className="eyebrow">PROJECT DROPDOWNS</div><h2>Categories & options.</h2><p>Add, rename or remove dropdown values. Enter one value per line. Changes apply to future selections; existing projects keep their saved values.</p>{error&&<p role="alert">{error}</p>}<form onSubmit={save}><div className="field-grid">{optionGroups.map(({key,label})=><label key={key}>{label}<textarea rows={6} value={(draft[key]||[]).join('\n')} disabled={busy||!ready} onChange={e=>setDraft({...draft,[key]:e.target.value.split('\n')})}/></label>)}</div><button className="search-btn" disabled={busy||!ready}>{busy?'Saving…':'Save dropdown values'}</button><p role="status">{status||(!ready&&!error?'Loading dropdown values…':'')}</p></form></section>;
}
