import {monthlyPayment} from './loan-math.js';
export function dsrEstimate({income,commitments=0,dsr=40,rate=4.1,years=35,livingCosts=0,requestedLoan=null}){
 const values={income:Number(income),commitments:Number(commitments),dsr:Number(dsr),rate:Number(rate),years:Number(years),livingCosts:Number(livingCosts)};
 if(!Number.isFinite(values.income)||values.income<=0)throw Error('Enter your net monthly income.');
 for(const key of ['commitments','livingCosts'])if(!Number.isFinite(values[key])||values[key]<0)throw Error('Monthly costs cannot be negative.');
 if(!Number.isFinite(values.dsr)||values.dsr<=0||values.dsr>100)throw Error('Target DSR must be above 0% and at most 100%.');
 if(!Number.isFinite(values.rate)||values.rate<0||values.rate>20)throw Error('Enter an interest rate from 0% to 20%.');
 if(!Number.isInteger(values.years)||values.years<1||values.years>35)throw Error('Choose a tenure from 1 to 35 whole years.');
 if(requestedLoan!==null&&requestedLoan!==''&&(!Number.isFinite(+requestedLoan)||+requestedLoan<0))throw Error('Requested loan cannot be negative.');
 const allowance=values.income*values.dsr/100,capacity=Math.max(0,allowance-values.commitments),unitPayment=monthlyPayment(1,values.rate,values.years),maxLoan=capacity/unitPayment,currentDsr=values.commitments/values.income*100;
 const requested=requestedLoan!==null&&requestedLoan!==''?Number(requestedLoan):null,requestedPayment=requested!==null?monthlyPayment(requested,values.rate,values.years):null;
 return {...values,currentDsr,allowance,capacity,maxLoan,remaining:values.income-values.commitments-capacity,livingBalance:values.income-values.commitments-capacity-values.livingCosts,requestedPayment,requestedDsr:requestedPayment!==null?(values.commitments+requestedPayment)/values.income*100:null,requestedFits:requestedPayment!==null?requestedPayment<=capacity+0.005:null};
}
