// Run before hydration: distinguish refresh from browser Back/Forward.
(()=>{
 const navigation=performance.getEntriesByType('navigation')[0];
 window.__hauszyHistoryTarget=navigation?.type==='back_forward'?location.pathname:null;
 addEventListener('popstate',()=>{window.__hauszyHistoryTarget=location.pathname});
 if(navigation?.type!=='reload')return;
 history.scrollRestoration='manual';
 const reset=()=>{
  scrollTo({top:0,left:0,behavior:'instant'});
  requestAnimationFrame(()=>{scrollTo({top:0,left:0,behavior:'instant'});history.scrollRestoration='auto'});
 };
 if(document.readyState==='complete')reset();else addEventListener('pageshow',reset,{once:true});
})();
