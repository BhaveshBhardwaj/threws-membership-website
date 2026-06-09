import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Serif_4 } from 'next/font/google';

import './globals.css';

import NextAuthProvider from '@/components/providers/NextAuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ORG } from '@/lib/site-content';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: `${ORG.name} | Research Collaboration and Academic Networking`,
    template: `%s | ${ORG.name}`,
  },
  description: `${ORG.name} (${ORG.legalName}) bridges university theory and corporate employment through research collaboration, conferences, and structured membership since ${ORG.founded}.`,
  keywords: [
    'Westbridge Research',
    'westbridgeresearch.com',
    'research collaboration',
    'academic networking',
    'ISRP Fellowship',
    'ICSD conference',
    'Strengthen Educational Welfare Society',
  ],
  authors: [{ name: ORG.name }],
  creator: ORG.name,
  publisher: ORG.legalName,
  metadataBase: new URL(`https://${ORG.domain}`),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: `https://${ORG.domain}`,
    siteName: ORG.name,
    title: `${ORG.name} | Research Collaboration and Academic Networking`,
    description: ORG.registration,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${ORG.name} | Research Collaboration and Academic Networking`,
    description: ORG.registration,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sourceSerif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={jakarta.className} suppressHydrationWarning>
        <NextAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
