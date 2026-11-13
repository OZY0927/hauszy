// Compare saved values by content, independent of object property order.
function equal(a,b){
 if(a===b)return true;
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
 if(Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);
 return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&equal(a[key],b[key]));
}
// Replace changed top-level maps/arrays as a whole, including removals within them.
// Identity and timestamps are managed by the save operation, never by JSON import.
export function projectChanges(previous,next){
 const fields={},removed=[];
 for(const key of new Set([...Object.keys(previous),...Object.keys(next)])){
  if(['id','createdAt','updatedAt'].includes(key))continue;
  if(!Object.hasOwn(next,key)){removed.push(key);continue}
  if(!equal(previous[key],next[key]))fields[key]=next[key];
 }
 return {fields,removed};
}
