import {supabaseOrigin} from './supabase-config.js';
export function securityHeaders(production=false,nonce=null){
 // Static pages need Next.js hydration scripts. A nonce-only CSP would require dynamic rendering.
 // Only admin pages (with a nonce) upload to storage, so public pages never name the storage origin.
 const storageOrigin=supabaseOrigin();
 const policy=["default-src 'self'",`script-src 'self' ${nonce?"'nonce-"+nonce+"' 'strict-dynamic'":"'unsafe-inline'"}${production?'':" 'unsafe-eval'"} https://www.googletagmanager.com https://apis.google.com${nonce?'':' https://static.cloudflareinsights.com'}`,"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com","img-src 'self' data: blob: https:","font-src 'self' data: https://fonts.gstatic.com",`connect-src 'self'${nonce&&storageOrigin?' '+storageOrigin:''}${production?'':' ws: wss:'} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://firebasestorage.googleapis.com https://www.googleapis.com https://*.google-analytics.com https://www.googletagmanager.com https://tile.openstreetmap.org${nonce?'':' https://cloudflareinsights.com'}`,"media-src 'self' https: blob:","frame-src https://hauszy.firebaseapp.com https://www.youtube-nocookie.com https://player.vimeo.com","worker-src 'self' blob:","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'",...(production?['upgrade-insecure-requests']:[])].join('; ');
 return [
 {key:'Content-Security-Policy',value:policy},
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=(), usb=()'},
 {key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'},
 {key:'X-DNS-Prefetch-Control',value:'off'},
 ...(production?[{key:'Strict-Transport-Security',value:'max-age=31536000'}]:[])
 ];
}
