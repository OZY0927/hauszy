import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProjectJson} from '../lib/project-import.js';
import {maintenanceText,cardProject,normaliseProject} from '../lib/project.js';

const project={name:'Home',location:'KL',maintenance:300};
test('fixed maintenance survives import and listing projection with the correct monthly units',()=>{
 const {form}=parseProjectJson(JSON.stringify({...project,maintenanceBasis:'fixed'}));
 assert.equal(form.maintenance,300);
 assert.equal(form.maintenanceBasis,'fixed');
 const card=cardProject(normaliseProject(form,'home'));
 assert.equal(card.maintenanceBasis,'fixed');
 assert.equal(maintenanceText(card),'RM 300.00 / month');
});
test('legacy maintenance remains per sqft and blank fees stay blank',()=>{
 const {form}=parseProjectJson(JSON.stringify({...project,maintenance:0.35}));
 assert.equal(form.maintenanceBasis,'per_sqft');
 assert.equal(maintenanceText(form),'RM 0.35 / sqft / month');
 assert.equal(maintenanceText({maintenance:null}),null);
 assert.equal(maintenanceText({maintenance:0,maintenanceBasis:'fixed'}),'RM 0.00 / month');
});
test('invalid fee bases and negative fixed fees are rejected',()=>{
 assert.throws(()=>parseProjectJson(JSON.stringify({...project,maintenanceBasis:'annual'})),/maintenance fee basis/);
 assert.throws(()=>parseProjectJson(JSON.stringify({...project,maintenance:-1,maintenanceBasis:'fixed'})),/positive numbers/);
});

test('sinking fund inclusion replaces legacy text and clears additional amounts',async()=>{
 const {sinkingFundText}=await import('../lib/project.js');
 const {projectSections}=await import('../lib/project-visibility.js');
 const {form}=parseProjectJson(JSON.stringify({...project,maintenance:null,sinkingFund:'10%',sinkingFundStatus:'included',sinkingFundAmount:30}));
 assert.equal(form.sinkingFund,null);
 assert.equal(form.sinkingFundAmount,null);
 assert.equal(sinkingFundText(form),'Included in maintenance fee');
 assert.equal(projectSections(form).maintenance,true);
 assert.equal(sinkingFundText({sinkingFund:'10% of maintenance'}),'10% of maintenance');
});
test('excluded sinking fund requires a valid amount and displays its basis',async()=>{
 const {sinkingFundText}=await import('../lib/project.js');
 const data={...project,sinkingFundStatus:'excluded',sinkingFundAmount:30};
 assert.equal(sinkingFundText(parseProjectJson(JSON.stringify(data)).form),'RM 30.00 / month (additional)');
 assert.equal(sinkingFundText(parseProjectJson(JSON.stringify({...data,sinkingFundAmount:0.03,sinkingFundBasis:'per_sqft'})).form),'RM 0.03 / sqft / month (additional)');
 for(const sinkingFundAmount of [null,'',-1])assert.throws(()=>parseProjectJson(JSON.stringify({...data,sinkingFundAmount})),/sinking fund amount|sinkingFundAmount/);
 assert.throws(()=>parseProjectJson(JSON.stringify({...data,sinkingFundStatus:'other'})),/sinking fund option/);
});
