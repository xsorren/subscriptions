# 03 — Auditoría frontend Expo

## 1) Arquitectura general

### Cobertura

- Expo Router con grupos de rutas:
  - `(public)`
  - `(app)`
  - `(tabs)`
- Layout raíz con providers globales.
- Contexto de autenticación (`AuthProvider`) y guardas de acceso.

### Evaluación

- **Fortaleza:** arquitectura de layouts limpia y escalable.
- **Fortaleza:** separación por features con data hooks por dominio.

## 2) Data layer y estado

### Cobertura

- `@tanstack/react-query` + `queryKeys` centralizadas.
- Servicios por dominio (`coupons`, `map`, `clubs`).
- Helper central para invocar Edge Functions.

### Evaluación

- **Fortaleza:** patrón consistente y fácil de extender.
- **Brecha:** falta capa estandarizada de manejo de errores (tipos AppError, códigos y traducción UI).

## 3) Módulos funcionales auditados

### Coupons

- Listado de cupones (`useMyCoupons`).
- Detalle de cupón + generación de QR (`useCreateQrToken`).

### Map

- Descubrimiento de clubes elegibles (`useDiscoverEligibleClubs`).
- Integración con ubicación (`useCurrentLocation`).
- Apertura externa de navegación por coordenadas/query.

### Clubs

- Detalle de club (`useClubDetail`).
- Elegibilidad (`useClubEligibility`).

## 4) UX base y componentes compartidos

- `Screen` para marco básico de pantalla.
- `SectionTitle`, `StateMessage` para consistencia mínima.

### Brechas UX

- Falta design system completo (tokens, escalas tipográficas, componentes semánticos avanzados).
- Falta manejo de estados de mutación con feedback richer (toasts, retry contextual, skeletons).

## 5) Recomendaciones frontend

1. Formalizar tipado de API (DTOs por endpoint/función).
2. Estandarizar errores y telemetría por pantalla/evento.
3. Añadir pruebas:
   - unitarias de hooks/servicios,
   - integración de navegación,
   - E2E de flujos críticos.
4. Definir UI kit y convenciones de accesibilidad.
