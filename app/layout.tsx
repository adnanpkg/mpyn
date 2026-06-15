import './globals.css';
import type { Metadata } from 'next';
import { Figtree, Inter, DM_Mono, Average_Sans } from 'next/font/google';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-figtree',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const averageSans = Average_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-average-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'multiply.',
  description: 'multiply.',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#000000',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${inter.variable} ${dmMono.variable} ${averageSans.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
