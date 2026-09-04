import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CharlesAcmen — Systems in Motion',
  description:
    'CharlesAcmen builds systems in motion: CUDA graphics, distributed systems, and real-time infrastructure.',
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
