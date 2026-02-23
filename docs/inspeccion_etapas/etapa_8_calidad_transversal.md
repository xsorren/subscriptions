# Etapa 8 — Calidad transversal

## Archivos auditados

- `frontend/src/core/lib/edgeFunctions.ts`
- `frontend/src/shared/ui/components/StateMessage.tsx`
- `frontend/src/app/(public)/sign-in.tsx`
- `frontend/src/app/(app)/coupons/redeem-qr.tsx`
- `frontend/src/app/(app)/(tabs)/map.tsx`

## Hallazgos

### H1 (P1) — Modelo de errores no estandarizado

Los errores de Edge Functions se levantaban como `Error` genérico sin código ni contexto reutilizable.

### H2 (P1) — Telemetría de eventos no implementada

No había utilitario común para registrar eventos clave de negocio/UI.

### H3 (P2) — Accesibilidad mejorable en CTAs críticas

Faltaban labels/hints explícitos en botones de acciones sensibles.

## Correcciones aplicadas

1. Se creó `AppError` y se normalizó `invokeEdgeFunction` para propagar errores con `code` y `context`.
2. Se agregó capa de telemetría mínima (`trackEvent`) y se instrumentaron eventos en auth/redeem/map.
3. Se añadieron `accessibilityLabel` / `accessibilityHint` en acciones principales.

## Resultado etapa 8

- Base transversal más sólida para observabilidad, soporte y QA.
- Mejor consistencia de manejo de errores y accesibilidad mínima en flujos críticos.
