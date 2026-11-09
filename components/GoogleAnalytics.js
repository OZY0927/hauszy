'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import {firebaseConfig} from '../lib/firebase-config';
import {analyticsPage,CONSENT_KEY,deniedConsent} from '../lib/analytics';
const tag=process.env.NEXT_PUBLIC_GOOGLE_TAG_ID||firebaseConfig.measurementId;
const validTag=process.env.NEXT_PUBLIC_ANALYTICS_ENABLED==='true'&&/^G-[A-Z0-9]+$/.test(tag||'');
export default function GoogleAnalytics(){
 const path=usePathname(),[consent,setConsent]=useState(null),[ready,setReady]=useState(false),[settings,setSettings]=useState(false),[loaded,setLoaded]=useState(false),last=useRef(''),configured=useRef(false);
 const page=analyticsPage(path,'https://placeholder.invalid'),allowed=!!page&&consent==='accepted';
 useEffect(()=>{try{const saved=localStorage.getItem(CONSENT_KEY);if(['accepted','declined'].includes(saved))setConsent(saved)}catch{}setLoaded(true);const reopen=()=>setSettings(true);window.addEventListener('hauszy-open-consent',reopen);return()=>window.removeEventListener('hauszy-open-consent',reopen)},[]);
 useEffect(()=>{if(!validTag)return;window[`ga-disable-${tag}`]=!allowed;if(!allowed){last.current='';return}
 window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 if(!configured.current){window.gtag('consent','default',deniedConsent);window.gtag('set','ads_data_redaction',true);window.gtag('js',new Date());configured.current=true;}
 window.gtag('consent','update',{...deniedConsent,analytics_storage:'granted'});
 // No query strings, referrers, form data, calculator inputs or private page titles.
 window.gtag('config',tag,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,ignore_referrer:true,...analyticsPage(path,window.location.origin)});
 if(ready&&last.current!==path){window.gtag('event','page_view',{send_to:tag,...analyticsPage(path,window.location.origin)});last.current=path;}
 },[allowed,path,ready]);
 function choose(value){setConsent(value);setSettings(false);try{localStorage.setItem(CONSENT_KEY,value)}catch{}
 window.dispatchEvent(new Event('hauszy-consent-change'));
 if(value==='declined'){window[`ga-disable-${tag}`]=true;window.gtag?.('consent','update',deniedConsent);last.current='';for(const cookie of document.cookie.split(';')){const name=cookie.split('=')[0].trim();if(/^_ga(?:_|$)|^_gid$|^_gat/.test(name)){const domains=window.location.hostname.split('.');document.cookie=`${name}=; Max-Age=0; path=/`;for(let i=0;i<domains.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; domain=.${domains.slice(i).join('.')}`;}}}
 }
 if(!page)return null;
 return <>{validTag&&allowed&&<Script id="hauszy-google-tag" src={`https://www.googletagmanager.com/gtag/js?id=${tag}`} strategy="afterInteractive" onReady={()=>setReady(true)}/>}{loaded&&(consent===null||settings)&&<section className="cookie-banner" aria-label="Analytics preferences"><div className="cookie-panel-top"><span>YOUR PRIVACY</span><button className="cookie-close" type="button" aria-label="Decline analytics and close" onClick={()=>choose('declined')}>Close</button></div><div><h2>Your privacy, your choice.</h2><p>We use optional analytics cookies to understand how you explore Hauszy and improve your experience. You can browse without them. <Link href="/privacy/">Privacy notice</Link></p></div><div className="cookie-actions"><button type="button" className="cookie-decline" onClick={()=>choose('declined')}>Decline</button><button type="button" className="cookie-accept" onClick={()=>choose('accepted')}>Accept</button></div></section>}</>;
}
