# 05 — Brechas y plan de acción priorizado

## P0 (bloqueantes para producción)

1. Implementar Edge Functions productivas versionadas y auditables.
2. Completar flujo de canje QR end-to-end con manejo de errores.
3. Añadir pruebas mínimas críticas:
   - canje concurrente,
   - autorización por rol,
   - guardas de navegación.
4. Definir estrategia de secretos y entornos (dev/staging/prod).

## P1 (calidad operativa)

1. Estandarizar errores de API/Edge y su representación en UI.
2. Telemetría de eventos de negocio:
   - `qr_generated`
   - `coupon_redeemed`
   - `map_navigation_opened`
3. Estados de UX avanzados (skeleton, retry, empty states contextuales).
4. Paginación/filtros para listas con crecimiento de datos.

## P2 (optimización y escala)

1. Componente de mapa visual real con marker clustering.
2. Optimización de discover por bounding-box + cache geográfica.
3. BI operativo y alertas sobre métricas de canje.
4. Hardening antifraude (reglas dinámicas, scoring).

## Roadmap sugerido (4 semanas)

- Semana 1: P0.1 + P0.2
- Semana 2: P0.3 + P0.4
- Semana 3: P1 completo
- Semana 4: P2 inicial + pre-go-live
