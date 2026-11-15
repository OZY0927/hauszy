'use client';
import Script from 'next/script';
import {usePathname} from 'next/navigation';

// Scroll restoration is for public listings. Admin uses a nonce CSP and does
// not need this bootstrap script; keep request headers out of the shared layout
// so project pages can still be generated and revalidated on demand.
export default function PublicScrollScript(){
 const pathname=usePathname();
 if(pathname==='/admin'||pathname?.startsWith('/admin/'))return null;
 return <Script src="/scroll-behavior.js" strategy="beforeInteractive"/>;
}
