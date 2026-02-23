# 02 — Auditoría backend Supabase

## 1) Modelo de datos

### Cobertura

El schema inicial cubre correctamente los dominios principales:
- identidad/roles,
- catálogo de deportes y clubes,
- planes/suscripciones,
- cupones/QR/redenciones,
- auditoría.

### Evaluación

- **Fortaleza:** diseño relacional bien normalizado para MVP robusto.
- **Fortaleza:** uso de PostGIS en sedes (`club_branches.location`) para casos geoespaciales.
- **Fortaleza:** índices base adecuados para consultas de canje, suscripciones y búsqueda.

### Brechas

- Falta paquete de migraciones ejecutables reales (más allá del documento SQL).
- Falta estrategia explícita de versionado en repo para evolución de schema.

## 2) Seguridad y RLS

### Cobertura

- RLS habilitada en tablas sensibles.
- Políticas base de ownership y staff por sede.

### Evaluación

- **Fortaleza:** enfoque correcto de principio de mínimo privilegio para usuario final.
- **Riesgo:** políticas admin/ops avanzadas aún no formalizadas.
- **Riesgo:** faltan validaciones complementarias antiabuso en capa Edge (rate-limit, antifraude por dispositivo/IP).

## 3) Funciones SQL y atomicidad

### Cobertura

- `redeem_coupon(...)` definida con locking transaccional y registro de auditoría.

### Evaluación

- **Fortaleza:** prevención base de doble canje vía `FOR UPDATE` + estado.
- **Riesgo:** faltan pruebas de concurrencia y escenarios de idempotencia extendida.

## 4) Edge Functions

### Definidas/esperadas

- `create-qr-token`
- `map-discover`
- `club-eligibility`
- `redeem-coupon`

### Evaluación

- **Fortaleza:** frontera server-side bien planteada para lógica crítica.
- **Brecha:** implementación productiva y contratos formales de estas funciones no están auditables en el repo actual.

## 5) Recomendaciones backend

1. Crear carpeta de migraciones reales (`supabase/migrations/*`) y seeds reproducibles.
2. Implementar y versionar Edge Functions con contratos tipados (`zod`/schema validation).
3. Añadir pruebas de concurrencia para canje y pruebas de RLS por rol.
4. Definir observabilidad mínima: logs estructurados + correlation/request id.
