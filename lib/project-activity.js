export const ACTIVITY_EVENTS=['click','view','floor_plan','contact'];
export function validActivity(body){return !!body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).length===2&&typeof body.projectId==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(body.projectId)&&ACTIVITY_EVENTS.includes(body.event)}
export function activitySince(days,now=new Date()){
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const date=new Date(day+'T00:00:00Z');date.setUTCDate(date.getUTCDate()-days+1);return date.toISOString().slice(0,10);
}
export function summarizeActivity(rows){
 const projects=new Map(),totals=Object.fromEntries(ACTIVITY_EVENTS.map(key=>[key,0]));
 for(const row of rows){if(!ACTIVITY_EVENTS.includes(row.event))continue;const count=Number(row.count);if(!Number.isSafeInteger(count)||count<0)continue;const project=projects.get(row.project_id)||{id:row.project_id,...Object.fromEntries(ACTIVITY_EVENTS.map(key=>[key,0]))};project[row.event]+=count;totals[row.event]+=count;projects.set(row.project_id,project)}
 return {totals,projects:[...projects.values()]};
}
