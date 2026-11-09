'use client';
export default function CookiePreferences(){return <button type="button" className="cookie-preferences-link" onClick={()=>window.dispatchEvent(new Event('hauszy-open-consent'))}>Change cookie preferences</button>}
