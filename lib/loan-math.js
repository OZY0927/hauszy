import {RULES} from './property-rules.js';
const ceilTo=(value,step)=>Math.ceil(value/step-1e-9)*step;
export function monthlyPayment(principal,annualRate,years){const months=Math.round(years*12),rate=annualRate/100/12;if(!(principal>0)||!(months>0))return 0;return rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months))}
function bandAmount(value,bands,roundTo){let remaining=Math.max(0,value),total=0;for(const [width,rate] of bands){const amount=Math.min(remaining,width);if(amount>0)total+=ceilTo(amount,roundTo)*rate;remaining-=amount;if(remaining<=0)break}return total}
export const transferDuty=value=>bandAmount(value,RULES.transferBands,100);
export const loanStampDuty=amount=>amount>0?ceilTo(amount,1000)*RULES.loanDutyRate:0;
export const legalFee=value=>value>0?Math.max(RULES.legalMinimum,bandAmount(value,RULES.legalScale,1)):0;
export function estimate({price,downPct,rate,years,buyer,firstHome,other=0}){
  const loan=price*(1-downPct/100),down=price-loan,foreign=buyer==='foreign',exempt=buyer==='citizen'&&firstHome&&price<=RULES.firstHomeCap;
  const transfer=exempt?0:foreign?ceilTo(price,100)*RULES.foreignResidentialRate:transferDuty(price),loanDuty=exempt?0:loanStampDuty(loan);
  const legal=(legalFee(price)+legalFee(loan))*(1+RULES.sst);
  return {loan,down,payment:monthlyPayment(loan,rate,years),transfer,loanDuty,legal,other,exempt,upfront:down+transfer+loanDuty+legal+other};
}
