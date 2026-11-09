// Return a small published-only pool. Counts remain on the server.
export function featuredProjectPool(projects,rows,limit=12){
 const clicks=new Map();
 for(const row of rows){const count=Number(row.count);if(Number.isSafeInteger(count)&&count>0)clicks.set(row.project_id,(clicks.get(row.project_id)||0)+count)}
 const ranked=projects.filter(p=>(clicks.get(p.id)||0)>0).sort((a,b)=>clicks.get(b.id)-clicks.get(a.id)||a.id.localeCompare(b.id));
 return {projects:(ranked.length?ranked:projects).slice(0,limit),popular:ranked.length>0};
}
export function sampleProjects(projects,limit=8,random=Math.random){
 const result=[...projects];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result.slice(0,limit);
}
