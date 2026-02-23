# House — Contexto completo del proyecto + plan integral de ejecución

## 1) Contexto general del proyecto

**House** es una app móvil (React Native con Expo) orientada a suscripciones deportivas con sistema de cupones, descubrimiento de clubes y canje rápido por QR.

El stack propuesto y parcialmente implementado se basa en:

- **Frontend**: Expo Router + React Query + Supabase client + React Native Paper.
- **Backend**: Supabase (Postgres + Auth + RLS + Edge Functions + PostGIS).
- **Flujos core**:
  1. autenticación,
  2. wallet de cupones,
  3. generación/canje QR,
  4. descubrimiento de clubes por mapa,
  5. detalle de club con navegación externa.

La identidad visual actual de la app está definida como **minimalista dark** con acento amarillo premium (branding House).

---

## 2) Estado actual (resumen ejecutivo técnico)

A partir de las auditorías y etapas ejecutadas en el repo:

- Se completó una inspección por etapas 1→8 (fundaciones, navegación, auth, coupons, map, clubs, redeem, calidad transversal).
- Se implementó base funcional de frontend con rutas protegidas, consumo de Edge Functions y mejoras transversales.
- Existen brechas de producción en ejecución operativa real (tests automatizados, observabilidad productiva, hardening de seguridad y despliegue completo de funciones backend en entornos).

---

## 3) Arquitectura vigente (alto nivel)

## 3.1 Frontend (Expo)

- Ruteo por segmentos:
  - `(public)` para acceso,
  - `(app)` para zona autenticada,
  - `(tabs)` para shell principal.
- Providers globales:
  - QueryClient,
  - Theme House,
  - Auth context.
- Dominios por módulo:
  - `auth`, `coupons`, `map`, `clubs`.
- UI base reusable:
  - `Screen`, `SectionTitle`, `StateMessage`, `LoadingScreen`.

## 3.2 Backend (Supabase)

- Modelo SQL inicial documentado para:
  - usuarios/roles,
  - clubes/sedes/ofertas,
  - planes/suscripciones,
  - cupones/qr/redenciones,
  - auditoría.
- RLS base diseñada para ownership/staff.
- Edge Functions esperadas:
  - `create-qr-token`,
  - `map-discover`,
  - `club-eligibility`,
  - `redeem-coupon`.

---

## 4) Flujo funcional actual por módulo

## Auth

- OTP por email implementado.
- Logout implementado.
- Guards de sesión en layouts.

## Coupons

- Wallet con listado y resumen de estados.
- Detalle de cupón con query dedicada.
- Generación de QR condicionada por estado `available`.

## Map

- Discover con radius variable (2/5/10 km).
- Manejo de permisos y errores de ubicación con reintento.
- CTA para abrir navegación externa.

## Clubs

- Detalle de club + elegibilidad.
- Listado de sedes con CTA "Cómo llegar" por sede.

## Redeem

- Pantalla de canje conectada a `redeem-coupon`.
- Envío con idempotency key y feedback de resultado.

---

## 5) Brechas pendientes (visión consolidada)

## P0 (bloqueantes release)

1. Edge Functions productivas versionadas y auditables por entorno.
2. Pruebas críticas automatizadas (unit/integration/e2e) en flujos core.
3. Validación robusta de RLS/permisos por rol en staging.
4. Estrategia completa de secretos + entornos + rollout/rollback.

## P1 (calidad operativa)

1. Telemetría real (provider productivo) en lugar de consola.
2. Estandarización completa de mapping de errores backend → UI.
3. UX states avanzados (skeleton/empty/retry contextual) homogéneos.

## P2 (escala)

1. Mapa visual con clustering y optimización de discover geográfica.
2. BI operativo y alertas de negocio.
3. Hardening antifraude de canje.

---

## 6) Plan completo de ejecución (14 días)

## Semana 1 — Cierre P0 técnico

### Día 1
- Normalizar entornos/secrets (`dev/staging/prod`) y runbook de configuración.

### Día 2
- Convertir modelo SQL documental en migraciones ejecutables versionadas.

### Día 3
- Implementar/desplegar Edge Functions core 1/2 (`create-qr-token`, `club-eligibility`).

### Día 4
- Implementar/desplegar Edge Functions core 2/2 (`map-discover`, `redeem-coupon`).

### Día 5
- Hardening de canje (errores de negocio específicos + idempotencia validada end-to-end).

### Día 6
- Tests unit/integration de hooks y servicios críticos frontend.

### Día 7
- Tests E2E happy-path y escenarios de error en auth/coupon/redeem/map.

## Semana 2 — Calidad operativa + pre-go-live

### Día 8
- Integrar telemetría productiva (PostHog/Firebase/Segment) con esquema de eventos.

### Día 9
- Consolidar capa de errores (catálogo de códigos + mapper UI estándar).

### Día 10
- Revisión de accesibilidad y UX de estados en pantallas core.

### Día 11
- Performance tuning (queries/caches/renderizados) + discover optimizado.

### Día 12
- Seguridad: RLS test matrix + revisión de permisos y secretos.

### Día 13
- Observabilidad: dashboards, alertas, procedimientos de incidente.

### Día 14
- Go/No-Go final + checklist release + plan de rollback aprobado.

---

## 7) Criterios de aceptación para declarar “listo para producción”

1. **Funcionalidad**: flujos auth/coupon/redeem/map/clubs verificados E2E en staging.
2. **Seguridad**: RLS validada por rol + secretos controlados + idempotencia en endpoints críticos.
3. **Calidad**: cobertura de tests críticos definida y estable en CI.
4. **Operación**: telemetría y alertas activas con runbooks.
5. **Release**: checklist go-live completo sin ítems P0 abiertos.

---

## 8) Entregables documentales sugeridos para siguientes iteraciones

- `docs/runbooks/env_and_secrets.md`
- `docs/runbooks/incidentes_y_rollback.md`
- `docs/testing/test-plan_e2e.md`
- `docs/analytics/eventos_house.md`
- `docs/release/go_no_go_report.md`

Con este documento, el proyecto queda con una hoja de ruta única que combina **contexto + estado real + plan ejecutable** para llegar a producción.
