'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';
const METRICS=[['click','Project clicks'],['view','Page views'],['floor_plan','Floor-plan opens'],['contact','Contact clicks']];
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
 return <section className="admin-panel activity-dashboard" aria-labelledby="activity-title"><div className="activity-heading"><div><h3 id="activity-title"><Icon name="pieChart"/> Project performance</h3><p className="admin-lead">See which projects attract attention and prompt visitors to explore further.</p></div><div className="activity-controls"><label>Period<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[7,30,90].map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label><button type="button" className="outline" disabled={busy} onClick={()=>setRefresh(n=>n+1)}><Icon name="refresh"/> Refresh</button></div></div>
 <p className="activity-note">Counts include visitors who accept analytics, starting when tracking is deployed and storage is set up. These are interaction totals, not unique visitors. Contact clicks show interest, not confirmed enquiries or bookings. Dates use Malaysia time.</p>
 {busy?<p role="status">Loading project activity…</p>:error?<div className="empty-state" role="alert">{error}</div>:<>
 <div className="activity-stats">{METRICS.map(([key,label])=><div key={key}><span>{label}</span><strong>{(data?.totals[key]||0).toLocaleString('en-MY')}</strong></div>)}</div>
 <div className="activity-ranking-heading"><h3>Project rankings</h3><label>Rank by<select value={order} onChange={e=>setOrder(e.target.value)}>{METRICS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
 {ranked.length?<div className="activity-table-wrap"><table className="activity-table"><thead><tr><th scope="col">Project</th>{METRICS.map(([key,label])=><th scope="col" key={key}>{label}</th>)}</tr></thead><tbody>{ranked.map((row,index)=><tr key={row.id}><th scope="row"><span className="activity-rank">{index+1}</span><span>{row.name}<small>{row.status}</small></span></th>{METRICS.map(([key])=><td key={key}>{row[key].toLocaleString('en-MY')}</td>)}</tr>)}</tbody></table></div>:<div className="empty-state">No activity recorded in this period yet. Counts will appear after visitors accept analytics and interact with your published projects.</div>}
 </>}
 </section>;
}
