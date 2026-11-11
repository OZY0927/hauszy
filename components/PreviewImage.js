'use client';
import {useEffect,useRef,useState} from 'react';
import {previewUrl} from '../lib/media';
// Shows a photo's small preview (see lib/media) and falls back to the full photo when it has none.
// onError only fires once the full photo has also failed. The effect catches errors that happened before hydration.
export default function PreviewImage({src,onError,...props}){
  const image=useRef(null),[full,setFull]=useState(null),preview=previewUrl(src),small=full!==src&&preview!==src;
  function failed(event){if(small)setFull(src);else onError?.(event)}
  useEffect(()=>{const img=image.current;if(img?.complete&&!img.naturalWidth)failed()},[src,small]);
  return <img {...props} ref={image} src={small?preview:src} onError={failed}/>;
}
