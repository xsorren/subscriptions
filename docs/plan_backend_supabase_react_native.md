# Plan backend completo y escalable (React Native + Supabase)

## 1) Objetivo de producto (visión refinada)
Construir una plataforma de suscripción deportiva donde una persona usuaria pueda:
- Comprar un plan mensual/anual.
- Recibir cupones/beneficios por deporte, club y/o servicio.
- Descubrir clubes disponibles en lista y mapa según sus cupones vigentes.
- Canjear beneficios en segundos mediante QR seguro.
- Ver detalle de cada club (servicios, horarios, reglas, ubicación y navegación externa).

Y donde, en paralelo:
- Los clubes se registren desde un panel web.
- El staff valide canjes con mínimo friction y máxima seguridad.
- Operaciones/admin gestionen catálogo, planes, pagos, conciliación y fraude.

---

## 2) Principios de arquitectura
1. **Supabase-first**: Postgres + Auth + RLS + Edge Functions + Storage.
2. **Seguridad por defecto**: RLS activada en tablas expuestas y operaciones críticas server-side.
3. **Velocidad de canje**: flujo QR efímero con validación transaccional.
4. **Escalabilidad**: diseño modular por dominios para crecer por ciudades/países.
5. **Trazabilidad total**: auditoría de acciones sensibles y eventos de negocio.
6. **DX (Developer Experience)**: migraciones versionadas, contratos claros, observabilidad y runbooks.

---

## 3) Arquitectura de alto nivel
### Núcleo backend
- **Postgres (Supabase)**: datos transaccionales y reglas principales.
- **Auth**: email/OTP/social, sesión segura y multi-dispositivo.
- **RLS**: control fino por rol, organización y sede.
- **Edge Functions**:
  - emisión y validación de QR,
  - asignación de cupones,
  - webhooks de pagos,
  - antifraude y reconciliaciones.
- **Storage**: logos, fotos de clubes, documentos comerciales.
- **Jobs programados** (cron): expiraciones, renovaciones, recordatorios.

### Clientes
- **App React Native (usuario)**: onboarding, compra, wallet de cupones, mapa, canje.
- **Panel web (club/admin/ops)**: onboarding clubes, catálogo, validación y reporting.
- **App/Modo staff (opcional)**: escáner QR dedicado.

### Integraciones
- Pasarela de pago (Stripe/Mercado Pago/etc.).
- Push notifications + email transaccional.
- Analítica de producto + BI.

---

## 4) Modelo de dominio (entidades)

## A. Identidad y acceso
- `profiles` (usuario app vinculado a auth).
- `roles` y `user_roles` (admin, ops, club_owner, club_staff, support, user).
- `club_staff_assignments` (staff ↔ club/sede).

## B. Catálogo deportivo
- `sports` (pádel, gym, natación, etc.).
- `clubs` (entidad comercial).
- `club_branches` (sedes físicas con geolocalización).
- `club_services` (servicios ofrecidos por sede: deporte, duración, nivel, capacidad).
- `club_media` (imágenes, videos, portada).
- `club_business_hours` (horarios por día).
- `club_blackout_dates` (feriados/cierres/eventos especiales).

## C. Suscripción y beneficios
- `plans` (tiers y pricing).
- `plan_benefits` (cuántos usos por deporte/periodo/reglas).
- `subscriptions` (instancia por usuario).
- `subscription_periods` (ciclos de consumo).
- `benefit_entitlements` (derechos efectivos por ciclo).

## D. Cupones y canje
- `coupons` (estado, expiración, reglas snapshot).
- `coupon_allocations` (origen: compra, promo, soporte).
- `qr_tokens` (one-time, TTL corto, firmados).
- `coupon_redemptions` (evento de canje).
- `redemption_attempts` (fallos y motivos).
- `redemption_reversals` (reversiones auditadas con workflow).

## E. Pagos y facturación
- `payment_customers`, `payment_methods`.
- `payment_transactions`.
- `invoices`, `refunds`.
- `payment_webhook_events` (idempotencia, replay-safe).

## F. Geodatos y descubrimiento (nuevo módulo mapa)
- `branch_geo_index` (materialized view o tabla derivada para búsquedas rápidas).
- `user_accessible_services_view` (vista por usuario según cupones/planes activos).
- `map_pins_cache` (opcional, cache de pines por zona y filtros).

## G. Operación y compliance
- `audit_logs`.
- `event_outbox` (publicación de eventos).
- `notifications`.
- `fraud_signals` y `risk_scores`.

---

## 5) Flujo QR de alto rendimiento (recomendado)
1. Usuario abre "Canjear" en app.
2. App solicita `POST /v1/coupons/qr-token`.
3. Backend genera token efímero firmado (30–90s, single-use).
4. Staff escanea el QR.
5. Edge Function `POST /v1/redemptions/scan` valida en transacción:
   - token vigente/no usado,
   - identidad y suscripción activa,
   - cupón elegible para ese club/servicio/horario,
   - antifraude y rate limiting,
   - idempotencia.
6. Si pasa:
   - cupón => `redeemed`,
   - inserta `coupon_redemptions`,
   - token => `used`,
   - `audit_logs`.
7. Confirmación inmediata a staff y usuario (real-time opcional).

### Reglas antifraude mínimas
- Lock transaccional (`SELECT ... FOR UPDATE`).
- Límite de intentos por minuto por staff/IP/usuario.
- Fingerprint de dispositivo (si política legal lo permite).
- Detección de patrones anómalos por sede/franja.

---

## 6) Módulo de mapa y descubrimiento por cupones (nuevo)

## Objetivo
Mostrar en un mapa solo clubes/sedes y servicios a los que la persona **sí puede acceder** según:
- cupones disponibles,
- plan activo,
- reglas del beneficio,
- horario/estado de la sede,
- distancia y filtros seleccionados.

## API sugerida
- `GET /v1/map/discover?lat=&lng=&radius=&sport=&time_slot=&only_available=true`
  - Devuelve pines de sedes accesibles + resumen de servicios habilitados.
- `GET /v1/clubs/{club_id}`
  - Devuelve detalle completo del club.
- `GET /v1/clubs/{club_id}/eligibility`
  - Devuelve por qué puede/no puede canjear (explicativo).

## Lógica de elegibilidad
Motor que evalúa:
1. Estado de suscripción.
2. Beneficios disponibles en periodo actual.
3. Cupón aplicable por deporte/servicio.
4. Restricciones de franja/día/sede.
5. Reglas de capacidad (si aplica reserva).

## UX recomendada en app
- Mapa con pines por estado:
  - verde = accesible ahora,
  - amarillo = accesible con condiciones,
  - gris = no accesible (ocultable por filtro).
- Filtros rápidos: deporte, distancia, abierto ahora, cupón disponible.
- Bottom sheet con resumen del club al tocar pin.
- CTA: “Ver detalle”, “Cómo llegar”, “Canjear”.

## Performance del mapa
- Índices geoespaciales (PostGIS recomendado si el volumen crece).
- Búsqueda por bounding box + ranking por distancia.
- Respuesta paginada/clusterizada en ciudades densas.
- Cache de resultados por zona/filtros y TTL corto.

---

## 7) Pantalla de detalle del club (nuevo)

## Información mínima
- Nombre, portada, rating, dirección y distancia.
- Servicios habilitados para el usuario (según sus cupones).
- Horarios y reglas de canje.
- Amenidades (duchas, parking, etc.).
- Políticas de cancelación/no-show.

## Acciones clave
- `Ver cupones aplicables`.
- `Canjear ahora` (si elegible).
- `Abrir en mapas`.
- `Contactar club` (teléfono/whatsapp/email).

## Desde el cupón al club
Desde la wallet de cupones, cada cupón debe incluir:
- sedes donde aplica,
- botón "Ver club",
- botón "Cómo llegar".

---

## 8) Apertura de ubicación en Google Maps / Apple Maps (nuevo)

## Requisito funcional
Desde detalle de club o cupón, abrir navegación externa según OS.

## Estrategia
- **iOS**: Apple Maps por defecto (`http://maps.apple.com/?daddr=LAT,LNG`).
- **Android**: Google Maps intent (`geo:LAT,LNG?q=LAT,LNG(CLUB_NAME)` o URL de Google Maps).
- Fallback universal: URL web de Google Maps si no existe app instalada.

## Backend soporte
- Guardar en `club_branches`:
  - `latitude`, `longitude`,
  - `address_full`,
  - `google_place_id` (opcional, recomendado),
  - `map_label`.
- Endpoint `GET /v1/clubs/{id}/map-link` opcional para centralizar links por plataforma y telemetría de clic.

## Telemetría útil
Registrar evento `map_navigation_opened` con:
- usuario,
- club/sede,
- plataforma,
- origen (detalle club / cupón / mapa).

---

## 9) Panel web de gestión (extendido)

## Módulos
1. Onboarding de clubes + verificación documental.
2. Gestión de sedes y geolocalización (pin editable en mapa).
3. Gestión de servicios y reglas de acceso.
4. Planes y beneficios.
5. Operación de canjes y reversos.
6. Finanzas y liquidaciones.
7. Soporte y vista 360 del usuario.
8. Analítica (uso por zona, saturación, conversión, churn, fraude).

## Funcionalidades destacadas
- Vista de mapa en panel para cobertura por ciudad.
- Heatmap de canjes por horario/sede.
- Alertas de sedes con alta tasa de rechazo de cupones.

---

## 10) Seguridad, compliance y calidad
- RLS estricta en tablas expuestas.
- Service role solo en Edge Functions internas.
- Idempotencia en pagos y canjes.
- Auditoría inmutable en acciones administrativas.
- Retención y anonimización de PII según normativa local.
- Backups, pruebas de restore y DR básico.

---

## 11) Observabilidad y SRE
- Logs estructurados con `request_id`.
- Métricas core:
  - p95 de canje QR,
  - éxito/fallo de canjes,
  - tiempo de respuesta de mapa,
  - clicks a navegación externa,
  - disponibilidad de webhooks de pago.
- Alertas automáticas y runbooks de incidentes.

---

## 12) Roadmap de implementación (120 días)

## Fase 1 (Semanas 1–4): Fundaciones
- Modelo de datos v1 + migraciones.
- Auth + roles + RLS base.
- Catálogo de clubes/sedes/deportes.
- Suscripciones y beneficios base.

## Fase 2 (Semanas 5–8): Wallet + Canje seguro
- Motor de cupones.
- QR efímero + canje transaccional.
- Auditoría y antifraude mínimo.
- Panel admin inicial.

## Fase 3 (Semanas 9–12): Mapa + detalle club + navegación
- APIs de descubrimiento geolocalizado.
- Elegibilidad por cupones en mapa en tiempo real.
- Pantalla detalle club + deep links Maps.
- Telemetría de uso del mapa.

## Fase 4 (Semanas 13–16): Escala operativa
- Optimización geoespacial y cache.
- Reversos con workflow y conciliación extendida.
- Dashboards ejecutivos y alertas avanzadas.
- Endurecimiento de seguridad y performance.

---

## 13) Ideas/mejoras adicionales ya incluidas en el plan
- Reserva + cupón en flujo unificado (cuando el club soporte agenda).
- Recomendaciones personalizadas por deporte/ubicación.
- Recordatorios inteligentes de cupones por vencer.
- Programa de referidos con controles antiabuso.
- Planes corporativos (B2B2C) para escalar ingresos.
- Scoring antifraude evolutivo por señales de uso.

---

## 14) Definición de éxito (KPIs)
- Tiempo medio de canje < 3 segundos.
- Tasa de éxito de canje > 98%.
- Descubrimiento útil en mapa (CTR pin→detalle > 25%).
- Conversión detalle club→canje creciente por cohorte.
- Reducción de rechazos por reglas ambiguas.
- Churn mensual controlado con cohortes activas por deporte.

---

## 15) Siguiente entrega sugerida
Para continuar con implementación real, siguiente paquete técnico:
1. `schema.sql` v1 con tablas, índices y constraints.
2. Políticas RLS por rol (usuario/staff/admin).
3. Edge Functions (qr-token, redemption-scan, map-discover, eligibility).
4. OpenAPI v1 + ejemplos de payload.
5. Plan de testing (unit, integration, carga y seguridad).
