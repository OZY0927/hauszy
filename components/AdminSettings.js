'use client';
import {useState} from 'react';
import {EmailAuthProvider,reauthenticateWithCredential,updatePassword} from 'firebase/auth';
import {authErrorMessage} from '../lib/auth-errors';
import Icon from './Icon';
import AdminMusicSettings from './AdminMusicSettings';
import AdminTelegramSettings from './AdminTelegramSettings';
const when=time=>time?new Date(time).toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'}):'—';
function Secret({name,label,autoComplete,value,onChange,disabled}){
 const [shown,setShown]=useState(false);
 return <label className="st-field">{label}<span className="st-secret"><input name={name} type={shown?'text':'password'} autoComplete={autoComplete} required disabled={disabled} value={value} onChange={e=>onChange(e.target.value)}/><button type="button" aria-label={shown?`Hide ${label.toLowerCase()}`:`Show ${label.toLowerCase()}`} aria-pressed={shown} onClick={()=>setShown(!shown)}><Icon name={shown?'eyeOff':'eye'}/></button></span></label>;
}
export default function AdminSettings({user}){
 const blank={current:'',password:'',confirm:''},[form,setForm]=useState(blank),[busy,setBusy]=useState(false),[status,setStatus]=useState({text:'',tone:''});
 const set=key=>value=>{setForm({...form,[key]:value});setStatus({text:'',tone:''})};
 const checks=[['At least 6 characters',form.password.length>=6],['Different from your current password',!!form.password&&form.password!==form.current],['Both new passwords match',!!form.confirm&&form.password===form.confirm]],ok=!!form.current&&checks.every(([,pass])=>pass);
 async function save(e){e.preventDefault();if(!ok)return;setBusy(true);setStatus({text:'Updating password…',tone:''});try{await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,form.current));await updatePassword(user,form.password);setForm(blank);setStatus({text:'Password changed successfully.',tone:'good'})}catch(error){setStatus({text:error.code==='auth/weak-password'||error.code==='auth/password-does-not-meet-requirements'?'Choose a stronger password that meets your account password policy.':authErrorMessage(error),tone:'bad'})}finally{setBusy(false)}}
 return <section className="st-settings" aria-label="Account settings">
   <AdminTelegramSettings user={user}/><AdminMusicSettings user={user}/>
   <div className="st-card">
    <div className="st-card-head"><h3><Icon name="users"/>Signed in</h3></div>
    <div className="st-card-body">
    <div className="st-account-id"><span className="st-avatar" aria-hidden="true">{(user.email||'?')[0].toUpperCase()}</span><div><strong>{user.email}</strong><small>Administrator</small></div></div>
    <dl className="st-facts"><div><dt>Last sign-in</dt><dd>{when(user.metadata?.lastSignInTime)}</dd></div><div><dt>Account created</dt><dd>{when(user.metadata?.creationTime)}</dd></div></dl>
    <p className="st-note"><Icon name="clock"/>For security, you are signed out automatically after 30 minutes of inactivity.</p>
    </div>
   </div>
   <form method="post" className="st-card" onSubmit={save}>
    <div className="st-card-head"><div><h3><Icon name="lock"/>Change password</h3><p>Enter your current password to confirm it’s you, then choose a new one.</p></div></div>
    <div className="st-card-body">
    <Secret name="current" label="Current password" autoComplete="current-password" value={form.current} onChange={set('current')} disabled={busy}/>
    <Secret name="password" label="New password" autoComplete="new-password" value={form.password} onChange={set('password')} disabled={busy}/>
    <Secret name="confirm" label="Confirm new password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} disabled={busy}/>
    <ul className="st-checks">{checks.map(([label,pass])=><li key={label} className={pass?'pass':undefined}><Icon name={pass?'circleCheck':'minus'}/>{label}</li>)}</ul>
    <button className="st-btn primary" disabled={busy||!ok}><Icon name="key"/>{busy?'Updating…':'Change password'}</button>
    <p className={`st-status ${status.tone}`} role="status">{status.text}</p>
    </div>
   </form>
 </section>;
}
