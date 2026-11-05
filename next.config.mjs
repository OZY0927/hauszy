import {securityHeaders} from './lib/security-headers.js';
const config = {
  trailingSlash: true,
  poweredByHeader: false,
  // Admin pages get their own nonce CSP (which allows uploads to storage) from proxy.js. Browsers enforce every CSP header
  // they receive, so the public CSP must not also be sent there or it blocks those uploads.
  async headers(){const all=securityHeaders(process.env.NODE_ENV==='production'),isCsp=h=>h.key==='Content-Security-Policy';return [{source:'/:path*',headers:all.filter(h=>!isCsp(h))},{source:'/:path((?!admin(?:/|$)).*)',headers:all.filter(isCsp)}]},
  // Optimize legacy Firebase media only; Supabase uploads load directly from our /media/ route.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/hauszy.firebasestorage.app/o/**' }],
    qualities: [75]
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/projects.html', destination: '/projects', permanent: true },
      { source: '/property.html', has: [{ type: 'query', key: 'id', value: '(?<projectId>[^/]+)' }], destination: '/projects/:projectId', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/loan-calculator.html', destination: '/tools/loan-calculator', permanent: true }
    ];
  }
};
export default config;
