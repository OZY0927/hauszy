import {transferDuty} from './loan-math.js';
const cents=value=>Math.round((value+Number.EPSILON)*100)/100;
const supplied=value=>value!==''&&value!==null&&value!==undefined;
const quote=(value,fallback)=>supplied(value)?Number(value):fallback;
export function legalFee(amount,hda=true){
 if(!(amount>0))return 0;
 // The excess above RM7.5m is negotiated; require a quotation instead of inventing it.
 if(amount>7500000)return null;
 const scale=Math.max(500,Math.min(amount,500000)*.0125+Math.max(0,amount-500000)*.01);
 if(!hda)return scale;
 if(amount<=50000)return 500;
 if(amount<=250000)return Math.max(500,scale*.75);
 return scale*(amount<=500000?.70:amount<=1000000?.65:.50);
}
export const extraCosts=[['consent','State consent / foreign-buyer levy'],['valuation','Valuation fee'],['disbursements','Searches, registration & disbursements'],['insurance','Upfront insurance / takaful'],['other','Other upfront costs']];
export function upfrontCash(data){
 const price=Number(data.price),cash=data.payment==='cash',margin=cash?0:Number(data.margin);
 if(!Number.isFinite(price)||price<=0||price>100000000)throw Error('Enter a property price between RM1 and RM100 million.');
 if(!cash&&(!supplied(data.margin)||!Number.isFinite(margin)||margin<=0||margin>100))throw Error('Enter a loan margin above 0% and up to 100%.');
 for(const key of ['marketValue','spaQuote','loanQuote','dutyQuote','loanDutyQuote',...extraCosts.map(([key])=>key)])if(supplied(data[key])&&(!Number.isFinite(Number(data[key]))||Number(data[key])<0))throw Error('Costs must be valid amounts of RM0 or more.');
 const loan=cash?0:price*margin/100,balance=price-loan,base=Math.max(price,Number(data.marketValue)||0),foreign=data.buyer==='foreign',rate=foreign?(data.propertyClass==='commercial'?4:8):null;
 const transfer=quote(data.dutyQuote,foreign?Math.ceil(base/100)*100*rate/100:transferDuty(base));
 const spa=quote(data.spaQuote,legalFee(price,data.legalBasis!=='standard'));
 const loanLegal=cash?0:quote(data.loanQuote,legalFee(loan,data.legalBasis!=='standard'));
 const loanDuty=cash?0:quote(data.loanDutyQuote,Math.ceil(loan/100)*100*.005);
 const tax=cents(((spa||0)+(loanLegal||0))*(data.sst==='no'?0:.08)),extra=extraCosts.reduce((sum,[key])=>sum+(cash&&['valuation','insurance'].includes(key)?0:Number(data[key])||0),0);
 const missing=extraCosts.filter(([key])=>!(cash&&['valuation','insurance'].includes(key))&&!supplied(data[key])).map(([,label])=>label);
 if(spa===null)missing.push('SPA legal-fee quotation');if(loanLegal===null)missing.push('Loan legal-fee quotation');
 return {price,loan,balance,transfer,spa,loanLegal,loanDuty,tax,extra,fees:transfer+(spa||0)+(loanLegal||0)+loanDuty+tax+extra,total:cents(balance+transfer+(spa||0)+(loanLegal||0)+loanDuty+tax+extra),missing,rate,base,cash};
}
