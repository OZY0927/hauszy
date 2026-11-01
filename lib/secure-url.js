export function isSafeHttpsUrl(value){
 if(typeof value!=='string'||value.length>4096||/[\u0000-\u0020\u007f\\]/.test(value))return false;
 try{const url=new URL(value);return url.protocol==='https:'&&!!url.hostname&&!url.username&&!url.password}catch{return false}
}
