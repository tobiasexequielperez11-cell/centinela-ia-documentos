# Centinela IA

**Centinela IA** es una plataforma web en beta operativa y desarrollo activo para gestión documental inteligente, análisis IA, auditoría, control de usuarios, permisos y reportes operativos.

El proyecto está orientado inicialmente a organizaciones que manejan expedientes, documentos sensibles y flujos administrativos, como estudios jurídicos, escribanías, inmobiliarias, gestorías, estudios contables y PyMEs.

Demo online:
https://centinela-ia-documentos.vercel.app/

---

## Estado actual

**Estado:** Beta operativa / Desarrollo activo
**Sprint actual:** Sprint 14 — UX, experiencia y pulido profesional
**Próximo objetivo:** Sprint 15 — Presentación comercial, demo guiada, casos de uso y preparación de venta.

Centinela IA ya cuenta con una base funcional online, desplegada en Vercel, con autenticación, gestión documental, análisis IA simulado, reportes, auditoría, usuarios, roles, seguridad por organización y paneles internos de control.

---

## Funcionalidades implementadas

* Login y logout online.
* Dashboard operativo.
* Gestión de expedientes.
* Gestión de documentos.
* Carga documental.
* Supabase Storage.
* Visor PDF.
* Enlaces temporales seguros.
* IA simulada/local.
* Historial de análisis IA.
* Reportes operativos.
* Auditoría de actividad.
* Usuarios.
* Invitaciones operativas y reales.
* Roles `admin` y `employee`.
* Bloqueo de rutas sensibles.
* Recuperación de contraseña.
* Validación de sesión.
* Políticas RLS por organización.
* Políticas de Storage.
* Acceso a documentos por `organization_id`.
* Acceso a expedientes por `organization_id`.
* Protección de reportes sensibles.
* Protección de auditoría.
* Validaciones server-side.
* GitHub.
* Deploy en Vercel.
* Variables protegidas.
* Tester externo.
* Planilla de incidencias.
* Documento de cierre beta.
* Panel interno de estado beta.
* Panel de seguridad y permisos.
* Panel de variables y entorno.

---

## Stack técnico

* **Frontend:** Next.js 16.2.6, React, TypeScript, Tailwind CSS.
* **Backend / BaaS:** Supabase.
* **Base de datos:** PostgreSQL.
* **Autenticación:** Supabase Auth.
* **Storage:** Supabase Storage.
* **Deploy:** Vercel.
* **Control de versiones:** GitHub.
* **IA:** modo simulado/local actualmente. Preparado para futura integración con IA real vía API.

---

## Arquitectura general

El sistema utiliza una arquitectura basada en organizaciones, usuarios, roles, expedientes y documentos.

Tablas principales:

* `profiles`
* `organizations`
* `cases`
* `documents`
* `ai_outputs`
* `audit_logs`
* `user_invitations`

El flujo principal permite que una organización cargue documentos, los asocie a expedientes, visualice archivos PDF, ejecute análisis IA simulado, consulte reportes y mantenga trazabilidad mediante auditoría.

---

## Seguridad

Centinela IA implementa una base de seguridad pensada para beta privada y preparación comercial:

* Autenticación con Supabase Auth.
* Roles internos.
* Rutas protegidas.
* Validaciones server-side.
* Separación por organización.
* Row Level Security en Supabase.
* Storage privado.
* Enlaces temporales para documentos.
* Auditoría de acciones sensibles.
* Variables de entorno protegidas.
* Bloqueo de acceso a rutas sensibles según rol.

El objetivo del Sprint 13 fue fortalecer la seguridad del sistema mediante RLS, permisos, Storage privado y control de acceso por organización.

---

## Modo IA

Actualmente Centinela IA trabaja con **IA simulada/local**, sin consumo de API paga.

El sistema ya cuenta con estructura para guardar análisis en la tabla `ai_outputs`, incluyendo historial, modelo utilizado, resultado JSON, documento asociado y organización.

A futuro, el sistema podrá incorporar IA real para:

* resumen de documentos;
* clasificación documental;
* detección de datos sensibles;
* generación de checklist;
* identificación de posibles faltantes;
* dictamen operativo;
* reportes inteligentes.

---

## Roadmap reciente

### Sprint 10 — Configuración interna y control operativo

* Panel interno de estado beta.
* Panel de seguridad y permisos.
* Panel de variables y entorno.
* Revisión operativa general.

### Sprint 11 — Invitaciones reales y alta de usuarios

* Enviar invitación real por email.
* Aceptar invitación desde un enlace.
* Crear perfil automáticamente.
* Asignar organización automáticamente.
* Validar invitación vencida.
* Evitar invitaciones duplicadas.
* Evitar usuarios duplicados.
* Controlar estados `pending`, `accepted`, `expired`.
* Pantalla pública de aceptar invitación.

### Sprint 12 — Recuperación de contraseña y sesión

* Pantalla “Olvidé mi contraseña”.
* Enviar link de recuperación.
* Pantalla de nueva contraseña.
* Confirmación de contraseña actualizada.
* Mensajes de error claros.
* Validación de sesión vencida.
* Mejor control de login/logout.

### Sprint 13 — Seguridad fuerte, RLS, Storage y permisos

* Políticas RLS por organización.
* Políticas de Storage.
* Acceso a documentos por `organization_id`.
* Acceso a expedientes por `organization_id`.
* Limitación real por rol `admin` / `employee`.
* Validación server-side.
* Protección de reportes sensibles.
* Protección de auditoría.
* Prevención de exposición cruzada entre organizaciones.

### Sprint 14 — UX, experiencia y pulido profesional

* Mejora visual del sistema.
* Microtextos más claros.
* Paneles más profesionales.
* Mejor experiencia de uso.
* Preparación para demo beta.

### Sprint 15 — Presentación comercial y preparación de venta

* Landing comercial.
* Demo guiada.
* Video corto de uso.
* Documento comercial.
* Casos de uso por rubro.
* Plan de precios.
* Pitch para estudios jurídicos.
* Pitch para escribanías.
* Pitch para inmobiliarias.
* Pitch para PyMEs.
* Checklist de presentación.
* Guion para llamada comercial.

---

## Mercado objetivo inicial

Centinela IA está pensado inicialmente para:

* estudios jurídicos;
* escribanías;
* inmobiliarias;
* gestorías;
* estudios contables;
* PyMEs con alta carga documental.

La propuesta principal es centralizar expedientes, documentos, usuarios, auditoría, análisis IA y reportes en una sola plataforma.

---

## Visión escalable

Centinela IA nace como una plataforma documental, pero está diseñada como una base escalable para futuros módulos y verticales:

* gestión documental inteligente;
* ciberseguridad para PyMEs;
* control de activos digitales;
* protección de datos;
* gestión de proyectos;
* bitácoras operativas;
* drones y operaciones técnicas;
* logística;
* educación;
* salud;
* agro;
* industria;
* defensa y ciberdefensa en entornos no clasificados.

La visión del proyecto es evolucionar hacia una suite modular de inteligencia artificial, seguridad, documentación y control operativo para organizaciones.

---

## Instalación local

Clonar el repositorio:

```bash
git clone https://github.com/tobiasexequielperez11-cell/centinela-ia-documentos.git
```

Entrar al proyecto:

```bash
cd centinela-ia-documentos
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env.local` con las variables necesarias de Supabase y Vercel.

Ejecutar en desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

```txt
http://localhost:3000
```

---

## Variables de entorno

El proyecto utiliza variables de entorno para conectar con Supabase y proteger credenciales.

No se deben subir claves privadas al repositorio.

Ejemplo de variables necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Las variables sensibles deben configurarse en el entorno correspondiente y no compartirse públicamente.

---

## Licencia

Proyecto privado en desarrollo.

Se evalúa una futura apertura como proyecto open source o versión pública controlada, manteniendo separación entre código demostrativo, configuración sensible y datos privados.

---

## Contacto

Desarrollado por **Tobias Exequiel Pérez**.

Email:
[tobiasexequielperez11@gmail.com](mailto:tobiasexequielperez11@gmail.com)

GitHub:
https://github.com/tobiasexequielperez11-cell
