const clamp=value=>Math.min(1,Math.max(0,value));

// Each scroll beat has a short lead-in, one arrival, and a resting interval.
export function layoutArrival(index,progress,count){
 if(index===0)return 1;
 const beat=clamp(progress)*Math.max(1,count-1)-(index-1);
 const phase=clamp((beat-.08)/.74);
 return phase*phase*(3-2*phase);
}

export function layoutFront(progress,count){
 let front=0;
 for(let index=1;index<count;index++){
  if(layoutArrival(index,progress,count)<.98)break;
  front=index;
 }
 return front;
}

export function layoutPose(index,progress,count){
 let above=0;
 for(let next=index+1;next<count&&above<3;next++)above+=layoutArrival(next,progress,count);
 return {entered:layoutArrival(index,progress,count),above:Math.min(3,above)};
}
