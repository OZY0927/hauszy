import test from 'node:test';
import assert from 'node:assert/strict';
import {hasProjectInfo,visibleFacts,projectSections} from '../lib/project-visibility.js';
import {sinkingFundText} from '../lib/project.js';
test('empty and placeholder facts disappear while numeric zero remains',()=>{assert.deepEqual(visibleFacts([['Empty',null],['Spaces','  '],['Placeholder','To be confirmed'],['Zero',0],['Count',480]]),[['Zero',0],['Count',480]]);assert.equal(hasProjectInfo('—'),false);assert.equal(hasProjectInfo(NaN),false)});
test('empty facilities, layouts, location and maintenance sections are hidden',()=>{const v=projectSections({facilities:[' ','To be confirmed'],units:[{}],location:'Location to be confirmed',nearbyAmenities:[],maintenance:'',sinkingFund:null});assert.equal(v.facilities.length,0);assert.equal(v.units.length,0);assert.equal(v.location,false);assert.equal(v.maintenance,false)});
test('filled sections remain and zero-valued coordinates and fees are valid',()=>{const v=projectSections({units:[{carParks:0}],facilities:['Pool'],latitude:0,longitude:0,maintenance:0,nearbyAmenities:[{category:'Schools',name:'School A'}]});assert.equal(v.hasCoordinates,true);assert.equal(v.maintenance,true);assert.equal(v.units.length,1);assert.equal(v.facilities.length,1);assert.equal(v.nearby.length,1)});
test('showroom keeps up to six safe photos and hides when there are none',async()=>{const {normaliseProject,cardProject}=await import('../lib/project.js');const urls=n=>Array.from({length:n},(_,i)=>`https://a/s${i}.jpg`);const many=normaliseProject({showroomImages:[...urls(8),'javascript:alert(1)']},'a');assert.deepEqual(many.showroomImages,urls(6));assert.equal(projectSections(many).showroom.length,6);assert.equal(projectSections(normaliseProject({showroomImages:urls(3)},'b')).showroom.length,3);assert.deepEqual(projectSections(normaliseProject({showroomImages:['http://a/x.jpg']},'c')).showroom,[]);assert.deepEqual(projectSections(normaliseProject({},'d')).showroom,[]);assert.equal(cardProject(many).showroomImages,undefined)});

test('section toggles hide populated optional sections without clearing their content',()=>{
 const p={units:[{name:'Type A'}],facilities:['Pool'],showroomImages:['https://example.com/photo.jpg'],location:'Penang',latitude:5,longitude:100,nearbyAmenities:[{name:'School',category:'Schools'}],maintenance:1,sinkingFund:'10%',sectionVisibility:{units:false,facilities:false,showroom:false,location:false,maintenance:false,overview:false,details:false,photos:false,enquiry:false,video:false,related:false}};
 const v=projectSections(p);
 for(const key of ['units','facilities','showroom','nearby'])assert.deepEqual(v[key],[]);
 for(const key of ['location','maintenance','hasCoordinates','overview','details','photos','enquiry','video','related'])assert.equal(v[key],false);
 assert.equal(p.units.length,1);assert.equal(p.facilities.length,1);assert.equal(p.latitude,5);
});
test('legacy records keep default sections enabled and re-enabling restores existing content',()=>{
 const p={facilities:['Pool'],units:[{name:'Type A'}],location:'Penang',maintenance:0};
 assert.equal(projectSections(p).overview,true);assert.equal(projectSections(p).photos,true);assert.equal(projectSections(p).enquiry,true);
 assert.deepEqual(projectSections({...p,sectionVisibility:{facilities:true}}).facilities,['Pool']);
});
test('section visibility survives editor saves and JSON imports with strict boolean validation',async()=>{
 const {buildProject}=await import('../lib/project-editor.js'),{parseProjectJson}=await import('../lib/project-import.js');
 const form={name:'A',location:'Penang',sectionVisibility:{facilities:false,enquiry:false}};
 const saved=buildProject(form,[],[],'a');assert.equal(saved.sectionVisibility.facilities,false);assert.equal(saved.sectionVisibility.overview,true);
 const imported=parseProjectJson(JSON.stringify(form));assert.equal(imported.form.sectionVisibility.enquiry,false);
 assert.equal(parseProjectJson(JSON.stringify({name:'A',location:'Penang'})).form.sectionVisibility.facilities,true);
 for(const value of [{facilities:'false'},{typo:false},[],false])assert.throws(()=>parseProjectJson(JSON.stringify({...form,sectionVisibility:value})),/sectionVisibility/);
});
test('hidden fields are blanked for the public page while shown ones stay',async()=>{
 const {normaliseProject}=await import('../lib/project.js');
 const {applyFieldVisibility}=await import('../lib/project-visibility.js');
 const base={name:'A',location:'Penang',developer:'Dev',tenure:'Freehold',price:500000,maintenance:0.3,sinkingFundStatus:'included',latitude:5,longitude:100,units:[{name:'Type A',price:600000,size:900,bedrooms:'3',carParks:'2',floorPlanUrls:['https://a/p.png']}],nearbyAmenities:[{category:'Schools',name:'S',distance:'1',travelTime:'5'}]};
 const all=applyFieldVisibility(normaliseProject(base,'a'));
 assert.equal(all.developer,'Dev');assert.equal(all.units[0].price,600000);assert.equal(all.displayPricePerSqft,556);
 const p=applyFieldVisibility(normaliseProject({...base,fieldVisibility:{developer:false,tenure:false,price:false,unitPrice:false,floorPlans:false,coordinates:false,amenityDistance:false,sinkingFund:false}},'a'));
 assert.equal(p.developer,null);assert.equal(p.tag,null);assert.equal(p.price,null);assert.equal(p.displayPricePerSqft,null);
 assert.equal(p.units[0].price,null);assert.equal(p.units[0].size,900);assert.deepEqual(p.units[0].floorPlanUrls,[]);
 assert.equal(p.latitude,null);assert.equal(p.nearbyAmenities[0].distance,null);assert.equal(p.nearbyAmenities[0].travelTime,'5');
 assert.equal(sinkingFundText(p),null);assert.equal(projectSections(p).hasCoordinates,false);assert.equal(projectSections(p).maintenance,true);
 // A starting price taken only from layout prices disappears with the layout prices.
 const derived=applyFieldVisibility(normaliseProject({...base,price:null,fieldVisibility:{unitPrice:false}},'a'));assert.equal(derived.price,null);
 const own=applyFieldVisibility(normaliseProject({...base,fieldVisibility:{unitPrice:false}},'a'));assert.equal(own.price,500000);
});
test('fieldVisibility is validated, saved and imported',async()=>{
 const {buildProject}=await import('../lib/project-editor.js');const {parseProjectJson}=await import('../lib/project-import.js');
 const form={name:'A',location:'Penang',fieldVisibility:{developer:false}};
 const saved=buildProject(form,[],[],'a');assert.equal(saved.fieldVisibility.developer,false);assert.equal(saved.fieldVisibility.price,true);
 assert.equal(parseProjectJson(JSON.stringify(form)).form.fieldVisibility.developer,false);
 for(const value of [{developer:'no'},{nope:false},[]])assert.throws(()=>parseProjectJson(JSON.stringify({...form,fieldVisibility:value})),/fieldVisibility/);
});
test('project cards drop photos the admin hid so the unavailable artwork shows',async()=>{
 const {normaliseProject,cardProject,publicImages,IMAGE_UNAVAILABLE,IMAGE_UNAVAILABLE_PORTRAIT}=await import('../lib/project.js');
 const shown=normaliseProject({images:['https://a/1.jpg']},'a'),hidden=normaliseProject({images:['https://a/1.jpg'],sectionVisibility:{photos:false}},'b');
 assert.deepEqual(cardProject(shown).images,['https://a/1.jpg']);assert.deepEqual(cardProject(hidden).images,[]);assert.deepEqual(cardProject(hidden).previewImages,[]);
 assert.deepEqual(publicImages(hidden),[]);assert.deepEqual(publicImages({}),[]);
 const {existsSync}=await import('node:fs');for(const path of [IMAGE_UNAVAILABLE,IMAGE_UNAVAILABLE_PORTRAIT])assert.ok(existsSync('public'+path),path);
});
