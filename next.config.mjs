const config = {
  trailingSlash: true,
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
