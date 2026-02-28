import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexara IMS — Administrator Training Portal',
  description: 'Role-Based Administrator Training Programme — Nexara Certified Platform Administrator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0B1E38] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
