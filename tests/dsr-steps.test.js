import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDsrStep,dsrSteps,defaultDsrCommitments} from '../lib/dsr-steps.js';
const valid={income:'6000',dsr:'40',rate:'4.1',years:'35'};
test('basic four-step flow starts with positive income',()=>{assert.deepEqual(dsrSteps,['Income','Commitments','Loan terms','Results']);assert.equal(validateDsrStep(0,valid,[]),'');assert.ok(validateDsrStep(0,{...valid,income:'0'},[]))});
test('blank commitments are zero and negative amounts are rejected',()=>{assert.equal(validateDsrStep(1,valid,[{amount:''}]),'');assert.equal(validateDsrStep(1,valid,[]),'');assert.ok(validateDsrStep(1,valid,[{amount:'-1'}]))});
test('invalid assumptions block results while zero interest remains valid',()=>{assert.ok(validateDsrStep(2,{...valid,dsr:'101'},[]));assert.ok(validateDsrStep(2,{...valid,years:'1.5'},[]));assert.equal(validateDsrStep(2,{...valid,rate:'0'},[]),'')});
test('common debt categories start blank and reset as fresh rows',()=>{const rows=defaultDsrCommitments();assert.equal(rows.length,6);assert.ok(rows.every(row=>row.amount===''));assert.ok(rows.some(row=>row.name.includes('PTPTN')));rows[0].amount='1000';assert.equal(defaultDsrCommitments()[0].amount,'')});
