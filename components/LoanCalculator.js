'use client';
import {useMemo,useState} from 'react';
import {yearly} from '../lib/loan-math';
import {money} from '../lib/project';
import {LAST_VERIFIED,RULES,STATES} from '../lib/property-rules';
import {comparisons,computeEstimate,num,validate} from '../lib/purchase-costs';

const PRINCIPAL='#96351E',INTEREST='#CDA57E',ALT='#5B4A40';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const BLANK={projectName:'',unit:'',price:'',margin:'90',downPayment:'',rate:'',years:'35',buyerStatus:'citizen',purchaser:'individual',companyType:'local',state:'penang-island',propertyType:'strata',dwelling:'yes',serviceConfirmed:false,purchaseType:'hda',firstHome:'no',spaDate:'',instrumentDate:'',marketValue:'',booking:'',consentRequired:'no',size:'',maintMode:'psf',maintRate:'',maintFixed:'',sinkMode:'percent',sinkPct:'10',sinkFixed:'',sinkIncluded:false,assessment:'',quitRent:'',homeInsurance:'',parking:'',monthlyOther:'',extraMonthly:'',lumpSum:'',lumpYear:'5',underConstruction:false,stages:[],items:{},example:false};
const SAMPLE={...BLANK,price:'650000',margin:'90',downPayment:'65000',rate:'4.1',years:'35',booking:'6500',size:'1100',maintRate:'0.35',assessment:'600',quitRent:'120',homeInsurance:'300',underConstruction:true,
  stages:[{label:'Foundation & structure',percent:'20',months:'12'},{label:'Walls, roof & wiring',percent:'25',months:'12'},{label:'Finishes & infrastructure',percent:'25',months:'9'},{label:'Vacant possession',percent:'20',months:'6'}],
  items:{insurance:{override:'12000',financed:true},spaLegal:{cover:'developer'}},example:true};
const startState=initial=>{const s={...SAMPLE,spaDate:today()};if(initial.project){s.projectName=initial.project;if(initial.price){s.price=initial.price;s.downPayment=String(Math.round(num(initial.price)*(1-num(s.margin)/100)*100)/100);s.booking=''}if(initial.size)s.size=initial.size;if(initial.maintenance)s.maintRate=initial.maintenance}return s};
const short=v=>v>=1e6?`${(v/1e6).toFixed(v>=1e7?0:1)}m`:v>=1e3?`${Math.round(v/1e3)}k`:String(Math.round(v));
const niceMax=v=>{const m=Math.pow(10,Math.floor(Math.log10(v||1)));return [1,2,2.5,5,10].map(f=>f*m).find(n=>n>=v)};
const pct=v=>`${Number(v).toFixed(2).replace(/\.?0+$/,'')}%`;
const duration=months=>{const y=Math.floor(months/12),m=months%12;return [y&&`${y} yr${y>1?'s':''}`,m&&`${m} mth${m>1?'s':''}`].filter(Boolean).join(' ')||'0 mths'};
const topRounded=(x,y,w,h,r)=>{r=Math.max(0,Math.min(r,w/2,h));return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`};
const STATUS={enacted:'Enacted',announced:'Announced — confirm gazette',secondary:'Secondary sources',placeholder:'Placeholder'};

export default function LoanCalculator({initial={}}){
  const [data,setData]=useState(()=>startState(initial)),[touched,setTouched]=useState({}),[openYear,setOpenYear]=useState(null),[status,setStatus]=useState('');
  const errors=validate(data),valid=!Object.keys(errors).length;
  const r=useMemo(()=>valid?computeEstimate(data):null,[data,valid]);
  const set=(name,value)=>setData(d=>{const next={...d,[name]:value},price=num(next.price);
    if(name==='margin'||name==='price'){if(price>0&&next.margin!=='')next.downPayment=String(Math.round(price*(1-num(next.margin)/100)*100)/100)}
    else if(name==='downPayment'&&price>0&&value!=='')next.margin=String(Math.round((1-num(value)/price)*1e6)/1e4);
    return next});
  const setItem=(id,key,value)=>setData(d=>({...d,items:{...d.items,[id]:{...d.items[id],[key]:value}}}));
  const setStage=(i,key,value)=>setData(d=>({...d,stages:d.stages.map((s,j)=>j===i?{...s,[key]:value}:s)}));
  const showError=name=>errors[name]&&(touched[name]||data[name]!=='')?errors[name]:null;

  function field(name,label,{hint,prefix,suffix,type='number',step='any',min=0,max}={}){const id='mc-'+name,err=showError(name);
    return <div className={'mc-field'+(err?' mc-invalid':'')}><label htmlFor={id}>{label}</label><div className="mc-input">{prefix&&<span aria-hidden="true">{prefix}</span>}<input id={id} type={type} inputMode={type==='number'?'decimal':undefined} step={type==='number'?step:undefined} min={type==='number'?min:undefined} max={max} value={data[name]??''} onChange={e=>set(name,e.target.value)} onBlur={()=>setTouched(t=>({...t,[name]:true}))} aria-invalid={!!err} aria-describedby={err||hint?id+'-note':undefined}/>{suffix&&<span aria-hidden="true">{suffix}</span>}</div>{(err||hint)&&<small id={id+'-note'} className={err?'mc-error':''}>{err||hint}</small>}</div>}
  function choice(name,label,options,{hint}={}){return <fieldset className="mc-choice"><legend>{label}</legend><div>{options.map(([value,text])=><label key={value} className={data[name]===value?'on':''}><input type="radio" name={name} value={value} checked={data[name]===value} onChange={()=>set(name,value)}/>{text}</label>)}</div>{hint&&<small>{hint}</small>}</fieldset>}
  function select(name,label,options,{hint}={}){const id='mc-'+name;return <div className="mc-field"><label htmlFor={id}>{label}</label><div className="mc-input"><select id={id} value={data[name]} onChange={e=>set(name,e.target.value)}>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></div>{hint&&<small>{hint}</small>}</div>}
  function check(name,label){return <label className="mc-check"><input type="checkbox" checked={!!data[name]} onChange={e=>set(name,e.target.checked)}/>{label}</label>}

  function summaryText(){if(!r)return '';const t=r.totals,lines=[
    `*Property cost estimate${data.projectName?` — ${data.projectName}`:''}${data.unit?` (${data.unit})`:''}*`,
    `Price: ${money(r.price)}`,
    r.hasLoan?`Loan: ${money(r.loan)} (${pct(r.margin)} margin)${r.financedCosts>0?` + financed costs ${money(r.financedCosts)} = ${money(r.facility)}`:''}`:'Cash purchase (no loan)',
    r.hasLoan&&`Rate ${pct(r.rate)} p.a. · ${r.years} years`,
    r.hasLoan&&`Monthly instalment: ${money(r.payment)}`,
    `Total monthly ownership cost: ${money(r.monthly.total)}`,
    `Upfront cash required: ${money(t.cash)}`,
    `Remaining after payments made: ${money(t.outstanding)} (now ${money(t.now)}, later ${money(t.later)})`,
    `Stamp duty payable: ${money(r.stampDuty.payable)}${r.stampDuty.exemption>0?` (after ${money(r.stampDuty.exemption)} exemption)`:''}`,
    t.developer>0&&`Developer-covered costs: ${money(t.developer)}`,
    r.missing.length&&`⚠ Incomplete — awaiting quotes for: ${r.missing.join(', ')}`,
    '_Estimate based on the entered assumptions. Variable rates may change; final fees, exemptions and loan terms depend on the lawyer, bank and authorities._'];
    return lines.filter(Boolean).join('\n')}
  async function copySummary(){try{await navigator.clipboard.writeText(summaryText());setStatus('Summary copied — paste it into WhatsApp.')}catch{setStatus('Copy failed. Use “Open in WhatsApp” instead.')}}
  function reset(){setData({...BLANK,spaDate:today()});setTouched({});setOpenYear(null);setStatus('Calculator cleared.');history.replaceState(null,'','/tools/loan-calculator')}
  function loadExample(){setData({...SAMPLE,spaDate:today()});setTouched({});setStatus('Example values loaded.')}

  const t=r?.totals,plan=r?(r.accelerated||r.schedule):null,years=plan?yearly(plan.rows):[];
  const residentialHint=data.propertyType==='serviced'?'Serviced apartments and SOHO count as residential only when used solely as a dwelling. The first-home exemption needs lawyer confirmation.':data.propertyType==='commercial'?'Commercial property does not qualify for the first-home exemption. Foreign purchasers pay 4% on non-residential transfers.':null;

  const results=<section className="mc-results" aria-labelledby="mc-results-title" aria-live="polite">
    <div className="eyebrow">YOUR ESTIMATE{data.projectName&&<> · {data.projectName}{data.unit&&` · ${data.unit}`}</>}</div>
    <h2 id="mc-results-title" className="mc-visually-hidden">Estimate results</h2>
    {!r?<div className="mc-empty"><p>Complete the highlighted fields to see your estimate:</p><ul>{Object.values(errors).map(e=><li key={e}>{e}</li>)}</ul></div>:<>
      <div className="mc-cards">
        <div className="mc-card mc-card-main"><span>Monthly mortgage instalment</span><strong>{money(r.payment)}</strong><small>{r.hasLoan?`${money(r.facility)} over ${r.years} yrs at ${pct(r.rate)}`:'No loan entered'}</small></div>
        <div className="mc-card"><span>Total monthly ownership cost</span><strong>{money(r.monthly.total)}</strong><small>Instalment + maintenance, taxes & bills</small></div>
        <div className="mc-card"><span>Total upfront cash required</span><strong>{money(t.cash)}</strong><small>Down payment + buyer-paid costs not financed</small></div>
        <div className="mc-card"><span>Remaining cash still needed</span><strong>{money(t.outstanding)}</strong><small>After {money(t.paid)} already paid</small></div>
      </div>
      {r.missing.length>0&&<p className="mc-alert" role="status"><strong>Incomplete estimate.</strong> Waiting for quotations: {r.missing.join(', ')}.</p>}
      <dl className="mc-dl">
        <div><dt>Purchase loan ({pct(r.margin)})</dt><dd>{money(r.loan)}</dd></div>
        {r.financedCosts>0&&<div><dt>Costs added to loan</dt><dd>{money(r.financedCosts)}</dd></div>}
        {r.financedCosts>0&&<div><dt>Total financed principal</dt><dd>{money(r.facility)}</dd></div>}
        <div><dt>Down payment</dt><dd>{money(r.downPayment)}</dd></div>
        <div><dt>Total interest</dt><dd>{money(r.totalInterest)}</dd></div>
        <div><dt>Total loan repayment</dt><dd>{money(r.totalRepayment)}</dd></div>
        <div><dt>Acquisition costs (excl. price)</dt><dd>{money(t.acquisition)}</dd></div>
        <div><dt>Cash needed now · later</dt><dd>{money(t.now)} · {money(t.later)}</dd></div>
      </dl>
      <div className="mc-actions">
        <button type="button" className="search-btn" onClick={copySummary}>Copy WhatsApp summary</button>
        <a className="outline" href={'https://wa.me/?text='+encodeURIComponent(summaryText())} target="_blank" rel="noopener noreferrer">Open in WhatsApp ↗</a>
        <button type="button" className="outline" onClick={()=>window.print()}>Print / save PDF</button>
      </div>
    </>}
    <div className="mc-actions mc-actions-quiet"><button type="button" className="outline" onClick={reset}>Reset</button><button type="button" className="outline" onClick={loadExample}>Load example values</button></div>
    <p className="mc-status" role="status">{status}</p>
  </section>;

  return <div className="mc">
    {data.example&&<p className="calculator-note mc-example"><strong>Example values.</strong> These figures are illustrations only — replace them with your own price, loan offer, quotations and bills.{initial.project&&' Project price is the starting-price assumption; confirm the actual unit price.'}</p>}
    <div className="mc-layout">
      <form className="mc-inputs" onSubmit={e=>e.preventDefault()} noValidate>
        <section><h2>1. Property</h2><div className="mc-grid">
          {field('projectName','Project name (optional)',{type:'text'})}
          {field('unit','Unit / layout (optional)',{type:'text'})}
          {field('price','Property price',{prefix:'RM',min:1,hint:num(data.price)>0?money(num(data.price)):'e.g. 650000'})}
          {select('state','State / location',STATES.map(s=>[s.id,s.label]))}
          {select('propertyType','Property type',[['strata','Condominium / apartment (residential)'],['landed','Landed house (residential)'],['serviced','Serviced apartment / SOHO (commercial title)'],['commercial','Shop / office / other non-residential']],{hint:residentialHint})}
          {data.propertyType==='serviced'&&choice('dwelling','Used solely as a dwelling?',[['yes','Yes'],['no','No']])}
          {choice('purchaseType','Purchase type',[['hda','Developer (HDA)'],['developer','Developer (non-HDA)'],['subsale','Subsale']],{hint:'HDA purchases use the reduced Table B legal-fee scale.'})}
          {field('marketValue','Assessed market value (optional)',{prefix:'RM',hint:'Duty is charged on the higher of price and market value.'})}
        </div></section>

        <section><h2>2. Financing</h2><div className="mc-grid">
          {field('margin','Loan margin',{suffix:'%',max:100})}
          {field('downPayment','Down payment',{prefix:'RM',hint:'Kept in sync with the loan margin.'})}
          {field('rate','Interest rate',{suffix:'% p.a.',max:20,hint:'Variable rates can change over the loan.'})}
          {field('years','Loan tenure',{suffix:'years',step:'1',min:1,max:35})}
        </div></section>

        <section><h2>3. Buyer & legal status</h2><div className="mc-grid">
          {choice('purchaser','Purchased by',[['individual','Individual(s)'],['company','Company']])}
          {data.purchaser==='individual'?choice('buyerStatus','Buyer status',[['citizen','Malaysian citizen'],['pr','Malaysian PR'],['foreigner','Foreigner']]):choice('companyType','Company type',[['local','Malaysian, locally controlled'],['foreignControlled','Malaysian, foreign-controlled'],['foreign','Foreign company']],{hint:'Company rules are applied separately; uncertain cases ask for a quote.'})}
          {data.purchaser==='individual'&&choice('firstHome','First residential home?',[['yes','Yes — never owned one'],['no','No'],['unsure','Not sure']],{hint:'Ownership by inheritance, gift or joint name counts. The exemption is only applied when every condition is met.'})}
          {data.propertyType==='serviced'&&data.firstHome==='yes'&&check('serviceConfirmed','My lawyer confirmed this serviced apartment / SOHO qualifies for the first-home exemption')}
          {field('spaDate','SPA date',{type:'date'})}
          {field('instrumentDate','Transfer instrument (MOT) date',{type:'date',hint:'Leave blank to use the SPA date. Foreign rates follow this date.'})}
          {choice('consentRequired','Title needs state consent to transfer?',[['no','No'],['yes','Yes'],['unsure','Not sure']],{hint:'Common for leasehold titles with a restriction in interest. Foreign purchases always need consent.'})}
        </div></section>

        <section><h2>4. Upfront costs & quotations</h2><p>Estimates fill in automatically. Open any item to enter your actual quotation, who pays, timing, and whether it’s paid.</p>
          <div className="mc-grid">{field('booking','Booking / earnest deposit already paid',{prefix:'RM',hint:'Counts towards the down payment, not on top of it.'})}</div>
          {r?<ul className="mc-items">{r.items.filter(i=>i.gross>0||i.exemption>0||i.missing||i.overridden||['spaDisb','stateConsent','insurance','deposits','other'].includes(i.id)).map(i=><li key={i.id} className={i.missing?'mc-missing':''}>
            <div className="mc-item-head"><div><strong>{i.label}</strong><span className="mc-tags">
              {i.missing&&<em className="tag-warn">Quote needed</em>}{i.overridden&&<em className="tag-quote">Your quote</em>}{!i.overridden&&!i.missing&&!i.fixed&&<em>Estimate</em>}
              {i.cover==='developer'&&<em>Developer pays</em>}{i.cover==='partial'&&i.covered>0&&<em>Developer covers {money(i.covered)}</em>}
              {i.financed>0&&<em>Financed</em>}{i.paid>0&&i.outstanding===0&&<em>Paid</em>}{i.cash>0&&<em>{i.timing==='now'?'Pay now':'Pay later'}</em>}</span></div>
              <strong className="mc-amt">{i.missing?'—':money(i.gross)}</strong></div>
            {(i.sst>0||i.exemption>0||i.id==='downPayment'&&i.paid>0||i.covered>0)&&<small className="mc-sub">
              {i.sst>0&&<>Fee {money(i.fee)} + SST {RULES.sst.rate*100}% {money(i.sst)}. </>}
              {i.exemption>0&&<>Before exemption {money(i.exemption)} → exempted under the first-home order. </>}
              {i.id==='downPayment'&&i.paid>0&&<>{money(i.paid)} already paid, including the booking deposit. </>}
              {i.covered>0&&<>Buyer pays {money(i.buyer)}. </>}</small>}
            <details className="mc-edit"><summary>Edit {i.fixed?'timing & status':'quote, payer & timing'}</summary><div className="mc-grid">
              {!i.fixed&&<div className="mc-field"><label htmlFor={'q-'+i.id}>Quoted amount{i.sst?' (incl. SST)':''}</label><div className="mc-input"><span aria-hidden="true">RM</span><input id={'q-'+i.id} type="number" inputMode="decimal" min="0" step="any" placeholder={i.missing?'Enter quotation':`Estimate ${money(i.fee+(i.overridden?0:i.sst))}`} value={i.override} onChange={e=>setItem(i.id,'override',e.target.value)}/></div>{i.overridden&&<button type="button" className="mc-link" onClick={()=>setItem(i.id,'override','')}>Use estimate instead</button>}</div>}
              <div className="mc-field"><label htmlFor={'c-'+i.id}>Who pays</label><div className="mc-input"><select id={'c-'+i.id} value={i.cover} onChange={e=>setItem(i.id,'cover',e.target.value)}><option value="buyer">Buyer pays</option><option value="developer">Developer pays in full</option><option value="partial">Developer covers part</option></select></div><small>A developer-paid fee is a promotion, not a tax exemption.</small></div>
              {i.cover==='partial'&&<div className="mc-field"><label htmlFor={'a-'+i.id}>Amount covered by developer</label><div className="mc-input"><span aria-hidden="true">RM</span><input id={'a-'+i.id} type="number" inputMode="decimal" min="0" step="any" value={i.coverAmount} onChange={e=>setItem(i.id,'coverAmount',e.target.value)}/></div></div>}
              <div className="mc-field"><label htmlFor={'t-'+i.id}>When</label><div className="mc-input"><select id={'t-'+i.id} value={i.timing} onChange={e=>setItem(i.id,'timing',e.target.value)}><option value="now">Pay now</option><option value="later">Pay later</option></select></div></div>
              <label className="mc-check"><input type="checkbox" checked={!!i.paid} onChange={e=>setItem(i.id,'paid',e.target.checked)}/>{i.id==='downPayment'?'Down payment fully paid':'Paid already'}</label>
              {i.financeable&&<label className="mc-check"><input type="checkbox" checked={!!i.financed} disabled={!r.hasLoan} onChange={e=>setItem(i.id,'financed',e.target.checked)}/>Add to the loan (financed)</label>}
            </div></details>
          </li>)}</ul>:<p className="calculator-note">Fix the property and financing fields above to see the itemised costs.</p>}
        </section>

        <section><h2>5. Monthly ownership costs</h2><p>Use actual bills where you have them; otherwise edit the estimates.</p><div className="mc-grid">
          {choice('maintMode','Maintenance fee',[['psf','RM per sqft'],['fixed','Fixed monthly']])}
          {data.maintMode==='psf'?<>{field('size','Built-up size',{suffix:'sqft'})}{field('maintRate','Maintenance rate',{prefix:'RM',suffix:'/ sqft'})}</>:field('maintFixed','Maintenance per month',{prefix:'RM'})}
          {check('sinkIncluded','Sinking fund already included in maintenance')}
          {!data.sinkIncluded&&<>{choice('sinkMode','Sinking fund',[['percent','% of maintenance'],['fixed','Fixed monthly']])}{data.sinkMode==='percent'?field('sinkPct','Sinking fund',{suffix:'% of maint.',hint:'Typically 10% of maintenance.'}):field('sinkFixed','Sinking fund per month',{prefix:'RM'})}</>}
          {field('assessment','Assessment tax per year',{prefix:'RM',hint:'Cukai taksiran'})}
          {field('quitRent','Quit / parcel rent per year',{prefix:'RM',hint:'Cukai tanah or cukai petak'})}
          {field('homeInsurance','Home / fire insurance per year',{prefix:'RM'})}
          {field('parking','Additional parking per month',{prefix:'RM'})}
          {field('monthlyOther','Other recurring costs per month',{prefix:'RM'})}
        </div></section>

        <section><h2>6. Optional: extra repayments</h2><div className="mc-grid">
          {field('extraMonthly','Extra repayment each month',{prefix:'RM'})}
          {field('lumpSum','One-off lump sum',{prefix:'RM'})}
          {field('lumpYear','Lump sum paid at end of year',{step:'1',min:1})}
        </div></section>

        <section><h2>7. Optional: under construction</h2>
          {check('underConstruction','Estimate progressive interest during construction')}
          {data.underConstruction&&<><p>Enter each stage’s share of the loan released and how long it lasts. Banks charge interest only on the amount released.</p>
            <div className="mc-stages" role="table" aria-label="Disbursement schedule"><div role="row" className="mc-stage-head"><span role="columnheader">Stage</span><span role="columnheader">% of loan released</span><span role="columnheader">Months</span><span/></div>
            {data.stages.map((s,i)=><div role="row" key={i}><input aria-label={`Stage ${i+1} name`} value={s.label} onChange={e=>setStage(i,'label',e.target.value)}/><input aria-label={`Stage ${i+1} percent of loan released`} type="number" inputMode="decimal" min="0" max="100" value={s.percent} onChange={e=>setStage(i,'percent',e.target.value)}/><input aria-label={`Stage ${i+1} months`} type="number" inputMode="numeric" min="0" value={s.months} onChange={e=>setStage(i,'months',e.target.value)}/><button type="button" className="mc-link" aria-label={`Remove stage ${i+1}`} onClick={()=>setData(d=>({...d,stages:d.stages.filter((_,j)=>j!==i)}))}>Remove</button></div>)}
            </div><button type="button" className="outline" onClick={()=>setData(d=>({...d,stages:[...d.stages,{label:'',percent:'',months:''}]}))}>+ Add stage</button></>}
        </section>
      </form>

      <aside className="mc-aside">{results}</aside>
    </div>

    {r&&<div className="mc-details">
      <details open><summary><h2>Upfront cost summary</h2></summary>
        <div className="mc-two">
          <dl className="mc-dl">
            <div><dt>Total acquisition costs (excl. price, buyer share)</dt><dd>{money(t.acquisition)}</dd></div>
            <div><dt>Developer-covered costs</dt><dd>{money(t.developer)}</dd></div>
            <div><dt>Buyer cash-paid (incl. down payment)</dt><dd>{money(t.cash)}</dd></div>
            <div><dt>Buyer costs financed in the loan</dt><dd>{money(t.financed)}</dd></div>
            <div><dt>SST on professional fees</dt><dd>{money(t.sst)}</dd></div>
            <div><dt>Already paid</dt><dd>{money(t.paid)}</dd></div>
            <div><dt>Cash needed now</dt><dd>{money(t.now)}</dd></div>
            <div><dt>Cash needed later</dt><dd>{money(t.later)}</dd></div>
          </dl>
          <div>
            <h3>Stamp duty</h3>
            <dl className="mc-dl">
              <div><dt>Transfer duty before exemptions</dt><dd>{money(r.stampDuty.transferGross)}</dd></div>
              <div><dt>Loan duty before exemptions</dt><dd>{money(r.stampDuty.loanGross)}</dd></div>
              <div><dt>Exemption savings</dt><dd>{money(r.stampDuty.exemption)}</dd></div>
              <div><dt>Stamp duty payable</dt><dd>{money(r.stampDuty.payable)}</dd></div>
            </dl>
            <p className="mc-fine">Transfer basis: {r.stampDuty.method}. Seller’s RPGT is not a buyer cost and is excluded.</p>
            {r.firstHome.requested&&<div className="mc-check-list"><h4>First-home exemption {r.firstHome.eligible?'— conditions met':'— not applied'}</h4><ul>{r.firstHome.checks.map(c=><li key={c.text} className={c.ok?'ok':'no'}><span aria-hidden="true">{c.ok?'✓':'✕'}</span><span className="mc-visually-hidden">{c.ok?'Met: ':'Not met: '}</span>{c.text}</li>)}</ul></div>}
          </div>
        </div>
        {r.warnings.length>0&&<ul className="mc-warnings">{r.warnings.map(w=><li key={w}>{w}</li>)}</ul>}
      </details>

      <details open><summary><h2>Monthly ownership cost</h2></summary>
        <dl className="mc-dl mc-narrow">{r.monthly.lines.map(([label,v])=><div key={label}><dt>{label}</dt><dd>{money(v)}</dd></div>)}<div className="mc-total"><dt>Total per month</dt><dd>{money(r.monthly.total)}</dd></div></dl>
      </details>

      {r.hasLoan&&<details open><summary><h2>Repayment details</h2></summary>
        <div className="mc-two">
          <YearChart years={years}/>
          <BalanceChart standard={yearly(r.schedule.rows)} accelerated={r.accelerated?years:null} facility={r.facility}/>
        </div>
        {r.accelerated&&<div className="mc-savings"><div><span>Interest saved</span><strong>{money(r.schedule.totalInterest-r.accelerated.totalInterest)}</strong></div><div><span>Loan paid off sooner by</span><strong>{duration(r.schedule.months-r.accelerated.months)}</strong></div><div><span>New payoff time</span><strong>{duration(r.accelerated.months)}</strong></div><p className="mc-fine">Assumes the bank applies extra repayments to principal with no fees or lock-in penalties, and the rate does not change.</p></div>}
        <h3>Compare tenures and rates</h3>
        <Comparison data={comparisons(r.facility,r.rate,r.years)} rate={r.rate} years={r.years}/>
        <h3>Repayment schedule{r.accelerated?' (with extra repayments)':''}</h3>
        <div className="mc-table-wrap"><table className="mc-table"><thead><tr><th scope="col">Year</th><th scope="col">Instalments</th>{r.accelerated&&<th scope="col">Extra</th>}<th scope="col">Principal</th><th scope="col">Interest</th><th scope="col">Balance</th></tr></thead>
          <tbody>{years.map(y=>[<tr key={y.year} className="mc-year"><th scope="row"><button type="button" aria-expanded={openYear===y.year} onClick={()=>setOpenYear(openYear===y.year?null:y.year)}>{openYear===y.year?'▾':'▸'} Year {y.year}</button></th><td>{money(y.payment)}</td>{r.accelerated&&<td>{money(y.extra)}</td>}<td>{money(y.principal)}</td><td>{money(y.interest)}</td><td>{money(y.balance)}</td></tr>,
            ...(openYear===y.year?y.months.map(m=><tr key={y.year+'-'+m.month} className="mc-month"><th scope="row">Month {m.month}</th><td>{money(m.payment)}</td>{r.accelerated&&<td>{money(m.extra)}</td>}<td>{money(m.principal)}</td><td>{money(m.interest)}</td><td>{money(m.balance)}</td></tr>):[])])}</tbody></table></div>
        {r.construction&&<><h3>Progressive interest during construction</h3><p className="mc-fine">Interest-only estimate on the amount released at each stage. This is different from the full instalment of {money(r.payment)} that starts after full disbursement.</p>
          <div className="mc-table-wrap"><table className="mc-table"><thead><tr><th scope="col">Stage</th><th scope="col">Cumulative released</th><th scope="col">Amount drawn</th><th scope="col">Months</th><th scope="col">Est. monthly interest</th></tr></thead><tbody>{r.construction.rows.map((s,i)=><tr key={i}><th scope="row">{s.label}</th><td>{pct(s.cumulative)}</td><td>{money(s.drawn)}</td><td>{s.months}</td><td>{money(s.monthly)}</td></tr>)}</tbody>
          <tfoot><tr><th scope="row">Total over {r.construction.months} months</th><td colSpan={3}/><td>{money(r.construction.total)}</td></tr></tfoot></table></div></>}
      </details>}

      <details><summary><h2>Rules & assumptions</h2></summary>
        <p className="mc-fine">Last checked {LAST_VERIFIED}. All figures are estimates based on your entries. Variable rates may change, and final fees, exemptions and lending terms are set by the relevant authorities, your lawyer and your bank.</p>
        <div className="mc-rules">{Object.entries(RULES).map(([key,rule])=><article key={key}><h4>{rule.title} <em className={'tag-'+rule.status}>{STATUS[rule.status]}</em></h4><p>{rule.text}</p>{rule.note&&<p className="mc-fine">{rule.note}</p>}{rule.sources.length>0&&<p className="mc-fine">Sources: {rule.sources.map((s,i)=><span key={s.url}>{i>0&&' · '}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>)}</p>}</article>)}</div>
      </details>
    </div>}

    {r&&<div className="mc-mobile-bar" aria-hidden="true"><div><span>Monthly</span><strong>{money(r.payment)}</strong></div><div><span>Upfront cash</span><strong>{money(t.cash)}</strong></div></div>}

    {r&&<div className="mc-print"><h2>Property cost estimate{data.projectName&&` — ${data.projectName}`}{data.unit&&` (${data.unit})`}</h2>
      <p>Prepared {today()} · {STATES.find(s=>s.id===data.state)?.label} · {data.purchaseType==='hda'?'Developer purchase (HDA)':data.purchaseType==='developer'?'Developer purchase (non-HDA)':'Subsale'}</p>
      <table className="mc-table"><tbody>{[['Property price',money(r.price)],['Loan',`${money(r.loan)} (${pct(r.margin)})`],['Total financed principal',money(r.facility)],['Rate / tenure',`${pct(r.rate)} p.a. / ${r.years} years`],['Monthly instalment',money(r.payment)],['Total monthly ownership cost',money(r.monthly.total)],['Total upfront cash required',money(t.cash)],['Remaining cash needed',money(t.outstanding)],['Total interest',money(r.totalInterest)]].map(([a,b])=><tr key={a}><th scope="row">{a}</th><td>{b}</td></tr>)}</tbody></table>
      <h3>Upfront costs</h3><table className="mc-table"><thead><tr><th>Item</th><th>Amount</th><th>Developer</th><th>Buyer cash</th><th>Financed</th><th>Basis</th></tr></thead><tbody>{r.items.filter(i=>i.gross>0||i.missing).map(i=><tr key={i.id}><th scope="row">{i.label}</th><td>{i.missing?'Quote needed':money(i.gross)}</td><td>{money(i.covered)}</td><td>{money(i.cash)}</td><td>{money(i.financed)}</td><td>{i.missing?'—':i.overridden?'Quotation':i.fixed?'Calculated':'Estimate'}</td></tr>)}</tbody></table>
      <h3>Monthly costs</h3><table className="mc-table"><tbody>{r.monthly.lines.map(([a,v])=><tr key={a}><th scope="row">{a}</th><td>{money(v)}</td></tr>)}</tbody></table>
      {r.missing.length>0&&<p><strong>Incomplete:</strong> awaiting quotations for {r.missing.join(', ')}.</p>}
      <p className="mc-fine">Estimates based on the entered assumptions (rules last checked {LAST_VERIFIED}). Variable rates may change; final fees, exemptions and lending terms depend on the relevant authorities, lawyer and bank.</p>
    </div>}
  </div>;
}

function Legend({items}){return <div className="mc-legend">{items.map(([label,color,dashed])=><span key={label}><i style={dashed?{borderTop:`2px dashed ${color}`,height:0,background:'none'}:{background:color}}/>{label}</span>)}</div>}

function YearChart({years}){
  const [hover,setHover]=useState(null),W=640,H=240,L=48,R=8,T=12,B=26,iw=W-L-R,ih=H-T-B;
  const max=niceMax(Math.max(1,...years.map(d=>d.principal+d.extra+d.interest))),step=iw/Math.max(1,years.length),bw=Math.max(2,Math.min(26,step-2)),y=v=>T+ih-v/max*ih,every=years.length>20?5:years.length>10?2:1;
  const d=hover!=null?years[hover]:null;
  return <figure className="mc-chart"><figcaption>Principal vs interest paid each year</figcaption><Legend items={[['Principal',PRINCIPAL],['Interest',INTEREST]]}/>
    <div className="mc-plot" onMouseLeave={()=>setHover(null)}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Stacked bars of principal and interest paid per year. The repayment schedule table below has the same figures.">
      {[0,.25,.5,.75,1].map(f=><g key={f}><line x1={L} x2={W-R} y1={y(f*max)} y2={y(f*max)} className="mc-grid-line"/><text x={L-6} y={y(f*max)+4} textAnchor="end" className="mc-axis">{short(f*max)}</text></g>)}
      {years.map((v,i)=>{const x=L+i*step+(step-bw)/2,p=v.principal+v.extra,pTop=y(p),iTop=y(p+v.interest),dim=hover!=null&&hover!==i;return <g key={v.year} opacity={dim?.4:1}>
        {v.interest>0.5?<rect x={x} y={pTop} width={bw} height={Math.max(0,y(0)-pTop)} fill={PRINCIPAL}/>:<path d={topRounded(x,pTop,bw,y(0)-pTop,4)} fill={PRINCIPAL}/>}
        {v.interest>0.5&&<path d={topRounded(x,iTop,bw,Math.max(0,pTop-2-iTop),4)} fill={INTEREST}/>}
        {(v.year===1||v.year%every===0)&&<text x={x+bw/2} y={H-8} textAnchor="middle" className="mc-axis">{v.year}</text>}
        <rect x={L+i*step} y={T} width={step} height={ih} fill="transparent" onMouseEnter={()=>setHover(i)}/></g>})}
    </svg>{d&&<div className="mc-tip" style={{left:`${(L+(hover+.5)*step)/W*100}%`}}><strong>Year {d.year}</strong><span>Principal {money(d.principal+d.extra)}</span><span>Interest {money(d.interest)}</span></div>}</div></figure>;
}

function BalanceChart({standard,accelerated,facility}){
  const [hover,setHover]=useState(null),W=640,H=240,L=48,R=8,T=12,B=26,iw=W-L-R,ih=H-T-B,n=standard.length,max=niceMax(facility);
  const x=i=>L+i/Math.max(1,n)*iw,y=v=>T+ih-v/max*ih,line=s=>[`M${x(0)},${y(facility)}`,...s.map((v,i)=>`L${x(i+1)},${y(v.balance)}`)].join(''),every=n>20?5:n>10?2:1;
  return <figure className="mc-chart"><figcaption>Outstanding balance over time</figcaption>{accelerated?<Legend items={[['Standard schedule',PRINCIPAL],['With extra repayments',ALT,true]]}/>:<div className="mc-legend"/>}
    <div className="mc-plot" onMouseLeave={()=>setHover(null)}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart of the outstanding loan balance at the end of each year.">
      {[0,.25,.5,.75,1].map(f=><g key={f}><line x1={L} x2={W-R} y1={y(f*max)} y2={y(f*max)} className="mc-grid-line"/><text x={L-6} y={y(f*max)+4} textAnchor="end" className="mc-axis">{short(f*max)}</text></g>)}
      {standard.map((v,i)=>(v.year===1||v.year%every===0)&&<text key={v.year} x={x(i+1)} y={H-8} textAnchor="middle" className="mc-axis">{v.year}</text>)}
      <path d={line(standard)+`L${x(n)},${y(0)}L${x(0)},${y(0)}Z`} fill={PRINCIPAL} opacity=".08"/>
      <path d={line(standard)} fill="none" stroke={PRINCIPAL} strokeWidth="2" strokeLinejoin="round"/>
      {accelerated&&<path d={line(accelerated)} fill="none" stroke={ALT} strokeWidth="2" strokeDasharray="6 4" strokeLinejoin="round"/>}
      {hover!=null&&<><line x1={x(hover+1)} x2={x(hover+1)} y1={T} y2={T+ih} className="mc-crosshair"/><circle cx={x(hover+1)} cy={y(standard[hover].balance)} r="4" fill={PRINCIPAL} stroke="#fff" strokeWidth="2"/>{accelerated?.[hover]&&<circle cx={x(hover+1)} cy={y(accelerated[hover].balance)} r="4" fill={ALT} stroke="#fff" strokeWidth="2"/>}</>}
      {standard.map((v,i)=><rect key={v.year} x={x(i+.5)} y={T} width={iw/n} height={ih} fill="transparent" onMouseEnter={()=>setHover(i)}/>)}
    </svg>{hover!=null&&<div className="mc-tip" style={{left:`${x(hover+1)/W*100}%`}}><strong>End of year {hover+1}</strong><span>Balance {money(standard[hover].balance)}</span>{accelerated&&<span>With extras {money(accelerated[hover]?.balance??0)}</span>}</div>}</div></figure>;
}

function Comparison({data,rate,years}){return <div className="mc-table-wrap"><table className="mc-table mc-compare"><caption className="mc-visually-hidden">Monthly instalment by tenure and interest rate</caption><thead><tr><th scope="col">Tenure</th>{data.rates.map(r=><th scope="col" key={r}>{pct(r)}{r===Math.round((rate+1)*100)/100?' (+1 pp)':r===rate?' (yours)':''}</th>)}</tr></thead>
  <tbody>{data.cells.map((row,i)=><tr key={data.tenures[i]}><th scope="row">{data.tenures[i]} years</th>{row.map(c=><td key={c.rate} className={c.rate===rate&&c.tenure===years?'mc-current':''}><strong>{money(c.payment)}</strong><small>Interest {money(c.interest)}</small></td>)}</tr>)}</tbody></table></div>}
