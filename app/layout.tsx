import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CharlesAcmen — A Studio by the Sea',
  description:
    'A hand-drawn coastal portfolio for CharlesAcmen: CUDA graphics, distributed systems, and real-time infrastructure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
