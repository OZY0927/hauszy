import {legalFee} from './upfront-cash.js';
import {transferDuty} from './loan-math.js';
const cents=value=>Math.round((value+Number.EPSILON)*100)/100;
const supplied=value=>value!==''&&value!==undefined&&value!==null;
export const purchaseFeeRows=[
 {id:'spaLegal',label:'SPA Legal Fee',kind:'legal'},
 {id:'spaDisbursement',label:'SPA Disbursement Fee'},
 {id:'spaStamp',label:'SPA Stamp Duty',note:'Separate SPA stamping only; do not duplicate MOT duty.'},
 {id:'loanLegal',label:'Loan Legal Fee',kind:'legal',loanOnly:true},
 {id:'loanDisbursement',label:'Loan Disbursement Fee',loanOnly:true},
 {id:'loanStamp',label:'Loan Stamp Duty',loanOnly:true},
 {id:'pdcConsent',label:'PDC Consent Fee',note:'Project / developer consent charge, if applicable.'},
 {id:'motLegal',label:'MOT Legal Fee & Disbursement',note:'Only if separately chargeable; avoid duplicating work included in SPA fees.'},
 {id:'motStamp',label:'MOT Stamp Duty'},
 {id:'stateConsent',label:'State Consent & Foreigner Levy',note:'State- and property-specific; enter the confirmed charge.'}
];
export function applicablePurchaseFees(data){
 return purchaseFeeRows.filter(row=>(data.payment!=='cash'||!row.loanOnly)&&(row.id!=='stateConsent'||data.buyer==='foreign'||data.stateConsentRequired===true)).map(row=>row.id==='stateConsent'&&data.buyer==='local'?{...row,label:'State Consent Fee',note:'Only where your solicitor confirms state consent is required.'}:row);
}
export function purchaseBudget(data,fees={}){
 const price=Number(data.price),cash=data.payment==='cash',margin=cash?0:Number(data.margin);
 if(!Number.isFinite(price)||price<=0||price>100000000)throw Error('Enter a property price between RM1 and RM100 million.');
 if(!cash&&(!supplied(data.margin)||!Number.isFinite(margin)||margin<=0||margin>100))throw Error('Loan margin must be above 0% and up to 100%.');
 const loan=cash?0:cents(price*margin/100),contribution=cents(price-loan),local=data.buyer==='local';
 const qualifies=local&&data.firstHome==='yes'&&data.reliefConfirmed===true&&price<=500000;
 const legal=value=>{const fee=legalFee(value,true);return fee===null?null:cents(fee*1.08)};
 const transfer=local?transferDuty(price):cents(Math.ceil(price/100)*8),loanStamp=cash?0:cents(Math.ceil(loan/100)*.5);
 const automatic={spaLegal:legal(price),loanLegal:cash?0:legal(loan),loanStamp,motStamp:transfer};
 const rows=applicablePurchaseFees(data).map(row=>{
  const settings=fees[row.id]||{};
  for(const key of ['amount','coverageAmount'])if(supplied(settings[key])&&(!Number.isFinite(Number(settings[key]))||Number(settings[key])<0))throw Error(row.label+': enter an amount of RM0 or more.');
  const quoted=supplied(settings.amount),gross=quoted?cents(Number(settings.amount)):(automatic[row.id]??null);
  const relief=qualifies&&['motStamp','loanStamp'].includes(row.id);
  const due=relief?0:gross;
  const coverage=data.allCovered?'full':settings.coverage||'none';
  const covered=due===null?null:coverage==='full'?due:coverage==='partial'?Math.min(due,cents(Number(settings.coverageAmount)||0)):0;
  return {...row,gross,due,covered,payable:due===null?null:cents(due-covered),quoted,relief,coverage};
 });
 const grossTotal=cents(rows.reduce((sum,row)=>sum+(row.due||0),0)),developerPays=cents(rows.reduce((sum,row)=>sum+(row.covered||0),0)),buyerFees=cents(rows.reduce((sum,row)=>sum+(row.payable||0),0));
 return {loan,contribution,rows,grossTotal,developerPays,buyerFees,total:cents(contribution+buyerFees),qualifies,reliefSavings:cents(rows.reduce((sum,row)=>sum+(row.relief?(row.gross||0):0),0)),missing:rows.filter(row=>row.payable===null&&row.coverage!=='full').map(row=>row.label),coveredUnknown:rows.filter(row=>row.due===null&&row.coverage==='full').map(row=>row.label)};
}
