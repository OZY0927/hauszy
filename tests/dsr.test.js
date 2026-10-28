import test from 'node:test';
import assert from 'node:assert/strict';
import {dsrEstimate} from '../lib/dsr.js';
import {monthlyPayment} from '../lib/loan-math.js';
test('DSR uses net income minus existing commitments to size a loan',()=>{const r=dsrEstimate({income:6000,commitments:1200,dsr:40,rate:4.2,years:30});assert.equal(r.currentDsr,20);assert.equal(r.allowance,2400);assert.equal(r.capacity,1200);assert.ok(Math.abs(monthlyPayment(r.maxLoan,4.2,30)-1200)<.001)});
test('existing commitments above target yield zero capacity',()=>{const r=dsrEstimate({income:3000,commitments:1800,dsr:40});assert.equal(r.capacity,0);assert.equal(r.maxLoan,0);assert.equal(r.currentDsr,60)});
test('zero-interest principal and living costs are explicit',()=>{const r=dsrEstimate({income:5000,commitments:1000,dsr:40,rate:0,years:10,livingCosts:4000});assert.equal(r.maxLoan,120000);assert.equal(r.livingBalance,-1000)});
test('requested loan is compared with target without implying approval',()=>{const r=dsrEstimate({income:5000,commitments:1000,dsr:40,rate:0,years:10,requestedLoan:240000});assert.equal(r.requestedPayment,2000);assert.equal(r.requestedDsr,60);assert.equal(r.requestedFits,false)});
test('invalid income, costs, rates and tenure are rejected',()=>{for(const values of [{income:0},{income:5000,commitments:-1},{income:5000,dsr:101},{income:5000,rate:-1},{income:5000,years:36}])assert.throws(()=>dsrEstimate(values))});
