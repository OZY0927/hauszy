import {NextResponse} from 'next/server';
import {securityHeaders} from './lib/security-headers';
export function proxy(request){
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
 const policy=securityHeaders(process.env.NODE_ENV==='production',nonce).find(h=>h.key==='Content-Security-Policy').value;
 const headers=new Headers(request.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers}});
 response.headers.set('Content-Security-Policy',policy);
 response.headers.set('Cache-Control','private, no-store, no-transform');
 return response;
}
export const config={matcher:'/admin/:path*'};
