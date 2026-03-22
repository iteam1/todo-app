import type { Metadata } from 'next';
import ClientRoot from './client-root';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo list application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
