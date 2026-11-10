// Pure choreography for the card showcase: where every card sits in the ring and in the grid, when it
// leaves, how it bends, and where the camera is, for any scroll progress. No DOM or WebGL here, so the
// same progress always produces the same scene and the maths can be tested directly.
import {clamp,lerp,range,easeInOut,easeOut,hash,qAxis,qMul,qSlerp,qRotate} from './math.js';

const ry=a=>qAxis(0,1,0,a),rx=a=>qAxis(1,0,0,a),rz=a=>qAxis(0,0,1,a);

export function buildLayout(cfg,imageCount=1){
 const {cols,rows}=cfg.grid,count=cols*rows,H=cfg.card.aspect,gap=cfg.grid.gutter,{tiers,radius:R,opening:g}=cfg.ring;
 const wing=Math.PI-2*g;
 // Ring slots: an angle around a shared vertical axis, split into two wings with the front and back left open.
 const slots=Array.from({length:count},(_,k)=>{
  const tier=k%tiers,j=Math.floor(k/tiers),m=Math.ceil((count-tier)/tiers);
  const s=((j+.5+.5*tier)/m)%1;
  const theta=s<.5?g+s/.5*wing:-(g+(s-.5)/.5*wing);
  const y=(tier-(tiers-1)/2)*(H+cfg.ring.tierGap)+cfg.ring.wave*Math.sin(theta*2+tier*1.7);
  return {theta,local:[R*Math.sin(theta),y,R*Math.cos(theta)],q:qMul(ry(theta),rz(cfg.ring.cardRoll*(2*hash(k*7+3)-1)))};
 });
 // Grid cells, row-major from the top left, in the grid's own plane.
 const stepX=1+gap,stepY=H+gap;
 const cells=Array.from({length:count},(_,i)=>{const c=i%cols,r=Math.floor(i/cols);return {c,r,local:[(c-(cols-1)/2)*stepX,((rows-1)/2-r)*stepY,0]}});
 // Pair slots with cells left to right, then top to bottom within a column, so paths rarely cross.
 const ringBase=qMul(rz(cfg.ring.roll),rx(cfg.ring.tilt));
 const seen=slots.map((s,k)=>({k,p:qRotate(ringBase,s.local)})).sort((a,b)=>a.p[0]-b.p[0]||a.k-b.k);
 const order=[];
 for(let c=0;c<cols;c++)order.push(...seen.slice(c*rows,c*rows+rows).sort((a,b)=>b.p[1]-a.p[1]||a.k-b.k).map(s=>s.k));
 const stride=imageCount>2?(imageCount%3===0?2:3):1;
 const raw=order.map((slot,i)=>.65*(Math.abs(slots[slot].theta)-g)/wing+.35*hash(i*3+1));
 const lo=Math.min(...raw),hi=Math.max(...raw);
 const cards=order.map((slot,i)=>{
  // order runs column by column, rows top to bottom; cells are row-major
  const cell=cells[(i%rows)*cols+Math.floor(i/rows)],h=n=>hash(i*13+n);
  return {
   index:i,slot:slots[slot],cell,
   image:imageCount?(cell.c+cell.r*stride)%imageCount:0,
   delay:hi>lo?(raw[i]-lo)/(hi-lo):0,                    // 0 leaves first, 1 leaves last
   bend:{sign:h(1)>.5?1:-1,amount:.7+.3*h(2),phase:h(3)*Math.PI*2,pivot:h(4)>.5?.5:-.5},
   arc:[(h(5)-.5)*.4,cfg.motion.lift*(2*h(6)-1),cfg.motion.arc*(.75+.5*h(7))],
  };
 });
 return {
  cards,
  ringBase,
  gridQ:qMul(qMul(rz(cfg.grid.roll),ry(cfg.grid.yaw)),rx(-cfg.grid.tilt)),
  dims:{
   ringW:2*R+.5,
   ringH:tiers*H+(tiers-1)*cfg.ring.tierGap+2*R*Math.sin(cfg.ring.tilt),
   gridW:cols*stepX-gap,
   gridH:rows*stepY-gap,
  },
 };
}

// Camera distances for the ring and the grid, from the viewport's aspect rather than fixed coordinates.
export function framing(layout,cfg,aspect){
 const t=Math.tan(cfg.fov*Math.PI/360),{ringW,ringH,gridW}=layout.dims;
 return {
  ring:Math.max(ringW/(cfg.ring.width*2*t*aspect),ringH/(cfg.ring.height*2*t)),
  grid:Math.max(cfg.grid.minDistance,gridW*cfg.grid.fill/(2*t*aspect)),
 };
}

// Local progress of one card through the unfold window; every card reaches 1 by the window's end.
export function cardProgress(card,cfg,p){
 const [a,b]=cfg.phases.unfold,span=b-a,dur=span*(1-cfg.motion.stagger);
 return clamp((p-a-card.delay*span*cfg.motion.stagger)/dur);
}

export function frame(layout,cfg,p,aspect){
 const {phases}=cfg,dist=framing(layout,cfg,aspect);
 const ringQ=qMul(layout.ringBase,ry(-cfg.ring.spin*(1-easeOut(range(p,phases.ring))))),gridQ=layout.gridQ,center=cfg.grid.center;
 const cards=layout.cards.map(card=>{
  const t=cardProgress(card,cfg,p),e=easeInOut(t),arc=Math.sin(Math.PI*e);
  const from=qRotate(ringQ,card.slot.local),cell=qRotate(gridQ,card.cell.local);
  const to=[center[0]+cell[0],center[1]+cell[1],center[2]+cell[2]];
  const {sign,amount,phase,pivot}=card.bend;
  const envelope=Math.sin(Math.PI*t)*(1+.35*Math.sin(Math.PI*2*t+phase));
  return {
   card,t,
   position:[0,1,2].map(i=>lerp(from[i],to[i],e)+card.arc[i]*arc),
   rotation:qSlerp(qMul(ringQ,card.slot.q),gridQ,e),
   bend:cfg.bend.strength*amount*sign*envelope,
   pivot,
  };
 });
 const x=easeInOut(range(p,phases.expand)),d=Math.exp(lerp(Math.log(dist.ring),Math.log(dist.grid),x));
 const target=[0,1,2].map(i=>lerp(0,center[i],x));
 const s=easeInOut(range(p,phases.split)),side=cfg.split.side,amount=cfg.split.amount*s;
 return {
  cards,
  eye:[target[0],target[1],target[2]+d],
  target,
  // Lens shift and the share of the frame the gallery keeps (from the left, or from the top).
  shift:side==='top'?[0,-amount]:[amount,0],
  keep:1-amount,
  side,
  settle:s,
 };
}

export const textVisible=(cfg,p,wasVisible)=>p>=cfg.phases.text[1]||(wasVisible&&p>=cfg.phases.text[0]);
