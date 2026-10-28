import test from 'node:test';
import assert from 'node:assert/strict';
import {loanSummary,monthlyPayment,yearlySchedule} from '../lib/loan-math.js';
const near=(a,b,tol=.01)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
test('loan summary totals add up',()=>{
  const r=loanSummary(600000,10,4.2,30);near(r.loan,540000);near(r.down,60000);near(r.payment,2640.69);
  near(r.totalRepayment,r.payment*360);near(r.totalInterest,r.totalRepayment-540000);near(r.totalCost,60000+r.totalRepayment);
  near(r.firstInterest,1890);near(r.firstPrincipal,r.payment-1890);near(r.plusOne,monthlyPayment(540000,5.2,30));
  assert.ok(r.halfwayMonth>180&&r.halfwayMonth<360);
});
test('zero interest has no interest cost and halves at mid-tenure',()=>{const r=loanSummary(120000,0,0,10);near(r.payment,1000);near(r.totalInterest,0);assert.equal(r.halfwayMonth,60)});
test('yearly schedule repays the loan exactly',()=>{const y=yearlySchedule(540000,4.2,30);assert.equal(y.length,30);near(y.reduce((s,r)=>s+r.principal,0),540000);near(y.at(-1).balance,0);near(y[0].principal+y[0].interest,monthlyPayment(540000,4.2,30)*12)});
