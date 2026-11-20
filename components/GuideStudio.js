'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {collection,doc,getDocsFromServer,runTransaction} from 'firebase/firestore';
import {getFirebase,refreshSite,uploadPhoto} from '../lib/firebase-client';
import {authErrorMessage} from '../lib/auth-errors';
import {isAdminToken} from '../lib/admin-access';
import {isPublicProject} from '../lib/publication';
import {GUIDE_CATEGORIES,GUIDE_TOOLS,guideContent,guideHref,guidePath,guideRecords,suggestGuideSlug,validGuideSlug} from '../lib/guides';
import {STARTER_GUIDES} from '../lib/starter-guides';
import GuideArticle from './GuideArticle';
import PhotoPicker from './PhotoPicker';
import Icon from './Icon';

const starterDrafts=STARTER_GUIDES.map(guide=>({...guide,isPublished:true,revision:0}));
const blankGuide={title:'',slug:'',category:GUIDE_CATEGORIES[0],summary:'',body:'',author:'Hauszy',seoTitle:'',seoDescription:'',coverAlt:'',coverUrl:'',projectId:'',tools:[],sources:[]};
const blankSource={label:'',url:'',checkedOn:''};
const errorText=error=>error.code==='permission-denied'
 ?'Guides require the updated Firestore rules. Deploy firestore.rules before saving or publishing.'
 :error.code?authErrorMessage(error):error.message;

async function saveGuide({slug,record,form,action}){
 const {auth,db}=getFirebase();
 if(!auth.currentUser||!isAdminToken(await auth.currentUser.getIdTokenResult()))throw Error('Administrator access required. Sign in again.');
 const draftRef=doc(db,'guideDrafts',slug);
 const liveRef=doc(db,'guidePublications',slug);
 const starter=starterDrafts.find(guide=>guide.slug===slug);
 const now=new Date().toISOString();
 const {draft,publication}=await runTransaction(db,async transaction=>{
  const saved=await transaction.get(draftRef);
  const current=saved.data()||starter;
  if(!record&&current)throw Error('That article URL is already in use.');
  if(record&&record.revision!==current?.revision)throw Error('This article changed in another session. Close the editor and reload the Guides list.');
  const versions=guideRecords({slug,form,current,action,now});
  transaction.set(draftRef,versions.draft);
  if(versions.publication)transaction.set(liveRef,versions.publication);
  return versions;
 });
 const refreshed=publication?await refreshSite(['guides']):true;
 return {updated:{...draft,slug},refreshed};
}

export default function GuideStudio({projects}){
 const [records,setRecords]=useState(starterDrafts),[record,setRecord]=useState(undefined),[status,setStatus]=useState(''),[loading,setLoading]=useState(true),[pending,setPending]=useState('');
 const publicProjects=projects.filter(isPublicProject).sort((a,b)=>a.name.localeCompare(b.name));
 const fetchGuides=useCallback(async isCurrent=>{
  setLoading(true);setStatus('');
  try{
   const data=await getDocsFromServer(collection(getFirebase().db,'guideDrafts'));
   if(!isCurrent())return;
   const all=new Map(starterDrafts.map(guide=>[guide.slug,guide]));
   for(const draft of data.docs)all.set(draft.id,{...draft.data(),slug:draft.id});
   setRecords([...all.values()]);
  }catch(error){if(isCurrent())setStatus(errorText(error))}
  finally{if(isCurrent())setLoading(false)}
 },[]);
 useEffect(()=>{
  let active=true;
  fetchGuides(()=>active);
  return()=>{active=false};
 },[fetchGuides]);
 const remember=updated=>setRecords(all=>[updated,...all.filter(guide=>guide.slug!==updated.slug)]);
 async function withdraw(guide){
  setPending(guide.slug);setStatus('');
  try{
   const {updated,refreshed}=await saveGuide({slug:guide.slug,record:guide,action:'withdraw'});
   remember(updated);
   setStatus(refreshed?'Guide unpublished. You can still edit the draft.':'Guide unpublished. The public cache may take longer to refresh.');
  }catch(error){setStatus(errorText(error))}
  finally{setPending('')}
 }
 return <div className="st-view">
  <div className="st-toolbar">
   <Link className="st-btn" href="/guides/" target="_blank" rel="noopener">View public guides <Icon name="arrowUpRight"/></Link>
   <button type="button" className="st-btn accent" disabled={loading||!!pending} onClick={()=>setRecord(null)}><Icon name="plus"/>New article</button>
   <button type="button" className="st-btn ghost" disabled={loading||!!pending} onClick={()=>fetchGuides(()=>true)}><Icon name="refresh"/>Reload list</button>
  </div>
  {(status||loading)&&<div className="st-alert" role="status"><Icon name="info"/><p>{loading?'Loading guides…':status}</p></div>}
  <div className="st-card">
   {records.map(guide=><article className="st-guide-row" key={guide.slug}>
    <div><span className="st-eyebrow">{guide.category}</span><h3>{guide.title}</h3><p>{guidePath(guide.slug)}</p></div>
    <span className={`st-pill${guide.isPublished?' good':''}`}>{guide.hasDraftChanges?'Published · Draft edits':guide.isPublished?'Published':'Draft'}</span>
    <div className="st-guide-row-actions">
     <button type="button" className="st-btn small" disabled={!!pending||loading} onClick={()=>setRecord(guide)}><Icon name="pencil"/>Edit</button>
     {guide.isPublished&&<button type="button" className="st-btn ghost small" disabled={!!pending||loading} onClick={()=>withdraw(guide)}>{pending===guide.slug?'Saving…':'Unpublish'}</button>}
    </div>
   </article>)}
  </div>
  {record!==undefined&&<GuideEditor key={record?.slug||'new'} record={record} projects={publicProjects} onClose={()=>setRecord(undefined)} onSave={({updated,refreshed},action)=>{
   remember(updated);
   setStatus(action==='draft'?'Draft saved. The public version is unchanged.':refreshed?'Guide published.':'Guide published. The public cache may take longer to refresh.');
   setRecord(undefined);
  }}/>}
 </div>;
}

function GuideEditor({record,projects,onClose,onSave}){
 const dialog=useRef(null),bodyField=useRef(null),selection=useRef(null);
 const [form,setForm]=useState(()=>({...blankGuide,...record}));
 const [editedSlug,setEditedSlug]=useState(false),[preview,setPreview]=useState(false),[device,setDevice]=useState('desktop');
 const [photo,setPhoto]=useState(()=>record?.coverUrl?[{url:record.coverUrl}]:[]);
 const [link,setLink]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{dialog.current.showModal()},[]);
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const project=projects.find(item=>item.id===form.projectId);
 function textSelection(){
  const input=bodyField.current;
  return [input.selectionStart,input.selectionEnd];
 }
 function insert(insertText,[start,end]=textSelection()){
  const next=form.body.slice(0,start)+insertText+form.body.slice(end);
  if(next.length>40000){setStatus('Keep the article under 40,000 characters.');return}
  change('body',next);
  requestAnimationFrame(()=>{const input=bodyField.current;if(input){input.focus();input.setSelectionRange(start+insertText.length,start+insertText.length)}});
 }
 function format(kind){
  const range=textSelection(),selected=form.body.slice(...range);
  const lines=(prefix,example)=>'\n'+(selected||example).split('\n').map((line,index)=>prefix(index)+line).join('\n')+'\n';
  const formatted={
   heading:()=>lines(()=> '## ','Section heading'),
   bold:()=>`**${selected||'Important text'}**`,
   bullets:()=>lines(()=>'- ','List item'),
   numbered:()=>lines(index=>`${index+1}. `,'First step'),
   quote:()=>lines(()=>'> ','Quote'),
   table:()=>'\n\n| Option | What to check |\n| --- | --- |\n| First option | Detail |\n| Second option | Detail |\n\n',
  };
  if(kind==='link'){selection.current=range;setLink({text:selected,url:''});return}
  insert(formatted[kind](),range);
 }
 function insertLink(){
  const url=guideHref(link.url.trim());
  const text=link.text.trim().replace(/[\[\]\\]/g,'\\$&');
  if(!url||!text){setStatus('Enter link text and a valid website path or HTTPS URL.');return}
  insert(`[${text}](<${url.replace(/[<>]/g,char=>encodeURIComponent(char))}>)`,selection.current);
  setLink(null);setStatus('');
 }
 function updateSource(index,key,value){change('sources',form.sources.map((source,i)=>i===index?{...source,[key]:value}:source))}
 async function persist(action){
  if(busy)return;
  setBusy(true);setStatus('Saving…');
  try{
   const slug=form.slug.trim();
   if(!validGuideSlug(slug))throw Error('Choose an article URL with lowercase letters, numbers and single hyphens.');
   const content={...form,coverUrl:photo[0]?.file?'':photo[0]?.url||''};
   if(photo.length&&action==='publish'&&!form.coverAlt.trim())throw Error('Describe the cover photo before publishing.');
   guideContent(content,action==='publish');
   if(photo[0]?.file){
    content.coverUrl=await uploadPhoto(photo[0],`guides/${slug}`);
    setPhoto([{url:content.coverUrl}]);
   }
   onSave(await saveGuide({slug,record,form:content,action}),action);
  }catch(error){setStatus(errorText(error))}
  finally{setBusy(false)}
 }
 return <dialog className="st-sheet" ref={dialog} aria-labelledby="guide-editor-title" onCancel={event=>{event.preventDefault();if(!busy)onClose()}}>
  <form onSubmit={event=>event.preventDefault()}>
   <div className="st-sheet-head"><div><div className="st-eyebrow">Guide editor</div><h2 id="guide-editor-title">{record?'Edit article':'New article'}</h2></div><button type="button" className="st-btn ghost icon-only" onClick={onClose} disabled={busy} aria-label="Close article editor"><Icon name="x"/></button></div>
   <div className="st-sheet-scroll st-guide-editor">
    {preview?<div>
     <div className="st-toolbar"><div className="st-segment" aria-label="Preview width">{['desktop','mobile'].map(width=><button key={width} type="button" aria-pressed={device===width} onClick={()=>setDevice(width)}>{width==='desktop'?'Desktop':'Mobile'}</button>)}</div></div>
     <div className={`st-guide-preview${device==='mobile'?' is-mobile':''}`}><GuideArticle guide={{...form,coverUrl:photo[0]?.url}} project={project} preview/></div>
    </div>:<fieldset disabled={busy}>
     <section className="st-card"><div className="st-card-head"><h3>Article details</h3></div><div className="st-card-body st-grid">
      <label className="st-field st-wide">Title<input maxLength={120} value={form.title} onChange={event=>{const title=event.target.value;setForm(previous=>({...previous,title,...(!record&&!editedSlug&&{slug:suggestGuideSlug(title)})}))}}/></label>
      <label className="st-field">URL ending<input readOnly={!!record} maxLength={80} value={form.slug} onChange={event=>{setEditedSlug(true);change('slug',event.target.value)}}/></label>
      <label className="st-field">Category<select value={form.category} onChange={event=>change('category',event.target.value)}>{GUIDE_CATEGORIES.map(category=><option key={category}>{category}</option>)}</select></label>
      <label className="st-field st-wide">Short answer<textarea rows={3} maxLength={320} value={form.summary} onChange={event=>change('summary',event.target.value)}/></label>
      <label className="st-field">Author<input maxLength={100} value={form.author} onChange={event=>change('author',event.target.value)}/></label>
     </div></section>
     <section className="st-card"><div className="st-card-head"><div><h3>Article body</h3><p>Paste text or Markdown. Use the controls to format a selection or insert a template.</p></div></div><div className="st-card-body">
      <div className="st-guide-format" role="group" aria-label="Article formatting">
       {[['heading','Heading'],['bold','Bold'],['bullets','Bullet list'],['numbered','Numbered list'],['quote','Quote'],['table','Table'],['link','Insert link']].map(([key,label])=><button key={key} type="button" className="st-btn small" onClick={()=>format(key)}>{label}</button>)}
      </div>
      {link&&<div className="st-grid st-guide-link">
       <label className="st-field">Link text<input value={link.text} onChange={event=>setLink({...link,text:event.target.value})}/></label>
       <label className="st-field">URL<input value={link.url} onChange={event=>setLink({...link,url:event.target.value})} placeholder="https://… or /projects/"/></label>
       <label className="st-field st-wide">Choose a Hauszy link<select value="" onChange={event=>{const option=event.target.selectedOptions[0];if(option.value)setLink({...link,url:option.value,text:link.text||option.text})}}>
        <option value="">Choose a project or calculator</option>
        <optgroup label="Calculators">{GUIDE_TOOLS.map(([path,name])=><option key={path} value={path}>{name}</option>)}</optgroup>
        <optgroup label="Projects">{projects.map(item=><option key={item.id} value={`/projects/${item.id}/`}>{item.name}</option>)}</optgroup>
       </select></label>
       <div className="st-guide-format"><button type="button" className="st-btn small accent" onClick={insertLink}>Add link</button><button type="button" className="st-btn small ghost" onClick={()=>setLink(null)}>Cancel</button></div>
      </div>}
      <label className="st-field">Body text<textarea ref={bodyField} rows={14} maxLength={40000} value={form.body} onChange={event=>change('body',event.target.value)}/></label>
     </div></section>
     <section className="st-card"><div className="st-card-head"><h3>Cover photo</h3></div><div className="st-card-body st-grid">
      <div className="st-wide"><PhotoPicker photos={photo} onChange={setPhoto} max={1} label="cover photo"/></div>
      <label className="st-field st-wide">Describe the image for readers who cannot see it<input maxLength={180} value={form.coverAlt} onChange={event=>change('coverAlt',event.target.value)}/></label>
     </div></section>
     <section className="st-card"><div className="st-card-head"><h3>Related links</h3></div><div className="st-card-body st-grid">
      <label className="st-field st-wide">Related published project<select value={form.projectId} onChange={event=>change('projectId',event.target.value)}><option value="">None</option>{form.projectId&&!project&&<option value={form.projectId}>Currently unavailable project</option>}{projects.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {GUIDE_TOOLS.map(([path,name])=><label className="st-guide-checkbox" key={path}><input type="checkbox" checked={form.tools.includes(path)} onChange={event=>change('tools',event.target.checked?[...form.tools,path]:form.tools.filter(tool=>tool!==path))}/>{name}</label>)}
     </div></section>
     <section className="st-card"><div className="st-card-head"><h3>Sources</h3><button type="button" className="st-btn small" disabled={form.sources.length>=12} onClick={()=>change('sources',[...form.sources,blankSource])}><Icon name="plus"/>Add source</button></div><div className="st-card-body st-guide-sources">
      {form.sources.length===0&&<p>Link to a developer announcement, official brochure or other reference that supports the article.</p>}
      {form.sources.map((source,index)=><div className="st-grid st-guide-source" role="group" aria-label={`Source ${index+1}`} key={index}>
       <label className="st-field">Source label<input maxLength={120} value={source.label} onChange={event=>updateSource(index,'label',event.target.value)}/></label>
       <label className="st-field">Source URL<input type="url" maxLength={4096} value={source.url} onChange={event=>updateSource(index,'url',event.target.value)}/></label>
       <label className="st-field">Date checked<input type="date" value={source.checkedOn} onChange={event=>updateSource(index,'checkedOn',event.target.value)}/></label>
       <button type="button" className="st-btn ghost small" onClick={()=>change('sources',form.sources.filter((_,i)=>i!==index))}>Remove source</button>
      </div>)}
     </div></section>
     <section className="st-card"><div className="st-card-head"><div><h3>Search preview</h3><p>Leave these blank to use the title and short answer.</p></div></div><div className="st-card-body st-grid">
      <label className="st-field st-wide">Search title<input maxLength={80} value={form.seoTitle} onChange={event=>change('seoTitle',event.target.value)}/></label>
      <label className="st-field st-wide">Search description<textarea rows={2} maxLength={180} value={form.seoDescription} onChange={event=>change('seoDescription',event.target.value)}/></label>
     </div></section>
    </fieldset>}
   </div>
   <div className="st-sheet-foot">
    <p className="st-status" role="status">{status}</p>
    <button type="button" className="st-btn" disabled={busy} onClick={()=>{setPreview(value=>!value);dialog.current.querySelector('.st-sheet-scroll').scrollTop=0}}>{preview?'Back to editing':'Preview'}</button>
    <button type="button" className="st-btn" disabled={busy} onClick={()=>persist('draft')}>Save draft</button>
    <button type="button" className="st-btn accent" disabled={busy} onClick={()=>persist('publish')}>{record?.isPublished?'Publish changes':'Publish'}</button>
   </div>
  </form>
 </dialog>;
}
