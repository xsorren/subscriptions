# Etapa 6 — Inspección del módulo Clubs

## Archivos auditados

- `frontend/src/app/(app)/clubs/[clubId].tsx`
- `frontend/src/features/clubs/api/clubs.service.ts`
- `frontend/src/features/clubs/hooks/useClubDetail.ts`
- `frontend/src/features/clubs/hooks/useClubEligibility.ts`

## Hallazgos

### H1 (P1) — Detalle de club sin recuperación explícita de error

La pantalla no mostraba CTAs de reintento cuando fallaba detalle o elegibilidad.

### H2 (P1) — Información de sedes subutilizada

Solo se utilizaba la primera sede para `Cómo llegar`; no se listaban sedes para que el usuario elija.

### H3 (P2) — Tipado de elegibilidad acoplado inline

El tipo de respuesta de elegibilidad estaba embebido en la función y no reutilizable por el resto del módulo.

## Correcciones aplicadas

1. Se añadió tipado explícito `ClubEligibility` en servicio.
2. Se reforzó la pantalla con estados de error y botones de reintento.
3. Se incorporó listado de sedes y CTA "Cómo llegar" por sede.

## Resultado etapa 6

- Flujo de club más confiable y accionable para usuario final.
- Mayor claridad de datos y robustez de navegación hacia mapas.
