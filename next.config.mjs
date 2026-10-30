const config = {
  trailingSlash: true,
  // Card photos are resized per screen by next/image. Only the project's Firebase Storage bucket is allowed.
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
