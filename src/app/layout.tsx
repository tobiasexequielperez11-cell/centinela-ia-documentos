import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://centinela-ia-documentos.vercel.app'),
  title: {
    default: 'Centinela IA | Gestión documental segura',
    template: '%s | Centinela IA',
  },
  description:
    'Plataforma web para centralizar expedientes, documentos PDF, usuarios, permisos y actividad auditada en un entorno privado.',
  applicationName: 'Centinela IA',
  keywords: [
    'gestión documental',
    'expedientes digitales',
    'documentos privados',
    'auditoría documental',
    'software para estudios jurídicos',
    'software para inmobiliarias',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/brand/centinela-logo-mark.png',
    apple: '/brand/centinela-logo-mark.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'Centinela IA',
    title: 'Centinela IA | Gestión documental segura',
    description:
      'Centralizá expedientes, documentos y accesos desde un panel privado con roles y actividad auditada.',
    images: [
      {
        url: '/brand/centinela-logo-mockup.png',
        width: 1600,
        height: 900,
        alt: 'Centinela IA - Inteligencia operativa para procesos críticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Centinela IA | Gestión documental segura',
    description:
      'Centralizá expedientes, documentos y accesos desde un panel privado con roles y actividad auditada.',
    images: ['/brand/centinela-logo-mockup.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
