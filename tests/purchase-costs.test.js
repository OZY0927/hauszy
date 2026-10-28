import test from 'node:test';
import assert from 'node:assert/strict';
import {amortise,loanStampDuty,monthlyPayment,scaleFee,transferDuty} from '../lib/loan-math.js';
import {computeEstimate,transferDutyFor,validate} from '../lib/purchase-costs.js';
const base={price:'500000',margin:'90',rate:'4',years:'35',buyerStatus:'citizen',purchaser:'individual',companyType:'local',state:'penang-island',propertyType:'strata',dwelling:'yes',purchaseType:'subsale',firstHome:'no',spaDate:'2026-03-01',instrumentDate:'',consentRequired:'no',items:{}};
const near=(a,b,tol=.01)=>assert.ok(Math.abs(a-b)<=tol,`${a} ≠ ${b}`);
const item=(r,id)=>r.items.find(i=>i.id===id);

test('amortisation repays exactly the principal, handles zero interest and extra repayments',()=>{
  near(monthlyPayment(540000,4.2,30),2640.69,.01);
  const s=amortise(300000,4,30);near(s.rows.reduce((a,r)=>a+r.principal+r.extra,0),300000);near(s.rows.at(-1).balance,0);assert.equal(s.months,360);
  const z=amortise(120000,0,10);assert.equal(z.payment,1000);assert.equal(z.totalInterest,0);assert.equal(z.months,120);
  const x=amortise(300000,4,30,{extraMonthly:500});assert.ok(x.months<360&&x.totalInterest<s.totalInterest);
});

test('progressive transfer duty bands and RM100 rounding',()=>{
  near(transferDuty(100000),1000);near(transferDuty(500000),9000);near(transferDuty(1000000),24000);
  near(transferDuty(1000001),24004);near(transferDuty(100001),1002);
});

test('loan duty is 0.5% per RM1,000 or part',()=>{assert.equal(loanStampDuty(585000),2925);assert.equal(loanStampDuty(585001),2930)});

test('buyer status and dates choose the transfer duty basis',()=>{
  const f={...base,price:'1200000',buyerStatus:'foreigner'};
  near(transferDutyFor({...f,instrumentDate:'2026-01-01'}).gross,96000);
  near(transferDutyFor({...f,spaDate:'2025-06-01',instrumentDate:'2025-12-31'}).gross,48000);
  near(transferDutyFor({...f,spaDate:'2023-06-01'}).gross,transferDuty(1200000));
  near(transferDutyFor({...f,propertyType:'commercial'}).gross,48000);
  near(transferDutyFor({...f,propertyType:'serviced',dwelling:'yes'}).gross,96000);
  near(transferDutyFor({...f,propertyType:'serviced',dwelling:'no'}).gross,48000);
  near(transferDutyFor({...f,buyerStatus:'pr'}).gross,transferDuty(1200000));
  near(transferDutyFor({...f,marketValue:'1300000'}).gross,104000);
  assert.ok(transferDutyFor({...f,spaDate:'2025-11-01',instrumentDate:'2026-02-01'}).notes.length===1);
  assert.equal(transferDutyFor({...base,purchaser:'company',companyType:'foreignControlled'}).quote,true);
  near(transferDutyFor({...base,purchaser:'company',companyType:'foreign'}).gross,40000);
});

test('first-home exemption needs every condition, not just the checkbox',()=>{
  const yes={...base,firstHome:'yes'},r=computeEstimate(yes);
  near(r.stampDuty.exemption,11250);assert.equal(r.stampDuty.payable,0);
  for(const change of [{price:'500001'},{marketValue:'510000'},{buyerStatus:'pr'},{purchaser:'company'},{spaDate:'2028-01-01'},{propertyType:'commercial'},{propertyType:'serviced'},{firstHome:'unsure'}])
    assert.equal(computeEstimate({...yes,...change}).stampDuty.exemption,0,JSON.stringify(change));
  near(computeEstimate({...yes,propertyType:'serviced',serviceConfirmed:true}).stampDuty.exemption,11250);
});

test('SRO 2023 scale with HDA Table B and minimum fee',()=>{
  near(scaleFee(500000),6250);near(scaleFee(1000000),11250);near(scaleFee(30000),500);
  near(scaleFee(1000000,{hda:'hdaSpa'}),7312.5);near(scaleFee(1200000,{hda:'hdaSpa'}),7950);near(scaleFee(1200000,{hda:'hdaLoan'}),6625);
  assert.equal(scaleFee(45000,{hda:'hdaSpa'}),500);
});

test('booking deposit is part of the down payment and never double-counted',()=>{
  const r=computeEstimate({...base,booking:'5000'}),dp=item(r,'downPayment');
  assert.equal(dp.gross,50000);assert.equal(dp.paid,5000);assert.equal(dp.outstanding,45000);
  near(r.totals.cash-r.totals.outstanding,5000);
  assert.ok(validate({...base,booking:'60000'}).booking);
});

test('developer-paid fees are not exemptions, and financed costs enlarge the facility',()=>{
  const r=computeEstimate({...base,items:{spaLegal:{cover:'developer'},insurance:{override:'12000',financed:true}}});
  assert.equal(item(r,'spaLegal').buyer,0);assert.equal(item(r,'spaLegal').exemption,0);assert.equal(r.stampDuty.exemption,0);
  assert.equal(r.facility,462000);near(item(r,"loanDuty").gross,2310);near(r.payment,monthlyPayment(462000,4,35));
  assert.equal(r.totals.financed,12000);
});

test('missing quotations make the estimate incomplete',()=>{
  const f=computeEstimate({...base,buyerStatus:'foreigner'});assert.ok(f.missing.includes('State consent fee')&&f.missing.includes('Foreign buyer consent fee / levy'));
  assert.equal(computeEstimate(base).missing.length,0);
  const s=computeEstimate({...base,state:'sabah'});assert.ok(s.missing.includes('SPA / conveyancing legal fees'));
  const q=computeEstimate({...base,buyerStatus:'foreigner',items:{stateConsent:{override:'1000'},foreignLevy:{override:'15000'}}});assert.equal(q.missing.length,0);assert.equal(item(q,'foreignLevy').overridden,true);
});

test('validation rejects bad price, margin, rate and tenure',()=>{
  const e=validate({...base,price:'0',margin:'120',rate:'-1',years:'2.5'});
  assert.ok(e.price&&e.margin);
  const e2=validate({...base,rate:'-1',years:'2.5'});assert.ok(e2.rate&&e2.years);
  assert.deepEqual(validate(base),{});
});
