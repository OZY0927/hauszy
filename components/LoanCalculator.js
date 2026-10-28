'use client';
import {useState} from 'react';
import {estimate} from '../lib/loan-math';
import {money} from '../lib/project';
const DEFAULTS={price:'',downMode:'pct',downPct:'10',downAmount:'',rate:'4.1',years:'35',buyer:'citizen',firstHome:false,other:''};
export default function LoanCalculator({initial={}}){const [data,setData]=useState({...DEFAULTS,...(initial.price?{price:initial.price}:{})});const set=(k,v)=>setData(d=>({...d,[k]:v}));const n=k=>Number(data[k]);
const price=n('price'),byAmount=data.downMode==='amount',downPct=byAmount?(price>0?n('downAmount')/price*100:0):n('downPct');
function setDownMode(mode){setData(d=>{if(d.downMode===mode)return d;const p=Number(d.price);if(mode==='amount')return {...d,downMode:mode,downAmount:p>0&&d.downPct!==''?String(Math.round(p*Number(d.downPct)/100)):d.downAmount};return {...d,downMode:mode,downPct:p>0&&d.downAmount!==''?String(Math.round(Number(d.downAmount)/p*10000)/100):d.downPct}})}
const errors=[!(price>0)&&'Enter the property price.',(byAmount?!(data.downAmount!==''&&n('downAmount')>=0&&n('downAmount')<=price):!(data.downPct!==''&&n('downPct')>=0&&n('downPct')<=100))&&(byAmount?'Down payment must be between RM0 and the property price.':'Down payment must be 0–100%.'),!(n('rate')>=0&&n('rate')<=20&&data.rate!=='')&&'Enter an interest rate from 0 to 20%.',!(Number.isInteger(n('years'))&&n('years')>=1&&n('years')<=35)&&'Tenure must be 1–35 whole years.'].filter(Boolean);
const r=errors.length?null:estimate({price,downPct,rate:n('rate'),years:n('years'),buyer:data.buyer,firstHome:data.firstHome,other:Math.max(0,n('other')||0)});
function input(name,label,{suffix,placeholder}={}){return <label className="lc-field">{label}<span className="lc-input"><input type="number" inputMode="decimal" min="0" step="any" value={data[name]} placeholder={placeholder} onChange={e=>set(name,e.target.value)}/>{suffix&&<em>{suffix}</em>}</span></label>}
const row=(label,value,note)=><div key={label}><dt>{label}{note&&<small>{note}</small>}</dt><dd>{money(value)}</dd></div>;
return <>{initial.project&&<p className="calculator-note">Project: {initial.project} · Starting price; confirm the actual unit price.</p>}<div className="lc">
<div className="lc-inputs">
{input('price','Property price',{suffix:'RM',placeholder:'e.g. 650000'})}
<div className="lc-field"><div className="lc-label"><label htmlFor="lc-down">Down payment</label><span className="lc-toggle" role="group" aria-label="Enter down payment as"><button type="button" aria-pressed={!byAmount} onClick={()=>setDownMode('pct')}>%</button><button type="button" aria-pressed={byAmount} onClick={()=>setDownMode('amount')}>RM</button></span></div>
<span className="lc-input"><input id="lc-down" type="number" inputMode="decimal" min="0" max={byAmount?undefined:100} step="any" value={byAmount?data.downAmount:data.downPct} placeholder={byAmount?'e.g. 65000':'e.g. 10'} onChange={e=>set(byAmount?'downAmount':'downPct',e.target.value)}/><em>{byAmount?'RM':'%'}</em></span>
{price>0&&downPct>=0&&downPct<=100&&<small>{byAmount?`${Math.round(downPct*100)/100}% of the price`:`= ${money(price*downPct/100)}`}</small>}</div>
<div className="lc-pair">{input('rate','Interest rate',{suffix:'% p.a.'})}{input('years','Loan tenure',{suffix:'years'})}</div>
<label className="lc-field">Buyer<span className="lc-input"><select value={data.buyer} onChange={e=>set('buyer',e.target.value)}><option value="citizen">Malaysian citizen</option><option value="pr">Malaysian PR</option><option value="foreign">Foreigner</option></select></span></label>
{data.buyer==='citizen'&&<label className="lc-check"><input type="checkbox" checked={data.firstHome} onChange={e=>set('firstHome',e.target.checked)}/>First home (never owned a residential property)</label>}
{input('other','Other upfront costs (optional)',{suffix:'RM',placeholder:'Valuation, disbursements…'})}
</div>
<div className="lc-results" aria-live="polite">{!r?<><h2>Your estimate</h2><ul className="lc-errors">{errors.map(e=><li key={e}>{e}</li>)}</ul></>:<>
<div className="lc-big"><span>Monthly instalment</span><strong>{money(r.payment)}</strong><small>Loan {money(r.loan)} over {n('years')} years at {n('rate')}%</small></div>
<div className="lc-big lc-alt"><span>Upfront cash needed</span><strong>{money(r.upfront)}</strong></div>
<dl>{row('Down payment',r.down)}{row('Stamp duty — property transfer',r.transfer,r.exempt?'First-home exemption applied':data.buyer==='foreign'?'8% foreign buyer rate':null)}{row('Stamp duty — loan agreement',r.loanDuty)}{row('Legal fees (SPA + loan, incl. 8% SST)',r.legal,'Developers often pay these')}{r.other>0&&row('Other costs',r.other)}</dl>
</>}<p className="lc-fine">Estimate only. Uses the standard stamp duty and legal fee scales for Peninsular Malaysia{data.firstHome&&data.buyer==='citizen'?'; first-home exemption applies up to RM500,000 subject to eligibility':''}. Final figures depend on your bank and lawyer.</p></div>
</div></>}
