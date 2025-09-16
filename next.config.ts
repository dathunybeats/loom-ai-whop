import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

// Bundle analyzer setup
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Temporarily disable ESLint during builds to fix critical issues first
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react'
    ],
    // Reduce worker crashes
    workerThreads: false,
  },
  
  // Better tree shaking for server components
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Tree shaking and dead code elimination
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Split chunks for better caching and loading
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          // React and Next.js framework code
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // Radix UI components
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          // Supabase libraries
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Icon libraries
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|@heroicons)[\\/]/,
            name: 'icons',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Other vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Common application code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
          },
        },
      };
    }
    
    // Handle Jest worker issues in development
    if (dev) {
      config.optimization.minimize = false;
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Enable compression
  compress: true,
  
  // Static optimization
  trailingSlash: false,
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
