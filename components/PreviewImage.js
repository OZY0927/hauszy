'use client';
import {useEffect,useRef,useState} from 'react';
import {previewUrl} from '../lib/media';
// Shows a photo's small preview (see lib/media) and falls back to the full photo when it has none.
// onError only fires once the full photo has also failed; `fallback` then replaces it (e.g. the "Image unavailable" artwork).
// The effect catches errors that happened before hydration.
export default function PreviewImage({src,onError,fallback,...props}){
  const image=useRef(null),[full,setFull]=useState(null),[broken,setBroken]=useState(null),preview=previewUrl(src),small=full!==src&&preview!==src,useFallback=Boolean(fallback)&&(!src||broken===src);
  function failed(event){if(useFallback)return;if(small)setFull(src);else{if(fallback)setBroken(src);onError?.(event)}}
  useEffect(()=>{const img=image.current;if(img?.complete&&!img.naturalWidth)failed()},[src,small,useFallback]);
  return <img {...props} ref={image} src={useFallback?fallback:small?preview:src} onError={useFallback?undefined:failed}/>;
}
