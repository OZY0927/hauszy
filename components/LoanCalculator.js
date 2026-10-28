'use client';
import {useState} from 'react';
import {loanSummary} from '../lib/loan-math';
import {money} from '../lib/project';
const DEFAULTS={price:'',downMode:'pct',downPct:'10',downAmount:'',rate:'4.1',years:'35'};
const monthYear=offset=>{const d=new Date();d.setMonth(d.getMonth()+offset);return d.toLocaleDateString('en-MY',{month:'long',year:'numeric'})};
const span=months=>{const y=Math.floor(months/12),m=months%12;return [y&&`${y} year${y>1?'s':''}`,m&&`${m} month${m>1?'s':''}`].filter(Boolean).join(' ')};
export default function LoanCalculator({initial={}}){const [data,setData]=useState({...DEFAULTS,...(initial.price?{price:initial.price}:{})});const set=(k,v)=>setData(d=>({...d,[k]:v}));const n=k=>Number(data[k]);
const price=n('price'),byAmount=data.downMode==='amount',downPct=byAmount?(price>0?n('downAmount')/price*100:0):n('downPct');
function setDownMode(mode){setData(d=>{if(d.downMode===mode)return d;const p=Number(d.price);if(mode==='amount')return {...d,downMode:mode,downAmount:p>0&&d.downPct!==''?String(Math.round(p*Number(d.downPct)/100)):d.downAmount};return {...d,downMode:mode,downPct:p>0&&d.downAmount!==''?String(Math.round(Number(d.downAmount)/p*10000)/100):d.downPct}})}
const errors=[!(price>0)&&'Enter the property price.',(byAmount?!(data.downAmount!==''&&n('downAmount')>=0&&n('downAmount')<price):!(data.downPct!==''&&n('downPct')>=0&&n('downPct')<100))&&(byAmount?'Down payment must be less than the property price.':'Down payment must be from 0% to below 100%.'),!(n('rate')>=0&&n('rate')<=20&&data.rate!=='')&&'Enter an interest rate from 0 to 20%.',!(Number.isInteger(n('years'))&&n('years')>=1&&n('years')<=35)&&'Tenure must be 1–35 whole years.'].filter(Boolean);
const r=errors.length?null:loanSummary(price,downPct,n('rate'),n('years')),principalShare=r?r.loan/r.totalRepayment*100:0;
function input(name,label,{suffix,placeholder}={}){return <label className="lc-field">{label}<span className="lc-input"><input type="number" inputMode="decimal" min="0" step="any" value={data[name]} placeholder={placeholder} onChange={e=>set(name,e.target.value)}/>{suffix&&<em>{suffix}</em>}</span></label>}
const row=(label,value,note)=><div key={label}><dt>{label}{note&&<small>{note}</small>}</dt><dd>{value}</dd></div>;
return <>{initial.project&&<p className="calculator-note">Project: {initial.project} · Starting price; confirm the actual unit price.</p>}<div className="lc">
<div className="lc-inputs">
{input('price','Property price',{suffix:'RM',placeholder:'e.g. 650000'})}
<div className="lc-field"><div className="lc-label"><label htmlFor="lc-down">Down payment</label><span className="lc-toggle" role="group" aria-label="Enter down payment as"><button type="button" aria-pressed={!byAmount} onClick={()=>setDownMode('pct')}>%</button><button type="button" aria-pressed={byAmount} onClick={()=>setDownMode('amount')}>RM</button></span></div>
<span className="lc-input"><input id="lc-down" type="number" inputMode="decimal" min="0" max={byAmount?undefined:100} step="any" value={byAmount?data.downAmount:data.downPct} placeholder={byAmount?'e.g. 65000':'e.g. 10'} onChange={e=>set(byAmount?'downAmount':'downPct',e.target.value)}/><em>{byAmount?'RM':'%'}</em></span>
{price>0&&downPct>=0&&downPct<100&&<small>{byAmount?`${Math.round(downPct*100)/100}% of the price`:`= ${money(price*downPct/100)}`}</small>}</div>
<div className="lc-pair">{input('rate','Interest rate',{suffix:'% p.a.'})}{input('years','Loan tenure',{suffix:'years'})}</div>
</div>
<div className="lc-results" aria-live="polite">{!r?<><h2>Your monthly instalment</h2><ul className="lc-errors">{errors.map(e=><li key={e}>{e}</li>)}</ul></>:<>
<div className="lc-big"><span>Monthly instalment</span><strong>{money(r.payment)}</strong><small>for {r.months} months · loan of {money(r.loan)}</small></div>
<div className="lc-split" aria-hidden="true"><i style={{width:`${principalShare}%`}}/></div>
<div className="lc-split-legend"><span><b className="p"/>Loan amount {Math.round(principalShare)}%</span><span><b className="i"/>Interest {Math.round(100-principalShare)}%</span></div>
<dl>
{row('Loan amount',money(r.loan),`${Math.round((100-downPct)*100)/100}% of the price`)}
{row('Down payment',money(r.down))}
{row('Total interest',money(r.totalInterest))}
{row('Total loan repayment',money(r.totalRepayment),'Loan amount + interest')}
{row('Total property cost',money(r.totalCost),'Down payment + total loan repayment')}
</dl>
<h3>Insights</h3>
<ul className="lc-insights">
<li>Every <strong>RM1</strong> you borrow costs about <strong>RM{r.interestPerRinggit.toFixed(2)}</strong> in interest over the loan.</li>
{r.firstInterest>0&&<li>Your first instalment is <strong>{money(r.firstInterest)}</strong> interest and only <strong>{money(r.firstPrincipal)}</strong> towards the loan.</li>}
{r.halfwayMonth>0&&<li>You’ll owe half the loan after <strong>{span(r.halfwayMonth)}</strong>, {r.halfwayMonth>r.months/2?'past the halfway point of the tenure, because early instalments are mostly interest':'halfway through the tenure'}.</li>}
<li>If the rate rises by 1%, the instalment becomes <strong>{money(r.plusOne)}</strong> (+{money(r.plusOne-r.payment)} a month).</li>
<li>Starting this month, the loan would be fully repaid around <strong>{monthYear(r.months)}</strong>.</li>
</ul>
</>}<p className="lc-fine">Estimate only, assuming a fixed rate and equal monthly instalments. Your bank’s actual rate, tenure and rounding may differ.</p></div>
</div></>}
