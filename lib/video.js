import {isSafeHttpsUrl} from './secure-url.js';
const FILE=/\.(mp4|m4v|webm|ogv|ogg|mov)$/i,ID=/^[\w-]{6,20}$/;
// Turns a project's videoUrl into something the page can play on loop, or null when it isn't a supported video link.
// Supported: YouTube (watch, youtu.be, shorts, embed, live), Vimeo, and direct video files (.mp4, .webm, .mov…).
export function videoSource(url){
  if(!isSafeHttpsUrl(url))return null;const u=new URL(url),host=u.hostname.replace(/^(www|m)\./,''),parts=u.pathname.split('/').filter(Boolean);
  if(host==='youtube.com'||host==='youtube-nocookie.com'||host==='youtu.be'){
    const id=host==='youtu.be'?parts[0]:parts[0]==='watch'||!parts.length?u.searchParams.get('v'):['shorts','embed','live','v'].includes(parts[0])?parts[1]:null;
    return ID.test(id||'')?{kind:'embed',provider:'youtube',origin:'https://www.youtube-nocookie.com',src:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&rel=0&enablejsapi=1`}:null}
  if(host==='vimeo.com'||host==='player.vimeo.com'){
    const i=parts.findIndex(v=>/^\d+$/.test(v));if(i<0)return null;const hash=u.searchParams.get('h')||(/^[\da-f]+$/i.test(parts[i+1]||'')?parts[i+1]:'');
    return {kind:'embed',provider:'vimeo',origin:'https://player.vimeo.com',src:`https://player.vimeo.com/video/${parts[i]}?autoplay=1&muted=1&loop=1&playsinline=1${hash?'&h='+hash:''}`}}
  return FILE.test(u.pathname)?{kind:'file',src:url}:null;
}
