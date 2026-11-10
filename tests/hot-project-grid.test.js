import test from 'node:test';
import assert from 'node:assert/strict';
import {hotProjectGrid} from '../lib/hot-project-grid.js';

for(const [width,height,cardWidth,mobile] of [[1440,700,518,false],[1024,460,369,false],[390,500,265,true],[320,440,250,true]]){
 test(`final grid stays separated and inside its panel at ${width}px`,()=>{
  for(let count=1;count<=9;count++){
   const cardHeight=cardWidth*.86,{scale,positions}=hotProjectGrid(count,width,height,cardWidth,cardHeight,mobile);
   const w=cardWidth*scale,h=cardHeight*scale;
   assert.ok(scale>0);
   for(const p of positions){
    const x=width/2+p.x,y=height/2+p.y;
    assert.ok(x-w/2>=width*(mobile?.07:.06)-.001);
    assert.ok(x+w/2<=width*(mobile?.93:.52)+.001);
    assert.ok(y-h/2>=height*(mobile?.05:.1)-.001);
    assert.ok(y+h/2<=height*(mobile?.43:.9)+.001);
   }
   for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
    assert.ok(Math.abs(positions[i].x-positions[j].x)>=w||Math.abs(positions[i].y-positions[j].y)>=h);
   }
  }
 });
}
