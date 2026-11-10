// Fit upright cards into a compact panel, leaving the closing message its own space.
export function hotProjectGrid(count,sceneWidth,sceneHeight,cardWidth,cardHeight,mobile=false){
 const columns=Math.min(3,count),rows=Math.ceil(count/columns);
 const gap=mobile?8:Math.min(18,Math.max(10,sceneWidth*.012));
 const panelWidth=sceneWidth*(mobile?.86:.46),panelHeight=sceneHeight*(mobile?.38:.8);
 const scale=Math.min((panelWidth-gap*(columns-1))/(columns*cardWidth),(panelHeight-gap*(rows-1))/(rows*cardHeight));
 const gridWidth=columns*cardWidth*scale+gap*(columns-1);
 // Anchor the grid beside the copy, even when height limits its width on wide screens.
 const centerX=mobile?0:sceneWidth*.01-gridWidth/2,centerY=mobile?-sceneHeight*.26:0;
 return {scale,positions:Array.from({length:count},(_,index)=>{
  const row=Math.floor(index/columns),rowCount=Math.min(columns,count-row*columns);
  return {x:centerX+(index%columns-(rowCount-1)/2)*(cardWidth*scale+gap),y:centerY+(row-(rows-1)/2)*(cardHeight*scale+gap)};
 })};
}
