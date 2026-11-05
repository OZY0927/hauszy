import {securityHeaders} from './lib/security-headers.js';
const config = {
  trailingSlash: true,
  poweredByHeader: false,
  async headers(){return [{source:'/:path*',headers:securityHeaders(process.env.NODE_ENV==='production')}]},
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
