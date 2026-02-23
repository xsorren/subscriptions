# Etapa 7 — Inspección del flujo Redeem end-to-end

## Archivos auditados

- `frontend/src/app/(app)/coupons/redeem-qr.tsx`
- `frontend/src/features/coupons/api/coupons.service.ts`
- `frontend/src/features/coupons/hooks/useCreateQrToken.ts`
- `frontend/src/core/lib/queryKeys.ts`

## Hallazgos

### H1 (P0) — Pantalla de canje era placeholder

No existía ejecución real del canje contra backend/Edge Function.

### H2 (P1) — Sin idempotency key en flujo cliente

El canje no contemplaba idempotencia explícita desde UI para evitar duplicados por reintentos.

### H3 (P1) — Sin feedback estructurado de resultado

No se distinguía éxito, error y estado de envío en la pantalla de canje.

## Correcciones aplicadas

1. Se implementó `redeemCoupon` en servicio de coupons (Edge Function `redeem-coupon`).
2. Se añadió hook `useRedeemCoupon` con invalidación de cache relacionada.
3. Se transformó `redeem-qr.tsx` en flujo funcional con validación, idempotency key automática y feedback de resultado.

## Resultado etapa 7

- Flujo de canje conectado de punta a punta en frontend.
- Mayor seguridad operacional frente a reintentos en cliente.
