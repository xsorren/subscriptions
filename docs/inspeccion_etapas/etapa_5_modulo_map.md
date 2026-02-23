# Etapa 5 — Inspección del módulo Map

## Archivos auditados

- `frontend/src/app/(app)/(tabs)/map.tsx`
- `frontend/src/features/map/hooks/useCurrentLocation.ts`
- `frontend/src/features/map/hooks/useDiscoverEligibleClubs.ts`
- `frontend/src/features/map/api/map.service.ts`
- `frontend/src/features/map/utils/openExternalMaps.ts`

## Hallazgos

### H1 (P1) — Estado de permisos/errores de ubicación no visible en UI

El hook devolvía coordenadas y loading, pero no exponía errores ni estado de permisos para feedback claro.

### H2 (P1) — Discover sin control de radio desde UI

El flujo de discover no permitía ajustar radius en runtime, reduciendo utilidad de exploración.

### H3 (P2) — Falta acción de reintento explícita en errores de discover

La pantalla mostraba error pero no CTA de reintento directo.

## Correcciones aplicadas

1. Se amplió `useCurrentLocation` con `permissionDenied`, `error` y `refresh`.
2. Se añadió selector de radio en mapa (2km/5km/10km) conectado al discover.
3. Se agregó botón de reintento para discover y refresco de ubicación.

## Resultado etapa 5

- Flujo Map más robusto ante permisos/errores.
- Mejor control de descubrimiento y recuperación en UX.
