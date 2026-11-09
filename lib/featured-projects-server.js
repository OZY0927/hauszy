import 'server-only';
import {getSupabaseUploadServer} from './supabase-server';
import {supabaseOrigin} from './supabase-config';
import {activitySince} from './project-activity';
import {featuredProjectPool} from './featured-projects';

export async function getFeaturedProjectPool(projects){
 if(!projects.length)return {projects:[],popular:false};
 try{
  // Validate the existing server-only credentials; never expose the analytics table or counts publicly.
  getSupabaseUploadServer();
  const rows=[];
  for(let offset=0;offset<10000;offset+=1000){
   const url=new URL('/rest/v1/project_activity_daily',supabaseOrigin());
   url.search=new URLSearchParams({select:'project_id,count',event:'eq.click',day:'gte.'+activitySince(30),order:'day.asc,project_id.asc',limit:'1000',offset:String(offset)});
   const response=await fetch(url,{headers:{apikey:process.env.SUPABASE_SECRET_KEY.trim(),Authorization:'Bearer '+process.env.SUPABASE_SECRET_KEY.trim()},cache:'force-cache',next:{revalidate:3600,tags:['featured-projects']},signal:AbortSignal.timeout(5000)});
   if(!response.ok)throw Error('Activity unavailable');
   const data=await response.json();if(!Array.isArray(data))throw Error('Invalid activity');
   rows.push(...data);
   if(data.length<1000)return featuredProjectPool(projects,rows);
  }
 }catch{/* Missing analytics must not prevent the homepage or published projects from loading. */}
 return featuredProjectPool(projects,[]);
}
