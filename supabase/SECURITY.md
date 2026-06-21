# Seguridad por roles y organizaciones

La fuente de verdad de permisos de la aplicacion esta en
`src/lib/permissions/roles.ts`. Las acciones del servidor vuelven a validar esos
permisos antes de escribir datos.

## Matriz

- `admin`: lectura y escritura dentro de su propia organizacion; administra
  usuarios e invitaciones de esa organizacion.
- `employee`: lectura de la organizacion; crea y actualiza expedientes, sube
  documentos y ejecuta analisis.
- `auditor`: solo lectura de expedientes, documentos y auditoria de su
  organizacion.
- `client`: solo lectura de expedientes asignados mediante `cases.assigned_to`
  y de sus documentos vinculados. No accede a usuarios, reportes, auditoria ni
  configuracion.

## Aplicacion en Supabase

Despues de desplegar el codigo, ejecutar `role-security-stage-1.sql` desde el
SQL Editor de Supabase. El script:

1. Bloquea mutaciones de expedientes, documentos y analisis para Auditor y
   Cliente.
2. Impide cambiar `organization_id` y evita que un usuario cambie su propio
   rol.
3. Restringe `user_invitations` a administradores de la misma organizacion.
4. Limita Storage privado con la misma matriz de lectura y escritura.

La clave `SUPABASE_SERVICE_ROLE_KEY` omite RLS y solo debe usarse en codigo de
servidor. El flujo de aceptacion de invitaciones la utiliza despues de validar
email, token y organizacion.
