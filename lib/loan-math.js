import {RULES} from './property-rules.js';
export const ceilTo=(value,step)=>Math.ceil(value/step-1e-9)*step;
export function monthlyPayment(principal,annualRate,years){const months=Math.round(years*12),rate=annualRate/100/12;if(!(principal>0)||!(months>0))return 0;return rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months))}
// Duty charged per `roundTo` or part thereof within each band, as the Stamp Act schedules are worded.
export function bandDuty(value,bands,roundTo=100){let remaining=Math.max(0,value),total=0;for(const [width,rate] of bands){const amount=Math.min(remaining,width);if(amount>0)total+=ceilTo(amount,roundTo)*rate;remaining-=amount;if(remaining<=0)break}return total}
export const transferDuty=value=>bandDuty(value,RULES.transferDuty.bands,RULES.transferDuty.roundTo);
export const flatDuty=(value,rate,roundTo=100)=>ceilTo(Math.max(0,value),roundTo)*rate;
export const loanStampDuty=amount=>flatDuty(amount,RULES.loanDuty.rate,RULES.loanDuty.roundTo);
// SRO 2023 Table A, with the minimum fee; HDA purchases scale the whole Table A fee by the Table B bracket.
export function scaleFee(value,{hda=null}={}){const {tableA,minimum}=RULES.legalFees;if(!(value>0))return 0;const full=Math.max(minimum,bandDuty(value,tableA,1));if(!hda)return full;const [,factor]=RULES.legalFees[hda].find(([limit])=>value<=limit);return factor==='flat'?minimum:Math.max(minimum,full*factor)}
export function valuationFee(value){const {bands,minimum}=RULES.valuation;return value>0?Math.max(minimum,bandDuty(value,bands,1)):0}
// Monthly reducing-balance schedule. Extra repayments shorten the tenure; the instalment stays fixed.
export function amortise(principal,annualRate,years,{extraMonthly=0,lumpSum=0,lumpMonth=0}={}){
  const payment=monthlyPayment(principal,annualRate,years),rate=annualRate/100/12,limit=Math.round(years*12),rows=[];
  let balance=principal>0?principal:0,totalInterest=0;
  for(let month=1;month<=limit&&balance>0.005;month++){
    const interest=balance*rate,scheduled=Math.min(balance+interest,payment),capital=scheduled-interest;
    balance-=capital;
    const extra=Math.min(balance,Math.max(0,extraMonthly)+(month===lumpMonth?Math.max(0,lumpSum):0));
    balance-=extra;totalInterest+=interest;
    rows.push({month,payment:scheduled,interest,principal:capital,extra,balance:Math.max(0,balance)});
  }
  return {payment,rows,months:rows.length,totalInterest,totalPaid:(principal>0?principal:0)+totalInterest};
}
export function yearly(rows){const years=[];for(const r of rows){const i=Math.ceil(r.month/12)-1;years[i]??={year:i+1,payment:0,interest:0,principal:0,extra:0,balance:0,months:[]};const y=years[i];y.payment+=r.payment;y.interest+=r.interest;y.principal+=r.principal;y.extra+=r.extra;y.balance=r.balance;y.months.push(r)}return years}
