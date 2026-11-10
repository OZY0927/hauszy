// Short, quiet synthesized tones; no audio files, tracking, or network requests.
const PATTERNS={
 hover:[[720,0,.045,.28]],
 tick:[[560,0,.065,.7]],
 open:[[440,0,.1,.65],[660,.035,.14,.45]],
 close:[[520,0,.085,.5],[390,.025,.1,.35]],
 save:[[660,0,.12,.7],[880,.055,.17,.5]],
 unsave:[[600,0,.09,.5],[440,.035,.11,.4]],
 select:[[620,0,.07,.5],[740,.025,.09,.3]],
 reset:[[480,0,.09,.45],[360,.035,.12,.3]],
 apply:[[520,0,.1,.5],[650,.04,.12,.4],[780,.08,.15,.3]],
 navigate:[[420,0,.07,.45],[560,.025,.1,.3]],
};
export function playUISound(context,name='tick'){
 const start=context.currentTime+.005;
 for(const [frequency,delay,duration,level] of PATTERNS[name]||PATTERNS.tick){
  const oscillator=context.createOscillator(),gain=context.createGain(),at=start+delay;
  oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,at);
  oscillator.frequency.exponentialRampToValueAtTime(frequency*.96,at+duration);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.025*level,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  oscillator.connect(gain);gain.connect(context.destination);
  oscillator.start(at);oscillator.stop(at+duration+.01);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
 }
}

export function navigationHoverTarget(target,relatedTarget){
 const item=target.closest('.hz-header a,.hz-header button,.hz-header summary,.hz-drawer a,.hz-drawer button');
 return item&&!item.matches(':disabled,[aria-disabled="true"]')&&!item.closest('[inert]')&&!(relatedTarget&&item.contains(relatedTarget))?item:null;
}

export function interactionSound(element){
 if(element.matches('.site-sound-toggle')||element.closest('.background-music'))return null;
 if(element.matches('.save,.property-tile-save,.catalog-list-save,.compare-remove')||element.matches('.enquiry-card button[aria-pressed]'))return element.getAttribute('aria-pressed')==='true'||element.matches('.compare-remove')?'unsave':'save';
 if(element.matches('.catalog-floating-trigger,.catalog-filter-toggle'))return element.getAttribute('aria-expanded')==='true'?'close':'open';
 if(element.matches('.catalog-sidebar-backdrop,[aria-label="Close filters and sorting"]'))return 'close';
 if(element.matches('.catalog-reset-all,.catalog-active-chips button,.lc-reset'))return 'reset';
 if(element.matches('.catalog-apply-filters'))return 'apply';
 if(element.matches('.catalog-compare-button'))return 'open';
 if(element.matches('.catalog-view-toggle button,.catalog-collection-tabs button,.catalog-floating-options button[aria-pressed],.lc-toggle button'))return element.getAttribute('aria-pressed')==='true'?null:'select';
 if(element.matches('[role=tab]'))return element.getAttribute('aria-selected')==='true'?null:'tick';
 if(element.matches('.catalog-type-grid button'))return element.getAttribute('aria-pressed')==='true'?null:'tick';
 if(element.matches('.hz-close,dialog .close,[aria-label="Close facilities"],[aria-label="Close floor plan"]'))return 'close';
 if(element.matches('.gallery-controls button,.floorplan-thumbs button,.floorplan-dialog-actions button'))return 'tick';
 if(element.matches('.hz-menu-button,.hz-compact-logo,.gallery-tile,.deal-photo,.floorplan-open,.facilities-see-all,.compare-chip'))return 'open';
 if(element.matches('.hz-tools>summary'))return element.parentElement.open?'close':'open';
 if(element.matches('summary'))return element.parentElement.open?'close':'open';
 if(element.matches('.catalog-list-link,.catalog-list-photo,.hz-nav a,.footer-col a,a[href^="/projects"],a[href^="/loan"]'))return 'navigate';
 if(element.matches('.property-tile-link,.card .details'))return 'tick';
 return null;
}

// Native change fires after a committed edit, rather than on every keystroke/drag.
export function changeSound(element){
 if(element.matches('select')&&element.closest('.project-catalog,.lc'))return 'select';
 if(element.matches('input[type="range"],input[type="number"],input[type="text"],input:not([type])')&&element.closest('.catalog-filter-form,.lc'))return 'tick';
 return null;
}
