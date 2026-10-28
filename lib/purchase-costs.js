import {RULES,STATES} from './property-rules.js';
import {amortise,flatDuty,loanStampDuty,monthlyPayment,scaleFee,transferDuty,valuationFee} from './loan-math.js';

export const COST_ITEMS=[
  {id:'downPayment',label:'Down payment',fixed:true},
  {id:'transferDuty',label:'Property transfer stamp duty (MOT)'},
  {id:'loanDuty',label:'Loan agreement stamp duty'},
  {id:'spaLegal',label:'SPA / conveyancing legal fees',sst:true,financeable:true},
  {id:'loanLegal',label:'Loan documentation legal fees',sst:true,financeable:true},
  {id:'valuation',label:'Valuation fee',sst:true,financeable:true},
  {id:'spaDisb',label:'SPA disbursements, searches & registration'},
  {id:'loanDisb',label:'Loan disbursements & charge registration'},
  {id:'stateConsent',label:'State consent fee'},
  {id:'foreignLevy',label:'Foreign buyer consent fee / levy'},
  {id:'insurance',label:'MRTA / MLTA / mortgage takaful',financeable:true},
  {id:'deposits',label:'Utility & management deposits'},
  {id:'other',label:'Other expenses'}
];
export const num=value=>{const n=Number(String(value??'').replace(/,/g,''));return Number.isFinite(n)?n:0};
const has=value=>String(value??'').trim()!=='';
const inWindow=(date,{from,to})=>date&&date>=from&&(!to||date<=to);

export function validate(input){
  const e={},price=num(input.price),margin=num(input.margin),rate=num(input.rate),years=num(input.years);
  if(!has(input.price)||!(price>0))e.price='Enter a property price above RM0.';else if(price>100000000)e.price='Enter a price of RM100 million or less.';
  if(!has(input.margin)||margin<0||margin>100)e.margin='Loan margin must be between 0% and 100%.';
  if(margin>0){
    if(!has(input.rate)||rate<0||rate>20)e.rate='Enter an interest rate between 0% and 20%.';
    if(!has(input.years)||!Number.isInteger(years)||years<1||years>35)e.years='Tenure must be a whole number from 1 to 35 years.';
  }
  if(num(input.marketValue)<0)e.marketValue='Market value cannot be negative.';
  if(num(input.booking)<0)e.booking='Booking deposit cannot be negative.';
  else if(price>0&&num(input.booking)>price*(1-margin/100)+0.005)e.booking='The booking deposit is part of the down payment and cannot exceed it.';
  if(input.instrumentDate&&input.spaDate&&input.instrumentDate<input.spaDate)e.instrumentDate='The transfer is normally dated on or after the SPA.';
  return e;
}

export function firstHomeCheck(input,dutiableValue){
  const r=RULES.firstHome,date=input.spaDate,window=r.windows.find(w=>inWindow(date,w)),residential=isResidential(input),serviced=input.propertyType==='serviced';
  const checks=[
    {ok:input.purchaser==='individual',text:'Bought by individuals, not a company'},
    {ok:input.buyerStatus==='citizen',text:'Every purchaser is a Malaysian citizen'},
    {ok:input.firstHome==='yes',text:'No purchaser has ever owned residential property (including inherited, gifted or jointly owned)'},
    {ok:residential&&(!serviced||input.serviceConfirmed),text:serviced?'Serviced apartment / SOHO: lawyer confirmed it qualifies as a residential home':'Residential property'},
    {ok:dutiableValue>0&&dutiableValue<=r.cap,text:`Price and market value at or below RM${r.cap.toLocaleString('en-MY')}`},
    {ok:!!window,text:'SPA executed within a qualifying window (2021–2027)'}
  ];
  return {requested:input.firstHome==='yes',eligible:checks.every(c=>c.ok),checks,window};
}

export const isResidential=input=>input.propertyType==='landed'||input.propertyType==='strata'||(input.propertyType==='serviced'&&input.dwelling==='yes');
const isForeignBuyer=input=>input.purchaser==='company'?input.companyType==='foreign':input.buyerStatus==='foreigner';

export function transferDutyFor(input){
  const price=num(input.price),base=Math.max(price,num(input.marketValue)),date=input.instrumentDate||input.spaDate||new Date().toISOString().slice(0,10),notes=[];
  if(input.purchaser==='company'&&input.companyType==='foreignControlled')return {base,gross:0,quote:true,method:'Quotation required — foreign-controlled Malaysian company',notes};
  if(isForeignBuyer(input)){
    const period=RULES.foreignTransfer.periods.find(p=>date>=p.from);
    if(period){
      const residential=isResidential(input),rate=residential?period.residential:period.nonResidential;
      if(input.spaDate&&input.spaDate<'2026-01-01'&&date>='2026-01-01'&&residential)notes.push('SPA signed before 2026 but transfer dated 2026 or later: whether 8% or 4% applies awaits LHDN clarification.');
      return {base,gross:flatDuty(base,rate,RULES.foreignTransfer.roundTo),method:`Foreign purchaser flat ${rate*100}% (${residential?'residential':'non-residential'}, transfer dated ${date||'today'})`,notes};
    }
  }
  return {base,gross:transferDuty(base),method:'Progressive scale 1% / 2% / 3% / 4%',notes};
}

const defaults={cover:'buyer',coverAmount:'',timing:'now',paid:false,financed:false,override:''};
export const itemSettings=(input,id)=>({...defaults,timing:defaultTiming(input,id),...(input.items?.[id]||{})});
function defaultTiming(input,id){if(id==='deposits')return 'later';if(id==='transferDuty'&&input.purchaseType==='hda')return 'later';return 'now'}

export function computeEstimate(input){
  const price=num(input.price),margin=Math.min(100,Math.max(0,num(input.margin))),rate=num(input.rate),years=num(input.years),booking=num(input.booking);
  const state=STATES.find(s=>s.id===input.state)||STATES[0],inScale=state.legal==='SRO2023',hda=input.purchaseType==='hda';
  const loan=price*margin/100,downPayment=price-loan,hasLoan=loan>0;
  const duty=transferDutyFor(input),home=firstHomeCheck(input,duty.base);
  const exempt=home.requested&&home.eligible;
  const maintenance=monthlyMaintenance(input),warnings=[...duty.notes];
  const estimates={
    downPayment:()=>downPayment,
    transferDuty:()=>duty.gross,
    spaLegal:()=>inScale?scaleFee(Math.max(price,num(input.marketValue)),{hda:hda?'hdaSpa':null}):0,
    valuation:()=>hasLoan?valuationFee(Math.max(price,num(input.marketValue))):0,
    spaDisb:()=>RULES.placeholders.spaDisbursements,
    loanDisb:()=>hasLoan?RULES.placeholders.loanDisbursements:0,
    stateConsent:()=>0,foreignLevy:()=>0,insurance:()=>0,other:()=>0,
    deposits:()=>RULES.placeholders.utilityDeposits+Math.round((maintenance.maintenance+maintenance.sinking)*RULES.placeholders.advanceMonths)
  };
  const needsQuote={
    transferDuty:duty.quote,
    spaLegal:!inScale,loanLegal:!inScale&&hasLoan,
    stateConsent:(input.purchaser==='individual'&&input.buyerStatus==='foreigner')||(input.purchaser==='company'&&input.companyType!=='local')||['yes','unsure'].includes(input.consentRequired),
    foreignLevy:isForeignBuyer(input)||input.purchaser==='company'&&input.companyType==='foreignControlled'
  };
  // Loan duty and loan legal fees depend on the total facility, which grows when fees are financed.
  let financedCosts=0,items=[];
  for(let pass=0;pass<8;pass++){
    const facility=loan+financedCosts;
    estimates.loanDuty=()=>hasLoan?loanStampDuty(facility):0;
    estimates.loanLegal=()=>hasLoan&&inScale?scaleFee(facility,{hda:hda?'hdaLoan':null}):0;
    items=COST_ITEMS.map(def=>buildItem(def,input,{estimates,needsQuote,exempt,hasLoan,booking}));
    const next=items.reduce((s,i)=>s+i.financed,0);
    if(Math.abs(next-financedCosts)<0.005)break;
    financedCosts=next;
  }
  const facility=loan+financedCosts;
  const transferItem=items.find(i=>i.id==='transferDuty'),loanDutyItem=items.find(i=>i.id==='loanDuty');
  const stampDuty={
    transferGross:transferItem.gross+transferItem.exemption,loanGross:loanDutyItem.gross+loanDutyItem.exemption,
    exemption:transferItem.exemption+loanDutyItem.exemption,payable:transferItem.gross+loanDutyItem.gross,method:duty.method
  };
  const extraMonthly=num(input.extraMonthly),lumpSum=num(input.lumpSum),lumpMonth=Math.max(1,Math.round(num(input.lumpYear)))*12;
  const schedule=amortise(facility,rate,years),accelerated=(extraMonthly>0||lumpSum>0)?amortise(facility,rate,years,{extraMonthly,lumpSum,lumpMonth}):null;
  const sum=(key,filter=()=>true)=>items.filter(filter).reduce((s,i)=>s+i[key],0);
  const monthly=monthlyCosts(input,schedule.payment,maintenance);
  if(isForeignBuyer(input)&&state.foreignMin){const kind=input.propertyType==='landed'?'landed':'strata',min=state.foreignMin[kind];if(min&&price<min)warnings.push(`Reported ${state.label} minimum for foreign purchase of ${kind} property is RM${min.toLocaleString('en-MY')}. Confirm with the state authority before proceeding.`)}
  if(input.propertyType==='serviced'&&home.requested&&!input.serviceConfirmed)warnings.push('Serviced apartments and SOHO need lawyer confirmation before the first-home exemption is applied.');
  if(exempt&&home.window?.status==='announced')warnings.push('First-home exemption for 2026–2027 SPAs follows the Budget 2026 announcement. Confirm the gazetted order with your lawyer.');
  if(!inScale)warnings.push(`${state.label} is outside the Peninsular Malaysia SRO 2023 scale. Enter the lawyer’s quoted fees.`);
  if(facility>RULES.legalFees.negotiableAbove||price>RULES.legalFees.negotiableAbove)warnings.push('Legal fees above RM7.5 million are negotiable; the estimate uses the 1% cap.');
  if(years>0&&hasLoan&&years>30)warnings.push('Banks usually cap tenure by borrower age (often at 70). Check the tenure you qualify for.');
  return {
    price,margin,loan,downPayment,facility,financedCosts,rate,years,booking,hasLoan,
    payment:schedule.payment,totalInterest:schedule.totalInterest,totalRepayment:schedule.totalPaid,schedule,accelerated,
    items,stampDuty,firstHome:home,state,inScale,warnings,monthly,
    missing:items.filter(i=>i.missing).map(i=>i.label),
    totals:{
      acquisition:sum('buyer',i=>i.id!=='downPayment'),
      acquisitionGross:sum('gross',i=>i.id!=='downPayment'),
      developer:sum('covered'),buyer:sum('buyer'),financed:sum('financed'),cash:sum('cash'),
      paid:sum('paid'),outstanding:sum('outstanding'),now:sum('outstanding',i=>i.timing==='now'),later:sum('outstanding',i=>i.timing==='later'),
      sst:sum('sst')
    },
    construction:input.underConstruction?progressiveInterest(input.stages||[],facility,rate):null
  };
}

function buildItem(def,input,{estimates,needsQuote,exempt,hasLoan,booking}){
  const s=itemSettings(input,def.id),overridden=!def.fixed&&has(s.override),quote=!!needsQuote[def.id];
  let base=overridden?Math.max(0,num(s.override)):estimates[def.id](),exemption=0;
  if(!overridden&&exempt&&(def.id==='transferDuty'||def.id==='loanDuty')){exemption=base;base=0}
  const sst=def.sst&&!overridden?base*RULES.sst.rate:0,gross=base+sst;
  const covered=s.cover==='developer'?gross:s.cover==='partial'?Math.min(gross,Math.max(0,num(s.coverAmount))):0;
  const buyer=gross-covered,financed=def.financeable&&s.financed&&hasLoan?buyer:0,cash=buyer-financed;
  const paid=def.id==='downPayment'?(s.paid?cash:Math.min(booking,cash)):s.paid?cash:0;
  return {...def,...s,overridden,estimate:!overridden,missing:quote&&!overridden,quote,fee:base,sst,gross,exemption,covered,buyer,financed,cash,paid,outstanding:cash-paid};
}

export function monthlyMaintenance(input){
  const maintenance=input.maintMode==='fixed'?num(input.maintFixed):num(input.size)*num(input.maintRate);
  const sinking=input.sinkIncluded?0:input.sinkMode==='fixed'?num(input.sinkFixed):maintenance*num(input.sinkPct)/100;
  return {maintenance,sinking};
}
function monthlyCosts(input,payment,{maintenance,sinking}){
  const lines=[
    ['Mortgage instalment',payment],['Maintenance fee',maintenance],['Sinking fund',sinking],
    ['Assessment tax (cukai taksiran)',num(input.assessment)/12],['Quit / parcel rent (cukai tanah / petak)',num(input.quitRent)/12],
    ['Home / fire insurance',num(input.homeInsurance)/12],['Additional parking',num(input.parking)],['Other recurring costs',num(input.monthlyOther)]
  ];
  return {lines,total:lines.reduce((s,[,v])=>s+v,0)};
}
export function progressiveInterest(stages,facility,annualRate){
  let cumulative=0,total=0,elapsed=0;
  const rows=stages.filter(s=>num(s.percent)>0||num(s.months)>0).map(s=>{
    cumulative=Math.min(100,cumulative+Math.max(0,num(s.percent)));
    const months=Math.max(0,num(s.months)),drawn=facility*cumulative/100,monthly=drawn*annualRate/100/12;
    total+=monthly*months;elapsed+=months;
    return {label:s.label||'Stage',cumulative,drawn,months,monthly};
  });
  return {rows,total,months:elapsed};
}
export function comparisons(facility,rate,years){
  const tenures=[...new Set([years-5,years,years+5].filter(t=>t>=5&&t<=35))],rates=[...new Set([Math.max(0,rate-0.5),rate,rate+1].map(r=>Math.round(r*100)/100))];
  return {tenures,rates,cells:tenures.map(t=>rates.map(r=>{const p=monthlyPayment(facility,r,t);return {tenure:t,rate:r,payment:p,interest:p*t*12-facility}}))};
}
