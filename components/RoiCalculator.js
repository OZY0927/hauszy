'use client';
import {useState} from 'react';
import {roiEstimate} from '../lib/roi';
import Icon from './Icon';
const DEFAULTS={price:'',downPct:'10',upfront:'',rate:'4.1',years:'35',rent:'',vacancy:'1',maintenance:'',yearlyCosts:''};
const rm=v=>`${v<0?'−':''}RM${Math.round(Math.abs(v)).toLocaleString('en-MY')}`;
const pct=v=>`${v<0?'−':''}${Math.abs(v).toFixed(2)}%`;
export default function RoiCalculator(){const [data,setData]=useState(DEFAULTS);const set=(k,v)=>setData(d=>({...d,[k]:v}));const n=k=>Number(data[k]||0);
const financed=n('downPct')<100;
const errors=[!(n('price')>0)&&'Enter the purchase price.',!(n('rent')>0)&&'Enter the expected monthly rent.',!(data.downPct!==''&&n('downPct')>=0&&n('downPct')<=100)&&'Down payment must be 0–100%.',financed&&!(data.rate!==''&&n('rate')>=0&&n('rate')<=20)&&'Enter an interest rate from 0 to 20%.',financed&&!(Number.isInteger(Number(data.years))&&n('years')>=1&&n('years')<=35)&&'Tenure must be 1–35 whole years.',!(n('vacancy')>=0&&n('vacancy')<12)&&'Vacancy must be 0–11 months a year.',['upfront','maintenance','yearlyCosts'].some(k=>n(k)<0)&&'Costs cannot be negative.'].filter(Boolean);
const r=errors.length?null:roiEstimate({price:n('price'),downPct:n('downPct'),upfront:n('upfront'),rate:n('rate'),years:n('years'),rent:n('rent'),maintenance:n('maintenance'),yearlyCosts:n('yearlyCosts'),vacancy:n('vacancy')});
function input(name,label,{suffix,placeholder,hint}={}){return <label className="lc-field"><span className="lc-label-text">{label}{hint&&<abbr title={hint} aria-label={hint}><Icon name="info"/></abbr>}</span><span className="lc-input"><input type="number" inputMode="decimal" min="0" step="any" value={data[name]} placeholder={placeholder} onChange={e=>set(name,e.target.value)}/>{suffix&&<em>{suffix}</em>}</span></label>}
const row=(label,value,cls='')=><div className={cls} key={label}><dt>{label}</dt><dd>{value}</dd></div>;
return <div className="lc">
<div className="lc-panel lc-inputs">
<h3 className="lc-kicker"><Icon name="home"/>Property</h3>
{input('price','Purchase price',{suffix:'RM',placeholder:'e.g. 500000'})}
<div className="lc-pair">{input('downPct','Down payment',{suffix:'%'})}{input('upfront','Other upfront costs',{suffix:'RM',placeholder:'Optional',hint:'Stamp duty, legal fees, renovation and furnishing'})}</div>
<h3 className="lc-kicker"><Icon name="banknote"/>Loan</h3>
<div className="lc-pair">{input('rate','Interest rate',{suffix:'%'})}{input('years','Tenure',{suffix:'yrs'})}</div>
<h3 className="lc-kicker"><Icon name="wallet"/>Rental</h3>
<div className="lc-pair">{input('rent','Monthly rent',{suffix:'RM',placeholder:'e.g. 2000'})}{input('vacancy','Vacancy',{suffix:'mths/yr',hint:'Months a year without a tenant. 1 month is a common assumption.'})}</div>
{input('maintenance','Maintenance & sinking fund',{suffix:'RM / month',placeholder:'Optional'})}
{input('yearlyCosts','Assessment, quit rent & insurance',{suffix:'RM / year',placeholder:'Optional'})}
<div className="lc-foot"><span/><button type="button" className="lc-reset" onClick={()=>setData(DEFAULTS)}><Icon name="refresh"/> Reset</button></div>
</div>
<div className="lc-out" aria-live="polite">{!r?<div className="lc-hero"><span className="lc-hero-label">Return on cash invested</span><strong>—%</strong><ul className="lc-errors">{errors.map(e=><li key={e}>{e}</li>)}</ul></div>:<>
<div className="lc-hero"><span className="lc-hero-label">Return on cash invested</span><strong key={Math.round((r.roi??0)*100)} className="lc-pop">{r.roi==null?'—':pct(r.roi)}</strong><span className="lc-hero-sub">{r.roi==null?'No cash invested, so ROI can’t be calculated':`Yearly cash flow ÷ ${rm(r.cashInvested)} you put in`}</span>
<dl className="lc-stats"><div><dt>Gross yield</dt><dd>{pct(r.grossYield)}</dd></div><div><dt>Net yield</dt><dd>{pct(r.netYield)}</dd></div><div><dt>Monthly cash flow</dt><dd>{rm(r.cashFlow/12)}</dd></div></dl></div>
<div className="lc-panel"><h3 className="lc-kicker"><Icon name="pieChart"/>Your year at a glance</h3><dl className="roi-rows">
{row(`Rent (${12-n('vacancy')} months let)`,rm(r.effectiveRent))}
{row('Running costs',rm(-r.runningCosts))}
{row('Loan repayments',rm(-r.loanYearly))}
{row('Yearly cash flow',rm(r.cashFlow),'total '+(r.cashFlow<0?'neg':'pos'))}
{row('Cash invested (down payment + upfront costs)',rm(r.cashInvested))}
</dl></div>
<div className="lc-panel"><h3 className="lc-kicker"><Icon name="lightbulb"/>Insights</h3><ul className="lc-insights">
<li>{r.cashFlow>=0?<>The rent covers all costs and the loan, leaving about <strong>{rm(r.cashFlow/12)}</strong> a month.</>:<>You’d top up about <strong>{rm(-r.cashFlow/12)}</strong> a month from your own pocket to cover the loan and costs.</>}</li>
{r.instalment>0&&<li>Break-even rent is about <strong>{rm(r.breakEvenRent)}</strong> a month, allowing for vacancy.</li>}
<li>Net yield is <strong>{(r.grossYield-r.netYield).toFixed(2)} percentage points</strong> below gross yield after vacancy and running costs.</li>
<li>For reference, recent portal data puts Malaysia’s average gross rental yield at around 5%.</li>
</ul><p className="lc-fine">Estimate only. Excludes rental income tax, agent fees, repairs and any change in property value. Results depend on actual rent, costs and loan terms.</p></div>
</>}</div>
</div>}
