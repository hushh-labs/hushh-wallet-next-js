import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hushh Taste Card - Build Your Apple Wallet Card',
  description: 'Pick five preferences and add a clean, luxury taste card to Apple Wallet. Simplified taste preferences for modern living.',
  keywords: 'apple wallet, taste card, preferences, food, lifestyle, hushh',
  authors: [{ name: 'HushOne, Inc.' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  openGraph: {
    title: 'Hushh Taste Card',
    description: 'Build your personalized taste card for Apple Wallet',
    type: 'website',
    locale: 'en_US',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hushh Taste Card',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
