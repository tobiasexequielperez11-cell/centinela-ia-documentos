# Centinela IA

Centinela IA es una plataforma SaaS de gestión documental segura con inteligencia artificial, orientada inicialmente a escribanías, estudios jurídicos, estudios contables, inmobiliarias y PYMES.

## Estado de este paquete

Este paquete inicial contiene el Sprint 1 implementado:

- Landing pública.
- Layout privado.
- Sidebar.
- Topbar.
- Dashboard visual.
- Rutas placeholder.
- Estructura base de carpetas.
- SQL base de Supabase.
- Corrección previa de Storage Policies.
- Helper inicial de roles.

Todavía no conecta autenticación real, expedientes reales ni documentos reales. Eso se implementa en los siguientes sprints.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Storage
- OpenAI API

## Instalación local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Supabase

1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Ejecutar `supabase/storage-policies.sql`.
4. Copiar URL y anon key en `.env.local`.

## Seguridad

- No subir `.env.local` a Git.
- No usar documentos reales en demo inicial.
- Usar datos ficticios hasta verificar RLS, Storage privado y signed URLs.

## Primer commit sugerido

```bash
git add .
git commit -m "feat: sprint 1 base visual inicial"
```
