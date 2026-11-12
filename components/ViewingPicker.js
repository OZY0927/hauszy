'use client';
import {useState} from 'react';
import Icon from './Icon';
import TimeScrubber from './TimeScrubber';

const pad=n=>String(n).padStart(2,'0');
const dateKey=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
const monthLabel=(y,m)=>new Date(Date.UTC(y,m,1)).toLocaleDateString('en-MY',{month:'long',year:'numeric',timeZone:'UTC'});
const fullLabel=(y,m,d)=>new Date(Date.UTC(y,m,d)).toLocaleDateString('en-MY',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
export const viewingTimeLabel=m=>`${(Math.floor(m/60)+11)%12+1}:${pad(m%60)} ${m<720?'am':'pm'}`;

export default function ViewingPicker({min,date,time,slots,onDate,onTime}){
 const [month,setMonth]=useState(()=>(date||min).slice(0,7));
 const [year,number]=month.split('-').map(Number),m=number-1;
 const offset=(new Date(Date.UTC(year,m,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(year,m+1,0)).getUTCDate();
 function move(delta){const next=new Date(Date.UTC(year,m+delta,1));setMonth(`${next.getUTCFullYear()}-${pad(next.getUTCMonth()+1)}`)}
 return <div className="viewing-picker">
  <fieldset className="viewing-calendar"><legend>Preferred viewing date</legend>
   <div className="viewing-month"><button type="button" aria-label="Previous month" disabled={month<=min.slice(0,7)} onClick={()=>move(-1)}><Icon name="chevronLeft"/></button><strong aria-live="polite">{monthLabel(year,m)}</strong><button type="button" aria-label="Next month" onClick={()=>move(1)}><Icon name="chevronRight"/></button></div>
   <div className="viewing-days"><div className="viewing-weekdays" aria-hidden="true">{['M','T','W','T','F','S','S'].map((day,i)=><span key={i}>{day}</span>)}</div><div className="viewing-date-grid" role="group" aria-label={monthLabel(year,m)}>{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{const day=i+1,key=dateKey(year,m,day);return <button type="button" key={key} data-viewing-date aria-label={fullLabel(year,m,day)} aria-pressed={date===key} aria-current={key===min?'date':undefined} disabled={key<min} onClick={()=>onDate(key)}>{day}</button>})}</div></div>
  </fieldset>
  <fieldset className="viewing-times"><legend>Preferred time <small>Malaysia · GMT+8</small></legend>
   {!date?<p className="viewing-empty">Choose a date to see the time slots.</p>:!slots.length?<p className="viewing-empty">No more times today. Please choose another date.</p>:<><TimeScrubber key={`${date}:${slots[0]}`} step={1} min={slots[0]} max={slots[slots.length-1]} start={slots.find(n=>viewingTimeLabel(n)===time)??slots[0]} onChange={minutes=>onTime(viewingTimeLabel(minutes))}/><span className="tms-hint">{time?`Selected: ${time}`:'Drag the ruler or use the arrow keys to choose a time.'}</span></>}

  </fieldset>
  <small className="viewing-note">Choose any minute, 9:00 am–6:30 pm. Subject to agent confirmation.</small>
 </div>;
}
