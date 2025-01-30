/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [{
          protocol: 'https',
          hostname: 'storage.exabin.com',
          port: '',
          pathname: '/**'
        }]
      },
};

export default nextConfig;
