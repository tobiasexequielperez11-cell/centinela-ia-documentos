import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centinela IA Documentos',
  description: 'Bóveda documental segura con inteligencia artificial para PYMES.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
