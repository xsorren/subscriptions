# 04 — Auditoría de flujos end-to-end

## Flujo A — Autenticación

### Estado

- Implementado guard de rutas pública/privada y contexto de sesión.

### Riesgos

- Faltan pantallas completas de auth (formulario real, OAuth, errores detallados).

### Estado de auditoría

- **Parcialmente implementado**.

---

## Flujo B — Wallet de cupones

### Estado

- Lista de cupones funcional con navegación a detalle.

### Riesgos

- Falta paginación/filtros/segmentación por estado.
- Falta refresh control y estrategia de cache avanzada.

### Estado de auditoría

- **Implementado en base**.

---

## Flujo C — Generación QR efímero

### Estado

- Desde detalle de cupón se invoca `create-qr-token`.

### Riesgos

- Falta visualización real del QR y countdown UX.
- Falta manejo granular de errores (expirado, inválido, sin permisos, etc.).

### Estado de auditoría

- **Implementado en base**.

---

## Flujo D — Descubrimiento en mapa por elegibilidad

### Estado

- Se usa ubicación del usuario + `map-discover`.
- Se muestran resultados con CTAs de detalle y navegación externa.

### Riesgos

- No hay componente mapa visual aún (solo lista funcional).
- Falta clustering/bounding-box para escalado alto.

### Estado de auditoría

- **Implementado en base (sin mapa visual completo)**.

---

## Flujo E — Detalle de club + cómo llegar

### Estado

- Detalle de club trae datos y elegibilidad.
- CTA “Cómo llegar” operativo (deep link externo).

### Riesgos

- Dirección/coords dependen de datos aún no validados de punta a punta.

### Estado de auditoría

- **Implementado en base**.

---

## Flujo F — Canje QR (redeem)

### Estado

- Pantalla de canje existe y está prevista integración con `redeem-coupon`.

### Riesgos

- Falta completar circuito de escaneo/confirmación y estados de éxito/fallo.

### Estado de auditoría

- **Pendiente funcional end-to-end**.
