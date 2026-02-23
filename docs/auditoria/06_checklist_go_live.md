# 06 — Checklist de Go-Live

## Backend / Supabase

- [ ] Migraciones versionadas aplicadas en staging y producción.
- [ ] RLS validada por rol con casos de prueba.
- [ ] Edge Functions desplegadas y observables (logs/errores).
- [ ] Estrategia de backups y retención confirmada.

## Frontend / Expo

- [ ] Variables de entorno configuradas por entorno.
- [ ] Build de app validado en iOS/Android.
- [ ] Flujos críticos QA manual y E2E.
- [ ] Manejo de errores y estados vacíos cubiertos.

## Seguridad

- [ ] Revisión de secrets y permisos mínimos.
- [ ] Validación de endpoints críticos con idempotencia.
- [ ] Política antifraude inicial activa.

## Operación

- [ ] Alertas y dashboards básicos activos.
- [ ] Procedimiento de incidentes definido.
- [ ] Plan de rollback documentado.

## Producto

- [ ] Copy y UX de errores aprobados.
- [ ] Instrumentación analítica en eventos core.
- [ ] Criterios de éxito post-release definidos.
