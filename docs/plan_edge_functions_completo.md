# Plan completo de Edge Functions (Supabase)

Este documento define un plan único, ejecutable y versionable para implementar las Edge Functions necesarias del proyecto.

## 1) Diagnóstico actual

Estado del repositorio:

- Existe invocación desde frontend a funciones (`create-qr-token`, `redeem-coupon`, `club-eligibility`, `map-discover`).
- En `supabase/functions/` solo existe `_shared/` con utilidades (`client.ts`, `cors.ts`).
- No existen carpetas con funciones desplegables tipo `supabase/functions/<function-name>/index.ts`.

Conclusión: sí hay diseño y consumo esperado, pero todavía no hay Edge Functions productivas implementadas.

---

## 2) Objetivo

Implementar, validar y desplegar el conjunto mínimo de Edge Functions para soportar de extremo a extremo:

1. Generación de QR de canje.
2. Canje seguro e idempotente.
3. Elegibilidad de clubes para un cupón.
4. Descubrimiento de clubes en mapa.

Además, preparar funciones de soporte operativo para robustez en producción.

---

## 3) Catálogo de funciones necesarias

### 3.1 Core (obligatorias para MVP funcional)

1. `create-qr-token`
   - **Propósito**: generar token/nonce efímero para canje.
   - **Entrada**: `couponInstanceId` (UUID), `idempotencyKey` opcional.
   - **Salida**: `token|nonce`, `expiresAt`.
   - **Seguridad**: usuario autenticado; validar ownership del cupón.

2. `redeem-coupon`
   - **Propósito**: ejecutar canje transaccional desde QR.
   - **Entrada**: `qrNonce`, `clubBranchId`, `idempotencyKey`.
   - **Salida**: `redemptionId`, `couponInstanceId`, `redeemedAt`, `status`.
   - **Seguridad**: usuario autenticado + rol de club/staff autorizado.
   - **Nota**: debe apoyarse en `public.redeem_coupon(...)` y preservar idempotencia.

3. `club-eligibility`
   - **Propósito**: informar elegibilidad de un club/sucursal para un cupón.
   - **Entrada**: `clubId`, `couponId` o contexto de cupón del usuario.
   - **Salida**: `eligible: boolean`, `reasons[]`, `constraints`.
   - **Seguridad**: autenticado.

4. `map-discover`
   - **Propósito**: listar clubes/sucursales elegibles por geolocalización y filtros.
   - **Entrada**: `lat`, `lng`, `radiusMeters`, `filters`.
   - **Salida**: lista de clubes/sucursales con metadata de elegibilidad.
   - **Seguridad**: autenticado.

### 3.2 Soporte recomendado (P1)

5. `coupon-instance-detail`
   - **Propósito**: lectura consolidada de detalle de cupón + estado de canje.

6. `redemption-history`
   - **Propósito**: trazabilidad de canjes por usuario/club con paginación.

7. `health-edge`
   - **Propósito**: healthcheck y diagnóstico básico por entorno.

---

## 4) Contratos de API (v1)

### 4.1 `create-qr-token`

- Request:
```json
{
  "couponInstanceId": "uuid",
  "idempotencyKey": "string-opcional"
}
```

- Response 200:
```json
{
  "nonce": "string",
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```

- Errores:
  - `401 unauthenticated`
  - `403 coupon_not_owned`
  - `404 coupon_not_found`
  - `409 coupon_not_available`
  - `429 too_many_requests`

### 4.2 `redeem-coupon`

- Request:
```json
{
  "qrNonce": "string",
  "clubBranchId": "uuid",
  "idempotencyKey": "string"
}
```

- Response 200:
```json
{
  "redemptionId": "uuid",
  "couponInstanceId": "uuid",
  "status": "redeemed",
  "redeemedAt": "2026-01-01T00:00:00.000Z"
}
```

- Errores:
  - `400 invalid_payload`
  - `401 unauthenticated`
  - `403 not_authorized_branch`
  - `404 qr_not_found`
  - `409 qr_already_used | qr_expired | coupon_not_redeemable`
  - `409 duplicate_idempotency_key`

### 4.3 `club-eligibility`

- Request:
```json
{
  "clubId": "uuid",
  "couponId": "uuid"
}
```

- Response 200:
```json
{
  "eligible": true,
  "reasons": [],
  "constraints": {
    "requiresActiveSubscription": true
  }
}
```

### 4.4 `map-discover`

- Request:
```json
{
  "lat": -34.6037,
  "lng": -58.3816,
  "radiusMeters": 3000,
  "filters": {
    "hasEligibleCoupons": true
  }
}
```

- Response 200:
```json
{
  "items": [
    {
      "clubId": "uuid",
      "branchId": "uuid",
      "name": "Club X",
      "distanceMeters": 420,
      "eligible": true
    }
  ]
}
```

---

## 5) Estructura de código a crear

```text
supabase/functions/
  _shared/
    client.ts
    cors.ts
    auth.ts
    errors.ts
    validation.ts
    idempotency.ts
    telemetry.ts
  create-qr-token/
    index.ts
  redeem-coupon/
    index.ts
  club-eligibility/
    index.ts
  map-discover/
    index.ts
  coupon-instance-detail/
    index.ts
  redemption-history/
    index.ts
  health-edge/
    index.ts
```

Reglas:
- Todas las funciones responden `OPTIONS` con CORS.
- Validación de payload al inicio.
- Manejo de errores con códigos estables.
- Logs estructurados con `requestId`, `userId`, `functionName`.

---

## 6) Seguridad y cumplimiento

1. Service Role solo en servidor (nunca en cliente).
2. JWT obligatorio para funciones de negocio.
3. Verificación de rol/permiso para canje en sucursal.
4. Idempotencia obligatoria en operaciones mutantes (`create-qr-token`, `redeem-coupon`).
5. Rate limiting por usuario/IP para evitar abuso de QR/canje.
6. Auditoría mínima por evento:
   - `qr_generated`
   - `coupon_redeemed`
   - `redeem_failed`

---

## 7) Plan por fases

### Fase 0 — Fundaciones técnicas (1 día)

- Crear utilidades compartidas faltantes: `auth.ts`, `errors.ts`, `validation.ts`, `idempotency.ts`, `telemetry.ts`.
- Definir tipado común de respuestas de error.
- Agregar plantillas base de `index.ts` para cada función.

### Fase 1 — Core transaccional (2–3 días)

- Implementar `create-qr-token`.
- Implementar `redeem-coupon` integrado a SQL `public.redeem_coupon(...)`.
- Pruebas de concurrencia e idempotencia.

### Fase 2 — Descubrimiento y elegibilidad (1–2 días)

- Implementar `club-eligibility`.
- Implementar `map-discover`.
- Ajustar shape de respuesta para consumo frontend.

### Fase 3 — Observabilidad y soporte (1 día)

- Implementar `health-edge`, `redemption-history`, `coupon-instance-detail`.
- Instrumentar logs/eventos y alarmas.

### Fase 4 — Hardening y Go-Live (1 día)

- Revisar permisos/RLS + pruebas de seguridad.
- Definir runbook de incidentes.
- Deploy a staging, validación E2E, luego producción.

---

## 8) Testing mínimo obligatorio

1. **Unitario** (validaciones/parsers): payload válido/inválido.
2. **Integración**:
   - `create-qr-token` con cupón válido/inválido.
   - `redeem-coupon` happy-path, QR expirado, QR usado, sucursal inválida.
3. **Concurrencia**:
   - dos redenciones simultáneas del mismo nonce => solo una exitosa.
4. **Contrato**:
   - snapshots JSON de respuestas y códigos de error.
5. **E2E**:
   - login → ver cupón → generar QR → canjear → ver estado `redeemed`.

---

## 9) Despliegue y versionado

Comandos esperados (referencia):

```bash
supabase functions deploy create-qr-token
supabase functions deploy redeem-coupon
supabase functions deploy club-eligibility
supabase functions deploy map-discover
supabase functions deploy coupon-instance-detail
supabase functions deploy redemption-history
supabase functions deploy health-edge
```

Buenas prácticas:
- Deploy progresivo: staging → producción.
- Tag por release y changelog por función.
- Variables de entorno por proyecto.

---

## 10) Criterios de aceptación

Se considera completo cuando:

1. Existen carpetas y `index.ts` para todas las funciones core.
2. Frontend consume respuestas reales en staging sin mocks.
3. Canje QR es idempotente y auditable.
4. Logs permiten trazabilidad por `requestId` y `userId`.
5. Se ejecuta checklist go-live sin bloqueantes.

---

## 11) Próximo paso recomendado inmediato

Implementar primero `create-qr-token` y `redeem-coupon` (Fase 1), porque desbloquean el flujo crítico de negocio (canje) y validan de punta a punta la arquitectura Edge Function-first.
