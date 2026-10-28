export function monthlyPayment(principal,annualRate,years){const months=Math.round(years*12),rate=annualRate/100/12;if(!(principal>0)||!(months>0))return 0;return rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months))}
export function transferDuty(value){let remaining=value,total=0;for(const [width,rate]of [[100000,.01],[400000,.02],[500000,.03],[Infinity,.04]]){const amount=Math.min(remaining,width);if(amount>0)total+=Math.ceil(amount/100)*100*rate;remaining-=amount;if(remaining<=0)break}return total}
export function loanSummary(price,downPct,annualRate,years){
  const loan=price*(1-downPct/100),down=price-loan,months=Math.round(years*12),rate=annualRate/100/12,payment=monthlyPayment(loan,annualRate,years);
  const totalRepayment=payment*months,totalInterest=Math.max(0,totalRepayment-loan),firstInterest=loan*rate;
  let balance=loan,halfwayMonth=0;
  for(let m=1;m<=months&&!halfwayMonth;m++){balance-=payment-balance*rate;if(balance<=loan/2)halfwayMonth=m}
  return {loan,down,payment,months,totalRepayment,totalInterest,totalCost:down+totalRepayment,firstInterest,firstPrincipal:payment-firstInterest,
    interestPerRinggit:loan>0?totalInterest/loan:0,halfwayMonth,plusOne:monthlyPayment(loan,annualRate+1,years)};
}
export function yearlySchedule(loan,annualRate,years){const rate=annualRate/100/12,payment=monthlyPayment(loan,annualRate,years),rows=[];let balance=loan;for(let year=1;year<=years;year++){let principal=0,interest=0;for(let m=0;m<12;m++){const i=balance*rate,p=Math.min(balance,payment-i);interest+=i;principal+=p;balance=Math.max(0,balance-p)}rows.push({year,principal,interest,balance})}return rows}
