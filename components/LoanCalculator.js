'use client';
import {useState} from 'react';
import {loanSummary,monthlyPayment,yearlySchedule} from '../lib/loan-math';
import Icon from './Icon';
const DEFAULTS={price:'',downMode:'pct',downPct:'10',downAmount:'',rate:'4.1',years:'35'};
const rm=v=>`RM${Math.round(v).toLocaleString('en-MY')}`;
const monthYear=offset=>{const d=new Date();d.setMonth(d.getMonth()+offset);return d.toLocaleDateString('en-MY',{month:'long',year:'numeric'})};
const span=months=>{const y=Math.floor(months/12),m=months%12;return [y&&`${y} year${y>1?'s':''}`,m&&`${m} month${m>1?'s':''}`].filter(Boolean).join(' ')};
const startState=initial=>{const s={...DEFAULTS};for(const k of ['price','downPct','downAmount','rate','years'])if(initial[k]!==undefined&&initial[k]!=='')s[k]=initial[k];if(initial.downAmount)s.downMode='amount';return s};
export default function LoanCalculator({initial={}}){const [data,setData]=useState(()=>startState(initial)),[status,setStatus]=useState('');const set=(k,v)=>setData(d=>({...d,[k]:v}));const n=k=>Number(data[k]);
const price=n('price'),byAmount=data.downMode==='amount',downPct=byAmount?(price>0?n('downAmount')/price*100:0):n('downPct'),rate=n('rate'),years=n('years');
function setDownMode(mode){setData(d=>{if(d.downMode===mode)return d;const p=Number(d.price);if(mode==='amount')return {...d,downMode:mode,downAmount:p>0&&d.downPct!==''?String(Math.round(p*Number(d.downPct)/100)):d.downAmount};return {...d,downMode:mode,downPct:p>0&&d.downAmount!==''?String(Math.round(Number(d.downAmount)/p*10000)/100):d.downPct}})}
const errors=[!(price>0)&&'Enter the property price.',(byAmount?!(data.downAmount!==''&&n('downAmount')>=0&&n('downAmount')<price):!(data.downPct!==''&&n('downPct')>=0&&n('downPct')<100))&&(byAmount?'Down payment must be less than the property price.':'Down payment must be from 0% to below 100%.'),!(rate>=0&&rate<=20&&data.rate!=='')&&'Enter an interest rate from 0 to 20%.',!(Number.isInteger(years)&&years>=1&&years<=35)&&'Tenure must be 1–35 whole years.'].filter(Boolean);
const r=errors.length?null:loanSummary(price,downPct,rate,years),schedule=r?yearlySchedule(r.loan,rate,years):[],principalShare=r?r.loan/r.totalRepayment*100:0;
const moves=r?[-.5,-.25,0,.25,.5].map(d=>Math.round((rate+d)*100)/100).filter(v=>v>=0).map(v=>({rate:v,payment:monthlyPayment(r.loan,v,years)})):[];
function input(name,label,{suffix,placeholder,hint}={}){return <label className="lc-field"><span className="lc-label-text">{label}{hint&&<abbr title={hint} aria-label={hint}><Icon name="info"/></abbr>}</span><span className="lc-input"><input type="number" inputMode="decimal" min="0" step="any" value={data[name]} placeholder={placeholder} onChange={e=>set(name,e.target.value)}/>{suffix&&<em>{suffix}</em>}</span></label>}

function reset(){setData(DEFAULTS);setStatus('');history.replaceState(null,'','/tools/loan-calculator')}
return <>{initial.project&&<p className="calculator-note">Project: {initial.project} · Starting price; confirm the actual unit price.</p>}<div className="lc">
<div className="lc-panel lc-inputs">
<h3 className="lc-kicker"><Icon name="home"/>Property</h3>
{input('price','Property price',{suffix:'RM',placeholder:'e.g. 650000'})}
<div className="lc-field"><div className="lc-label"><label htmlFor="lc-down" className="lc-label-text">Down payment</label><span className="lc-toggle" role="group" aria-label="Enter down payment as"><button type="button" aria-pressed={!byAmount} onClick={()=>setDownMode('pct')}>%</button><button type="button" aria-pressed={byAmount} onClick={()=>setDownMode('amount')}>RM</button></span></div>
<span className="lc-input"><input id="lc-down" type="number" inputMode="decimal" min="0" max={byAmount?undefined:100} step="any" value={byAmount?data.downAmount:data.downPct} placeholder={byAmount?'e.g. 65000':'e.g. 10'} onChange={e=>set(byAmount?'downAmount':'downPct',e.target.value)}/><em>{byAmount?'RM':'%'}</em></span>
{price>0&&downPct>=0&&downPct<100&&<small>{byAmount?`${Math.round(downPct*100)/100}% of the price`:`= ${rm(price*downPct/100)}`}</small>}</div>
<h3 className="lc-kicker"><Icon name="clock"/>Terms</h3>
<div className="lc-pair">{input('rate','Interest rate',{suffix:'%',hint:'Annual interest rate offered by your bank'})}{input('years','Tenure',{suffix:'yrs'})}</div>
{r&&<><h3 className="lc-kicker"><Icon name="trendingUp"/>If the rate moves</h3><table className="lc-moves"><caption className="lc-sr">Monthly instalment at nearby interest rates</caption><tbody>{moves.map(m=>{const d=m.payment-r.payment,base=m.rate===Math.round(rate*100)/100;return <tr key={m.rate} className={base?'base':''}><th scope="row">{m.rate.toFixed(2)}%</th><td>{rm(m.payment)}</td><td className={base?'':d<0?'down':'up'}>{base?'base':`${d<0?'−':'+'}${rm(Math.abs(d))}`}</td></tr>})}</tbody></table></>}
<div className="lc-foot"><span role="status">{status}</span><button type="button" className="lc-reset" onClick={reset}><Icon name="refresh"/> Reset</button></div>
</div>
<div className="lc-out" aria-live="polite">{!r?<div className="lc-hero"><span className="lc-hero-label">Monthly instalment</span><strong>RM—</strong><ul className="lc-errors">{errors.map(e=><li key={e}>{e}</li>)}</ul></div>:<>
<div className="lc-hero"><span className="lc-hero-label">Monthly instalment</span><strong key={Math.round(r.payment)} className="lc-pop">{rm(r.payment)}</strong><span className="lc-hero-sub">{rate.toFixed(2)}% over {years} years · loan {rm(r.loan)} after {rm(r.down)} down</span>
<dl className="lc-stats"><div><dt>Total paid</dt><dd>{rm(r.totalRepayment)}</dd></div><div><dt>Total interest</dt><dd>{rm(r.totalInterest)}</dd></div><div><dt>Cost / RM borrowed</dt><dd>{(r.totalRepayment/r.loan).toFixed(2)}×</dd></div></dl></div>
<div className="lc-panel"><h3 className="lc-kicker"><Icon name="pieChart"/>Where each ringgit goes (over loan life)</h3><div className="lc-split" role="img" aria-label={`Principal ${Math.round(principalShare)}%, interest ${Math.round(100-principalShare)}%`}><i style={{width:`${principalShare}%`}}/></div>
<div className="lc-split-legend"><span><b className="p"/>Principal <strong>{rm(r.loan)}</strong> ({Math.round(principalShare)}%)</span><span><b className="i"/>Interest <strong>{rm(r.totalInterest)}</strong> ({Math.round(100-principalShare)}%)</span></div>
<p className="lc-total-cost">Total property cost incl. down payment: <strong>{rm(r.totalCost)}</strong></p></div>
<details className="lc-panel lc-years" open><summary><span><Icon name="table"/> Year-by-year breakdown</span></summary><div className="lc-scroll"><table><thead><tr><th scope="col">Year</th><th scope="col">Principal</th><th scope="col">Interest</th><th scope="col">Balance</th></tr></thead><tbody>{schedule.map(y=><tr key={y.year}><th scope="row">Y{y.year}</th><td>{rm(y.principal)}</td><td className="int">{rm(y.interest)}</td><td className="bal">{rm(y.balance)}</td></tr>)}</tbody></table></div></details>
<div className="lc-panel"><h3 className="lc-kicker"><Icon name="lightbulb"/>Insights</h3><ul className="lc-insights">
{r.firstInterest>0&&<li>Your first instalment is <strong>{rm(r.firstInterest)}</strong> interest and only <strong>{rm(r.firstPrincipal)}</strong> towards the loan.</li>}
{r.halfwayMonth>0&&<li>You’ll owe half the loan after <strong>{span(r.halfwayMonth)}</strong>{r.halfwayMonth>r.months/2?', well past the halfway point of the tenure, because early instalments are mostly interest':''}.</li>}
<li>If the rate rises by 1%, the instalment becomes <strong>{rm(r.plusOne)}</strong> (+{rm(r.plusOne-r.payment)} a month).</li>
<li>Starting this month, the loan would be fully repaid around <strong>{monthYear(r.months)}</strong>.</li>
</ul><p className="lc-fine">Estimate only, assuming a fixed rate and equal monthly instalments. Your bank’s actual rate, tenure and rounding may differ.</p></div>
</>}</div>
</div></>}
