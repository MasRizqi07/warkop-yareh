
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // 301 Permanent Redirects for Decommissioned Speculative Routes
      { source: '/booking', destination: '/outlets', permanent: true },
      { source: '/reservations', destination: '/outlets', permanent: true },
      { source: '/community', destination: '/', permanent: true },
      { source: '/community/:path*', destination: '/', permanent: true },
      { source: '/events', destination: '/', permanent: true },
      { source: '/events/:path*', destination: '/', permanent: true },
      { source: '/loyalty', destination: '/', permanent: true },

      // 302 Temporary Redirects for Parked Commerce & Customer Routes
      { source: '/cart', destination: '/menu', permanent: false },
      { source: '/checkout', destination: '/menu', permanent: false },
      { source: '/checkout/:path*', destination: '/menu', permanent: false },
      { source: '/order/track/:path*', destination: '/', permanent: false },
      { source: '/orders', destination: '/', permanent: false },
      { source: '/orders/:path*', destination: '/', permanent: false },
      { source: '/payment/status', destination: '/', permanent: false },
      { source: '/table/:path*', destination: '/outlets', permanent: false },
      { source: '/qr/:path*', destination: '/outlets', permanent: false },
      { source: '/account', destination: '/', permanent: false },
      { source: '/profile', destination: '/', permanent: false },
      { source: '/register', destination: '/login', permanent: false },
      { source: '/otp', destination: '/login', permanent: false },
      { source: '/blog', destination: '/', permanent: false },
      { source: '/blog/:path*', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
