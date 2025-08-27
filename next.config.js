/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com'],
  },
};

module.exports = nextConfig;
