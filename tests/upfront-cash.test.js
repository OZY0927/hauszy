import test from 'node:test';
import assert from 'node:assert/strict';
import {legalFee} from '../lib/upfront-cash.js';
test('legal fee scale: HDA minimum, discounted bands and negotiated excess above RM7.5m',()=>{assert.equal(legalFee(50000),500);assert.equal(legalFee(8000000),null);assert.equal(legalFee(0),0);assert.equal(legalFee(600000),4712.5);assert.equal(legalFee(600000,false),7250)});
