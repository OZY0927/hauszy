// Short, quiet synthesized tones; no audio files, tracking, or network requests.
const PATTERNS={
 tick:[[560,0,.065,.7]],
 open:[[440,0,.1,.65],[660,.035,.14,.45]],
 close:[[520,0,.085,.5],[390,.025,.1,.35]],
 save:[[660,0,.12,.7],[880,.055,.17,.5]],
 unsave:[[600,0,.09,.5],[440,.035,.11,.4]],
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

export function interactionSound(element){
 if(element.matches('.site-sound-toggle')||element.closest('.background-music'))return null;
 if(element.matches('.save,.property-tile-save,.compare-remove')||element.matches('.enquiry-card button[aria-pressed]'))return element.getAttribute('aria-pressed')==='true'||element.matches('.compare-remove')?'unsave':'save';
 if(element.matches('[role=tab]'))return element.getAttribute('aria-selected')==='true'?null:'tick';
 if(element.matches('.catalog-type-grid button'))return element.getAttribute('aria-pressed')==='true'?null:'tick';
 if(element.matches('.hz-close,dialog .close,[aria-label="Close facilities"],[aria-label="Close floor plan"]'))return 'close';
 if(element.matches('.gallery-controls button,.floorplan-thumbs button,.floorplan-dialog-actions button'))return 'tick';
 if(element.matches('.hz-menu-button,.hz-compact-logo,.gallery-tile,.deal-photo,.floorplan-open,.facilities-see-all,.compare-chip'))return 'open';
 if(element.matches('.hz-tools>summary'))return element.parentElement.open?'close':'open';
 if(element.matches('.property-tile-link,.card .details'))return 'tick';
 return null;
}
