import test from 'node:test';
import assert from 'node:assert/strict';
import {estimate,legalFee,loanStampDuty} from '../lib/loan-math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<.01,`${a} ≠ ${b}`);
const base={price:500000,downPct:10,rate:4,years:35,buyer:'citizen',firstHome:false};
test('upfront cash adds down payment, both stamp duties and legal fees with SST',()=>{
  const r=estimate(base);near(r.down,50000);near(r.loan,450000);near(r.transfer,9000);near(r.loanDuty,2250);
  near(r.legal,(6250+5625)*1.08);near(r.upfront,50000+9000+2250+(6250+5625)*1.08);
});
test('first-home exemption only for citizens up to RM500,000',()=>{
  near(estimate({...base,firstHome:true}).transfer,0);near(estimate({...base,firstHome:true}).loanDuty,0);
  near(estimate({...base,firstHome:true,price:500001}).transfer,9003);
  near(estimate({...base,buyer:'pr',firstHome:true}).transfer,9000);
});
test('foreign buyers pay 8% transfer duty',()=>near(estimate({...base,buyer:'foreign'}).transfer,40000));
test('loan duty rounds up per RM1,000 and legal fees have a RM500 minimum',()=>{near(loanStampDuty(585001),2930);near(legalFee(30000),500)});
