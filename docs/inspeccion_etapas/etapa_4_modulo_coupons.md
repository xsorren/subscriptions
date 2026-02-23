# Etapa 4 — Inspección del módulo Coupons

## Archivos auditados

- `frontend/src/app/(app)/(tabs)/coupons.tsx`
- `frontend/src/app/(app)/coupons/[couponId].tsx`
- `frontend/src/features/coupons/api/coupons.service.ts`
- `frontend/src/features/coupons/hooks/useMyCoupons.ts`
- `frontend/src/features/coupons/hooks/useCreateQrToken.ts`
- `frontend/src/core/lib/queryKeys.ts`

## Hallazgos

### H1 (P1) — Falta query de detalle real por cupón

La pantalla de detalle dependía del `couponId` de ruta pero no consultaba datos completos del cupón.

### H2 (P1) — Generación de QR sin guardas por estado del cupón

Se permitía intentar generar QR sin validar si el cupón estaba `available`.

### H3 (P2) — Estado de lista limitado

La wallet no mostraba resumen por estado ni acción de reintento cuando fallaba la carga.

## Correcciones aplicadas

1. Se añadió query de detalle (`getCouponById` + `useCouponDetail`).
2. Se agregó invalidación de cache tras generar QR y validación de estado antes de habilitar CTA.
3. Se mejoró UX de wallet con resumen de estados y botón de reintento.

## Resultado etapa 4

- Flujo de cupones más consistente entre lista y detalle.
- Mejor robustez para generación de QR y recuperación ante errores.
