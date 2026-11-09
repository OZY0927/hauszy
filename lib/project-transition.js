// Fallback for browsers without native shared-element view transitions.
export function animateProjectCard(event,id){
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||typeof document.startViewTransition==='function'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const card=event.currentTarget.closest('.property-tile'),photo=card?.querySelector('.property-tile-photo');if(!photo)return;
 document.querySelector('.project-transition-overlay')?.remove();
 const rect=photo.getBoundingClientRect(),overlay=document.createElement('div');overlay.className='project-transition-overlay';overlay.setAttribute('aria-hidden','true');
 const image=photo.querySelector('img')?.cloneNode(true);if(image){image.removeAttribute('loading');overlay.append(image)}
 Object.assign(overlay.style,{top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px'});document.body.append(overlay);
 let disposed=false;const observer=new MutationObserver(check),timeout=setTimeout(cleanup,5000);
 function cleanup(){if(disposed)return;disposed=true;clearTimeout(timeout);observer.disconnect();overlay.remove()}
 const expansion=overlay.animate([{top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'8px'},{top:'0px',left:'0px',width:'100vw',height:'95svh',borderRadius:'0px'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
 let found=false;
 function check(){const hero=document.querySelector('.project-story-hero');if(found||hero?.dataset.projectId!==id)return;found=true;observer.disconnect();const img=hero.querySelector('img');const loaded=!img||img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,1500)});Promise.all([expansion.finished.catch(()=>{}),loaded]).then(()=>{if(!disposed)overlay.animate([{opacity:1},{opacity:0}],{duration:250,fill:'forwards'}).finished.then(cleanup,cleanup)})}
 observer.observe(document.body,{childList:true,subtree:true});check();
}
