import {monthlyPayment} from './loan-math.js';
// Rental ROI as commonly quoted in Malaysia: gross yield, net yield (after vacancy and running costs, before financing)
// and cash-on-cash ROI (yearly cash flow after loan repayments ÷ cash actually invested).
export function roiEstimate({price,downPct,upfront=0,rate,years,rent,maintenance=0,yearlyCosts=0,vacancy=1}){
  const loan=price*(1-downPct/100),down=price-loan,instalment=monthlyPayment(loan,rate,years);
  const effectiveRent=rent*(12-vacancy),runningCosts=maintenance*12+yearlyCosts,loanYearly=instalment*12;
  const netIncome=effectiveRent-runningCosts,cashFlow=netIncome-loanYearly,cashInvested=down+upfront;
  return {loan,down,instalment,effectiveRent,runningCosts,loanYearly,netIncome,cashFlow,cashInvested,
    grossYield:rent*12/price*100,netYield:netIncome/price*100,roi:cashInvested>0?cashFlow/cashInvested*100:null,
    breakEvenRent:(loanYearly+runningCosts)/(12-vacancy)};
}
