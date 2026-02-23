# Plan final + comienzo de implementación frontend (React Native + Expo)

Este documento consolida la arquitectura frontend alineada al backend Supabase definido, priorizando rendimiento, simplicidad operativa y uso intensivo de **Edge Functions** para lógica crítica.

## 1) Objetivos de la implementación

- UX rápida para descubrimiento de clubes, visualización de cupones y canje QR.
- Seguridad fuerte: cliente liviano, reglas críticas en backend/Edge Functions.
- Arquitectura sólida de layouts con Expo Router para escalar sin deuda.
- Código organizado por dominios para facilitar onboarding de equipo.

## 2) Decisiones técnicas clave

- **Expo Router** para navegación por segmentos y layouts anidados.
- **TanStack Query** para cache, sincronización y estados remotos.
- **Supabase JS** como cliente principal de auth + data.
- **Edge Functions** como capa obligatoria para:
  - generar QR efímero,
  - canjear cupón,
  - map discover filtrado por elegibilidad,
  - webhooks de pago y acciones administrativas.

## 3) Arquitectura de layouts (sólida)

- `app/_layout.tsx`: providers globales + stack raíz.
- `app/(public)/_layout.tsx`: onboarding/login/signup.
- `app/(app)/_layout.tsx`: área autenticada, guard de sesión.
- `app/(app)/(tabs)/_layout.tsx`: navegación principal:
  - Inicio
  - Mapa
  - Cupones
  - Perfil

Rutas profundas:
- `app/(app)/clubs/[clubId].tsx` detalle club.
- `app/(app)/coupons/[couponId].tsx` detalle cupón.
- `app/(app)/coupons/redeem-qr.tsx` QR dinámico.

## 4) Integración con Edge Functions (optimización)

### 4.1 `create-qr-token`
**Entrada**: `couponId`.
**Salida**: token firmado + expiresAt.
**Motivo**: evitar construcción de QR en cliente y reforzar antifraude.

### 4.2 `redeem-coupon`
**Entrada**: nonce/qr token + branch + idempotency key.
**Salida**: resultado de canje.
**Motivo**: transacción atómica, validaciones y auditoría central.

### 4.3 `map-discover`
**Entrada**: lat/lng/radius/sport.
**Salida**: clubes elegibles para ese usuario.
**Motivo**: reducir payload, filtrar server-side y mejorar performance en mapa.

### 4.4 `club-eligibility`
**Entrada**: clubId.
**Salida**: cupones aplicables del usuario.
**Motivo**: detalle de club preciso con CTA contextual.

## 5) Estructura implementada (inicio)

Se inició un módulo `frontend/` con estructura base:

- `frontend/src/app` con layouts y pantallas iniciales.
- `frontend/src/core` con configuración `env`, `supabase` y `queryClient`.
- `frontend/src/features/*/api` con servicios para cupones, mapa y clubes.
- `frontend/src/features/auth/hooks/useSession.ts`.
- `frontend/src/shared/ui/Screen.tsx`.

## 6) Estrategia de performance

- Cache por query keys con invalidación selectiva tras mutaciones.
- Filtrado geográfico en backend (Edge + PostGIS), no en cliente.
- Evitar over-fetching: endpoints especializados por pantalla.
- Renderización de mapa incremental (markers visibles por bounding box cuando crezca volumen).

## 7) Estrategia de seguridad

- Cliente nunca ejecuta lógica de negocio sensible.
- RLS + JWT para lecturas personales.
- Edge Function + Service Role para operaciones críticas.
- Idempotency keys para canje y procesos de pago.

## 8) Siguiente ejecución recomendada

1. Inicializar app Expo real dentro de `frontend/`.
2. Conectar alias TypeScript y ESLint/Prettier.
3. Implementar pantallas completas:
   - Wallet de cupones,
   - Mapa real con filtros,
   - Detalle club con CTA “Cómo llegar”.
4. Conectar Edge Functions productivas en Supabase.
5. Añadir telemetría de eventos (`map_navigation_opened`, `qr_generated`, `coupon_redeemed`).

## 9) Continuación aplicada en el repositorio

Se avanzó la implementación base para dejar lista una arquitectura operativa desde la que el equipo puede desarrollar features sin rehacer estructura:

- Guard de autenticación en layouts:
  - `frontend/src/app/(app)/_layout.tsx`
  - `frontend/src/app/(public)/_layout.tsx`
- Capa común para invocar Edge Functions:
  - `frontend/src/core/lib/edgeFunctions.ts`
- Hooks de datos por dominio:
  - `frontend/src/features/coupons/hooks/useMyCoupons.ts`
  - `frontend/src/features/map/hooks/useDiscoverEligibleClubs.ts`
- Utilidad de apertura externa de mapas (iOS/Android + fallback):
  - `frontend/src/features/map/utils/openExternalMaps.ts`
- Pantallas tabs conectadas a hooks de datos para mostrar estado real de carga/resultado.

Con esto, la app queda preparada para continuar implementación completa de UI y flujos sobre una base sólida de navegación + data layer + edge integration.

## 10) Continuación 2 (implementación funcional)

Para responder a la necesidad de implementación más completa y organizada, se añadieron piezas funcionales para pasar de scaffolding a base de producto:

- Query keys centralizadas:
  - `frontend/src/core/lib/queryKeys.ts`
- Dominio clubs expandido:
  - `frontend/src/features/clubs/hooks/useClubDetail.ts`
  - `frontend/src/features/clubs/hooks/useClubEligibility.ts`
  - `frontend/src/features/clubs/api/clubs.service.ts` (incluye `club-eligibility` por Edge Function)
- Dominio coupons expandido:
  - `frontend/src/features/coupons/hooks/useCreateQrToken.ts`
  - detalle de cupón conectado a generación real de QR efímero.
- Navegación/flujo:
  - `frontend/src/app/index.tsx` para entrada estable.
  - `frontend/src/app/(app)/coupons/redeem-qr.tsx` como pantalla específica de canje.
- UX utilizable en tabs:
  - listado real de cupones con navegación a detalle.
  - listado de clubes elegibles con acciones “Ver detalle” y “Cómo llegar”.
- Maps:
  - helper extendido con navegación por coordenadas y por dirección (`openExternalMapsByQuery`).

Resultado: la estructura quedó orientada a crecimiento, pero con casos clave ya cableados de punta a punta para seguir iterando sin rehacer arquitectura.

## 11) Estado de cierre de esta fase

Se considera **terminada al 100% esta fase de implementación base** porque ya están cubiertos los pilares necesarios para avanzar en features sin rehacer arquitectura:

- layout architecture sólida (root + público + privado + tabs),
- auth context y guardas de navegación,
- base de UI reutilizable para estados de carga/error/empty,
- data layer por dominio con query keys centralizadas,
- integración operativa con Edge Functions críticas,
- flujos funcionales mínimos en cupones, mapa y detalle de club/cupón.

Pendiente de siguientes fases (ya no base): diseño visual avanzado, testing automatizado E2E, y hardening de observabilidad/analítica.
