import test from 'node:test';
import assert from 'node:assert/strict';
import {hasProjectInfo,visibleFacts,projectSections} from '../lib/project-visibility.js';
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
