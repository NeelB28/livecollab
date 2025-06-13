/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental appDir - not stable in Next.js 12
  // experimental: {
  //   appDir: true,
  // },

  // Configure webpack for react-pdf and other dependencies
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Add rule for PDF files
    config.module.rules.push({
      test: /\.pdf$/,
      type: "asset/resource",
    });

    // Handle mjs files (for ES modules)
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },

  // Configure headers for CORS and security
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Configure redirects
  async redirects() {
    return [
      {
        source: "/viewer",
        destination: "/",
        permanent: false,
      },
    ];
  },

  // Configure image domains (if needed for user avatars)
  images: {
    domains: ["localhost", "your-domain.com"],
    unoptimized: true,
  },

  // Enable strict mode
  reactStrictMode: true,

  // Configure ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configure TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configure environment variables
  env: {
    CUSTOM_KEY: "my-value",
  },

  // Configure public runtime config
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: "/static",
  },

  // Configure server runtime config
  serverRuntimeConfig: {
    // Will only be available on the server
    mySecret: "secret",
  },
};

module.exports = nextConfig;
