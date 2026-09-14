import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { ToastProvider } from '@warkop-yareh/ui';
import './globals.css';
import { AdminSessionBoundary } from '@/components/auth/admin-session-boundary';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#14110e' },
  ],
};

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading-google',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-body-google',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono-google',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Warkop Ya'reh — Admin Terminal",
  description: "Warkop Ya'reh platform admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetBrainsMono.variable} dark h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0c] text-[#e5e1e4] antialiased selection:bg-[#9c6b3a] selection:text-[#f8fafc]">
        <ToastProvider>
          <AdminSessionBoundary>{children}</AdminSessionBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
