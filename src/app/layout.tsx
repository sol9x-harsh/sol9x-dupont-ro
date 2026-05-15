import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'SOL9X - RO Design Studio',
  description:
    'Production-grade Reverse Osmosis engineering and design application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='antialiased font-sans'>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
