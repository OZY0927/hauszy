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
test('ROI: yields, cash flow and return on cash invested',async()=>{const {roiEstimate}=await import('../lib/roi.js');const r=roiEstimate({price:500000,downPct:10,upfront:20000,rate:0,years:25,rent:2000,maintenance:300,yearlyCosts:1200,vacancy:1});near(r.grossYield,4.8);near(r.effectiveRent,22000);near(r.runningCosts,4800);near(r.netYield,(22000-4800)/500000*100);near(r.loanYearly,18000);near(r.cashFlow,-800);near(r.cashInvested,70000);near(r.roi,-800/70000*100);near(r.breakEvenRent,(18000+4800)/11);assert.equal(roiEstimate({price:500000,downPct:0,upfront:0,rate:4,years:30,rent:2000,vacancy:1}).roi,null)});
test('phone helpers parse stored numbers and join country + local number',async()=>{const {countryList,joinPhone,splitPhone,toPhone}=await import('../lib/phone.js');const list=countryList();assert.ok(list.length>200);assert.equal(list[0].code,'MY');assert.equal(list[0].dial,'60');assert.equal(joinPhone('MY','012-345 6789'),'+60123456789');assert.equal(joinPhone('SG','8123 4567'),'+6581234567');assert.equal(joinPhone('MY',''),'');for(const stored of ['+60 12-345 6789','60123456789','012-345 6789'])assert.equal(toPhone(stored)?.number,'+60123456789',stored);assert.deepEqual(splitPhone('+6581234567'),{country:'SG',number:'8123 4567'});assert.equal(toPhone('abc'),null)});
