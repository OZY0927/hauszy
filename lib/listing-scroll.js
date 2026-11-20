export const LISTING_SCROLL_KEY='hauszy-listing-return';
export function listingReturnSnapshot(raw,projectCount){
 try{
  const value=JSON.parse(raw);
  if(!value||!Number.isFinite(value.y)||value.y<0||value.y>10000000)return null;
  const hasOffset=value.resultOffset!==undefined;
  const hasPage=value.resultPage!==undefined;
  if(hasOffset){
   if(value.resultOffset!==null&&(!Number.isSafeInteger(value.resultOffset)||value.resultOffset<0))return null;
  }else if(hasPage){
   if(!Number.isSafeInteger(value.resultPage)||value.resultPage<1)return null;
  }else if(!Number.isInteger(value.visibleCount)||value.visibleCount<1)return null;
  if(typeof value.location!=='string'||value.location.length>500||typeof value.type!=='string'||value.type.length>200)return null;
  if(!Number.isFinite(value.minimum)||value.minimum<0||!(value.maximum===null||Number.isFinite(value.maximum)&&value.maximum>=value.minimum))return null;
  return {...value,...(!hasOffset&&!hasPage&&{visibleCount:Math.min(value.visibleCount,Math.max(9,projectCount))}),view:value.view==='list'?'list':'grid',savedOnly:value.savedOnly===true};
 }catch{return null}
}
export function isListingReturn(target,path){return typeof target==='string'&&target.replace(/\/+$/,'')===path.replace(/\/+$/,'')}
