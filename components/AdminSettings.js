'use client';
import {useState} from 'react';
import {EmailAuthProvider,reauthenticateWithCredential,updatePassword} from 'firebase/auth';
import {authErrorMessage} from '../lib/auth-errors';
export default function AdminSettings({user}){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 async function save(e){e.preventDefault();const form=e.currentTarget,data=new FormData(form),password=String(data.get('password'));if(password!==data.get('confirm')){setStatus('New passwords do not match.');return}setBusy(true);setStatus('Updating password…');try{await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,String(data.get('current'))));await updatePassword(user,password);form.reset();setStatus('Password changed successfully.')}catch(error){setStatus(error.code==='auth/weak-password'||error.code==='auth/password-does-not-meet-requirements'?'Choose a stronger password that meets your account password policy.':authErrorMessage(error))}finally{setBusy(false)}}
 return <section className="admin-panel"><div className="eyebrow">ACCOUNT SETTINGS</div><h2>Change password.</h2><p>Signed in as {user.email}</p><form method="post" className="admin-password-form" onSubmit={save}><label>Current password<input name="current" type="password" autoComplete="current-password" required disabled={busy}/></label><label>New password<input name="password" type="password" autoComplete="new-password" minLength={6} required disabled={busy}/></label><label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" minLength={6} required disabled={busy}/></label><button className="search-btn" disabled={busy}>{busy?'Updating…':'Change password'}</button><p role="status">{status}</p></form></section>;
}
