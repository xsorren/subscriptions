# Plan general de inspección funcional por etapas

Objetivo: validar que todos los flujos de la app estén completos, módulo por módulo, revisando archivo por archivo y cerrando hallazgos por etapas.

## Etapa 1 (actual) — Fundaciones de app shell

Alcance:
- `app/_layout.tsx`, `app/index.tsx`
- layouts `/(public)` y `/(app)`
- auth context/hooks
- tema global y componentes base de UI (`Screen`, títulos, mensajes de estado)

Criterios de validación:
1. Arranque sin pantallas en blanco.
2. Guards de autenticación consistentes.
3. Fallback visual durante carga de sesión.
4. Tema dark aplicado globalmente.
5. Componentes base listos para reutilización.

Entregables de etapa:
- Informe de inspección Etapa 1.
- Correcciones implementadas de hallazgos P0/P1 de etapa.

## Etapa 2 — Navegación y tabs

Alcance:
- layout tabs y rutas profundas.
- coherencia de navegación entre módulos.

## Etapa 3 — Módulo Auth

Alcance:
- sign-in, estados de error/success, sesión y redirecciones.

## Etapa 4 — Módulo Coupons

Alcance:
- listado, detalle, generación QR, estados de mutación.

## Etapa 5 — Módulo Map

Alcance:
- ubicación, discover, estados vacíos/error, CTA "Cómo llegar".

## Etapa 6 — Módulo Clubs

Alcance:
- detalle club, elegibilidad y enlaces de navegación externa.

## Etapa 7 — Flujo de canje end-to-end

Alcance:
- pantalla `redeem-qr`, integración con edge function, feedback completo.

## Etapa 8 — Calidad transversal

Alcance:
- accesibilidad, observabilidad, errores normalizados, performance y checklist go-live.
