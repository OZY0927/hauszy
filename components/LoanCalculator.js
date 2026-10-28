'use client';
import {useState} from 'react';
import {estimate} from '../lib/loan-math';
import {money} from '../lib/project';
const DEFAULTS={price:'',downPct:'10',rate:'4.1',years:'35',buyer:'citizen',firstHome:false,other:''};
export default function LoanCalculator({initial={}}){const [data,setData]=useState({...DEFAULTS,...(initial.price?{price:initial.price}:{})});const set=(k,v)=>setData(d=>({...d,[k]:v}));const n=k=>Number(data[k]);
const errors=[!(n('price')>0)&&'Enter the property price.',!(n('downPct')>=0&&n('downPct')<=100)&&'Down payment must be 0–100%.',!(n('rate')>=0&&n('rate')<=20&&data.rate!=='')&&'Enter an interest rate from 0 to 20%.',!(Number.isInteger(n('years'))&&n('years')>=1&&n('years')<=35)&&'Tenure must be 1–35 whole years.'].filter(Boolean);
const r=errors.length?null:estimate({price:n('price'),downPct:n('downPct'),rate:n('rate'),years:n('years'),buyer:data.buyer,firstHome:data.firstHome,other:Math.max(0,n('other')||0)});
function input(name,label,{suffix,placeholder}={}){return <label className="lc-field">{label}<span className="lc-input"><input type="number" inputMode="decimal" min="0" step="any" value={data[name]} placeholder={placeholder} onChange={e=>set(name,e.target.value)}/>{suffix&&<em>{suffix}</em>}</span></label>}
const row=(label,value,note)=><div key={label}><dt>{label}{note&&<small>{note}</small>}</dt><dd>{money(value)}</dd></div>;
return <>{initial.project&&<p className="calculator-note">Project: {initial.project} · Starting price; confirm the actual unit price.</p>}<div className="lc">
<div className="lc-inputs">
{input('price','Property price',{suffix:'RM',placeholder:'e.g. 650000'})}
<div className="lc-pair">{input('downPct','Down payment',{suffix:'%'})}{input('rate','Interest rate',{suffix:'% p.a.'})}</div>
{input('years','Loan tenure',{suffix:'years'})}
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
