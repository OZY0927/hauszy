'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';
const METRICS=[['click','Project clicks','arrowUpRight'],['view','Page views','eye'],['floor_plan','Floor-plan opens','maximize'],['contact','Contact clicks','message']];
export default function ProjectAnalytics({user,records}){
 const [days,setDays]=useState(30),[order,setOrder]=useState('click'),[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let active=true;const controller=new AbortController();setBusy(true);setError('');setData(null);
  (async()=>{try{
   const token=await user.getIdToken();const response=await fetch(`/api/admin/project-activity/?days=${days}`,{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:controller.signal});
   const result=await response.json();if(!response.ok)throw Error(result.error||'Could not load analytics.');if(active)setData(result);
  }catch(e){if(active)setError(e.message)}finally{if(active)setBusy(false)}})();
  return ()=>{active=false;controller.abort()};
 },[user,days,refresh]);
 const ranked=(data?.projects||[]).map(row=>({...row,name:records.find(p=>p.id===row.id)?.name||'Deleted project',status:records.find(p=>p.id===row.id)?.status||'Deleted'})).sort((a,b)=>b[order]-a[order]||b.view-a.view||a.name.localeCompare(b.name));
 const top=Math.max(1,...ranked.map(row=>row[order]));
 return <section className="st-view" aria-labelledby="activity-title">
  <div className="st-toolbar"><h2 id="activity-title" className="st-grow st-eyebrow">Project performance</h2><div className="st-segment" role="group" aria-label="Period">{[7,30,90].map(n=><button key={n} type="button" aria-pressed={days===n} onClick={()=>setDays(n)}>Last {n} days</button>)}</div><button type="button" className="st-btn" disabled={busy} onClick={()=>setRefresh(n=>n+1)}><Icon name="refresh"/>Refresh</button></div>
  {busy?<div className="st-card st-empty" role="status"><Icon name="pieChart"/><p>Loading project activity…</p></div>:error?<div className="st-alert bad" role="alert"><Icon name="circleAlert"/><p>{error}</p></div>:<>
  <div className="st-kpis">{METRICS.map(([key,label,icon])=><div key={key} className="st-card st-kpi"><span className="st-kpi-label"><Icon name={icon}/>{label}</span><strong>{(data?.totals[key]||0).toLocaleString('en-MY')}</strong><small>Last {days} days</small></div>)}</div>
  <div className="st-card"><div className="st-card-head"><div><h3><Icon name="trendingUp"/>Project rankings</h3><p>{ranked.length} project{ranked.length===1?'':'s'} with activity in this period</p></div><label className="st-sort st-field">Rank by<select value={order} onChange={e=>setOrder(e.target.value)}>{METRICS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
  {ranked.length?<div className="st-table-wrap"><table className="st-table"><thead><tr><th scope="col">Project</th>{METRICS.map(([key,label])=><th scope="col" key={key} aria-sort={key===order?'descending':undefined}>{label}</th>)}</tr></thead><tbody>{ranked.map((row,index)=><tr key={row.id}><th scope="row"><div><span className="st-rank">{index+1}</span><span>{row.name}<small>{row.status}</small></span></div></th>{METRICS.map(([key])=><td key={key} className={key===order?'active':undefined}>{key===order&&<span className="st-meter" aria-hidden="true"><i style={{width:`${row[key]/top*100}%`}}/></span>}{row[key].toLocaleString('en-MY')}</td>)}</tr>)}</tbody></table></div>:<div className="st-empty"><Icon name="pieChart"/><strong>No activity yet.</strong><p>No activity recorded in this period yet. Counts will appear after visitors accept analytics and interact with your published projects.</p></div>}
  </div></>}
  <p className="st-note"><Icon name="info"/>Counts include visitors who accept analytics, starting when tracking is deployed and storage is set up. These are interaction totals, not unique visitors. Contact clicks show interest, not confirmed enquiries or bookings. Dates use Malaysia time.</p>
 </section>;
}
