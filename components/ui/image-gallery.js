'use client';
import {useRef} from 'react';
import PreviewImage from '../PreviewImage';
import Icon from '../Icon';
import styles from './image-gallery.module.css';

// Expanding photo panels adapted from the supplied gallery example.
export default function ImageGallery({photos=[],name,activeIndex=0,onActiveChange,onOpen,onPrevious,onNext}){
 const touchWasActive=useRef(false);
 const visible=photos.slice(0,9);
 if(!photos.length)return null;
 return <div className={styles.gallery} role="region" aria-label={`${name} project photography`} onKeyDown={event=>{
  if(event.key==='ArrowRight'){event.preventDefault();onNext()}
  if(event.key==='ArrowLeft'){event.preventDefault();onPrevious()}
 }}>
  <div className={styles.mobileGallery}>
   <button type="button" className={styles.mobilePhoto} onClick={onOpen} aria-label={`Open ${name} photo ${activeIndex+1} of ${photos.length}`}>
    <PreviewImage key={photos[activeIndex]} src={photos[activeIndex]} alt={`${name} — project photo ${activeIndex+1}`} loading="lazy" onError={event=>{event.currentTarget.src='/project-placeholder.svg'}}/>
   </button>
   <div className={styles.mobileControls}>
    <button type="button" onClick={onPrevious} disabled={photos.length<2} aria-label="Previous project photo"><Icon name="arrowLeft"/><span>Previous</span></button>
    <span aria-live="polite" aria-atomic="true">{activeIndex+1} / {photos.length}</span>
    <button type="button" onClick={onNext} disabled={photos.length<2} aria-label="Next project photo"><span>Next</span><Icon name="arrowRight"/></button>
   </div>
  </div>
  <div className={styles.panels}>
   {visible.map((src,index)=>{
    const photoIndex=index,active=photoIndex===activeIndex;
    return <button type="button" key={`${photoIndex}-${src}`} className={styles.panel} aria-label={`${active?'Open':'Select'} ${name} photo ${photoIndex+1} of ${photos.length}`} onPointerDown={()=>{touchWasActive.current=active}} onPointerEnter={event=>{if(event.pointerType==='mouse')onActiveChange(photoIndex)}} onFocus={()=>onActiveChange(photoIndex)} onClick={event=>{
     // Touch selects a collapsed panel first; tapping the expanded image opens it.
     if(event.nativeEvent.pointerType==='touch'&&!touchWasActive.current)onActiveChange(photoIndex);
     else{onActiveChange(photoIndex);onOpen()}
    }}>
     <PreviewImage src={src} alt={`${name} — project photo ${photoIndex+1}`} loading="lazy" onError={event=>{event.currentTarget.src='/project-placeholder.svg'}}/>
     <span className={styles.number} aria-hidden="true">{String(photoIndex+1).padStart(2,'0')}</span>
    </button>;
   })}
  </div>
  <div className={styles.footer}>
   <p>{name}<span>Project photography</span></p>
   <div className={styles.controls}>
    <span aria-live="polite" aria-atomic="true">{String(activeIndex+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span>
   </div>
   <span className={styles.hint}>Explore a different perspective.</span>
  </div>
 </div>;
}
