# Etapa 2 — Inspección de navegación y tabs

## Archivos auditados

- `frontend/src/app/(app)/(tabs)/_layout.tsx`
- `frontend/src/app/(app)/_layout.tsx`
- `frontend/src/app/index.tsx`
- rutas de detalle:
  - `frontend/src/app/(app)/clubs/[clubId].tsx`
  - `frontend/src/app/(app)/coupons/[couponId].tsx`
  - `frontend/src/app/(app)/coupons/redeem-qr.tsx`

## Hallazgos

### H1 (P1) — Stack privada sin jerarquía explícita de pantallas

`/(app)/_layout.tsx` usaba un `Stack` genérico sin declarar opciones por ruta. Esto dificulta garantizar UX de navegación consistente para detalle/canje.

### H2 (P1) — Tabs sin ruta inicial explícita

Aunque funcional, faltaba `initialRouteName` para reforzar comportamiento predecible del shell de tabs.

### H3 (P2) — Falta de fallback para rutas no encontradas

No había `+not-found.tsx` para manejar rutas inválidas con UX controlada.

## Correcciones aplicadas

1. Se definió stack privada con pantallas declaradas y headers consistentes por ruta.
2. Se configuró `initialRouteName="home"` en layout de tabs.
3. Se añadió `app/+not-found.tsx` con fallback visual y acción de retorno.

## Resultado etapa 2

- Navegación más robusta y predecible entre tabs y pantallas de detalle.
- Mejor experiencia ante rutas inválidas.
