// Public pages show uploaded images from this site's /media/ path (see app/media), so visitors never see the storage project's address.
// Safe for client bundles: nothing here reads the storage origin from the environment.
export const MEDIA_PATH='/media/';
const FIREBASE_MEDIA='https://firebasestorage.googleapis.com/v0/b/hauszy.firebasestorage.app/o/';
const SEGMENT=/^[A-Za-z0-9_-][A-Za-z0-9._-]{0,199}$/,IMAGE_FILE=/\.(jpe?g|png|webp)$/i;
// "/media/<bucket>/<folder>/<file>.jpg" with plain path segments only.
export function isMediaPath(value){if(typeof value!=='string'||!value.startsWith(MEDIA_PATH)||value.length>1024)return false;const parts=value.slice(MEDIA_PATH.length).split('/');return parts.length>=2&&parts.every(p=>SEGMENT.test(p)&&!p.includes('..'))&&IMAGE_FILE.test(value)}
// Images next/image may resize: legacy Firebase uploads only. Its optimizer cannot fetch our own /media/ route on the host, so those load directly.
export const isOptimizedImage=src=>typeof src==='string'&&src.startsWith(FIREBASE_MEDIA);
// Rewrites the storage origin's public object URLs anywhere in a record to /media/ paths.
export function hideStorageUrls(value,origin){
 if(!origin)return value;
 const prefix=`${origin}/storage/v1/object/public/`;
 const walk=v=>typeof v==='string'?(v.startsWith(prefix)&&isMediaPath(MEDIA_PATH+v.slice(prefix.length))?MEDIA_PATH+v.slice(prefix.length):v):Array.isArray(v)?v.map(walk):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)])):v;
 return walk(value);
}
// The storage URL behind a /media/ path, or null unless it is an image in the given bucket.
export function mediaSource(segments,origin,bucket){
 const path=MEDIA_PATH+(segments||[]).join('/');
 return origin&&segments?.[0]===bucket&&isMediaPath(path)?`${origin}/storage/v1/object/public/${segments.join('/')}`:null;
}
// Pages show a small preview first and load the full photo only when it is opened.
// The admin uploads it beside each photo as "<name>-preview.webp"; older photos have none, so PreviewImage falls back to the full one.
export const PREVIEW_SIZE=1200;
const PHOTO_NAME=/\/([A-Za-z0-9_-]{1,128})\.(jpe?g|png|webp)$/i;
export const photoName=src=>{const name=typeof src==='string'?src.match(PHOTO_NAME)?.[1]:null;return name&&!name.endsWith('-preview')?name:null};
export function previewUrl(src){const name=photoName(src);return name&&(src.startsWith(MEDIA_PATH)||src.includes('/storage/v1/object/public/'))?src.replace(PHOTO_NAME,`/${name}-preview.webp`):src}
