export const HOT_PROJECT_LIMIT=9;
// Counts remain server-only. Send a small pool and the IDs to keep in ranked order.
export function featuredProjectPool(projects,rows,limit=12,random=Math.random){
 const views=new Map();
 for(const row of rows){const count=Number(row.count);if(Number.isSafeInteger(count)&&count>0)views.set(row.project_id,(views.get(row.project_id)||0)+count)}
 const ranked=projects.filter(p=>(views.get(p.id)||0)>0).sort((a,b)=>views.get(b.id)-views.get(a.id)||a.id.localeCompare(b.id));
 const priority=ranked.slice(0,limit),priorityIds=priority.map(p=>p.id),rankedIds=new Set(ranked.map(p=>p.id));
 const fallback=sampleProjects(projects.filter(p=>!rankedIds.has(p.id)),Math.max(0,limit-priority.length),random);
 return {projects:[...priority,...fallback],priorityIds,popular:priority.length>0};
}
export function sampleProjects(projects,limit=HOT_PROJECT_LIMIT,random=Math.random,priorityIds=[]){
 const byId=new Map(projects.map(p=>[p.id,p])),priority=[...new Set(priorityIds)].map(id=>byId.get(id)).filter(Boolean).slice(0,limit),used=new Set(priority.map(p=>p.id));
 const result=[...byId.values()].filter(p=>!used.has(p.id));
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return [...priority,...result.slice(0,Math.max(0,limit-priority.length))];
}
