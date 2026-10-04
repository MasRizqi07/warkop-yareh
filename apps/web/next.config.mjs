import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const isPreviewDeployment = process.env.VERCEL_ENV === 'preview';
const privatePaths = ['account', 'profile', 'orders', 'order', 'cart', 'checkout', 'payment', 'otp', 'auth', 'login', 'register', 'qr', 'table', 'offline'];
const reportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://images.unsplash.com https://app.sandbox.midtrans.com https://app.midtrans.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.vercel.app https://app.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com",
  "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Content-Security-Policy-Report-Only', value: reportOnlyCsp },
];

if (process.env.NEXT_PUBLIC_TEST_CATALOG === 'true') {
  const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'invalid:');
  const dbUrl = new URL(process.env.DATABASE_URL || 'invalid:');
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    apiUrl.hostname !== '127.0.0.1' ||
    dbUrl.pathname !== '/warkop_audit' ||
    !['127.0.0.1', 'localhost'].includes(dbUrl.hostname)
  ) {
    throw new Error(
      'Test catalog requires a local isolated warkop_audit database and loopback API; it cannot be deployed.'
    );
  }
}

const nextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 2 },
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      ...privatePaths.map((path) => ({ source: `/${path}/:rest*`, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] })),
      ...(isPreviewDeployment
        ? [
            {
              source: '/(.*)',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
          ]
        : []),
    ];
  },
  async redirects() {
    return [
      // Next.js uses HTTP 308 for permanent redirects for Decommissioned Speculative Routes
      { source: '/booking', destination: '/outlets', permanent: true },
      { source: '/reservations', destination: '/outlets', permanent: true },
      { source: '/community', destination: '/', permanent: true },
      { source: '/community/:path*', destination: '/', permanent: true },
      { source: '/events', destination: '/', permanent: true },
      { source: '/events/:path*', destination: '/', permanent: true },
      { source: '/loyalty', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:path*', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
