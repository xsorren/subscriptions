# Auditoría integral del proyecto — Índice

Esta carpeta contiene la auditoría técnica y funcional completa del proyecto, separada por módulos y flujos.

## Archivos

1. `01_resumen_ejecutivo.md`
   - Estado general del proyecto, cobertura actual y riesgos prioritarios.
2. `02_auditoria_backend_supabase.md`
   - Revisión del modelo de datos, seguridad, RLS, funciones SQL y Edge Functions esperadas.
3. `03_auditoria_frontend_expo.md`
   - Revisión de arquitectura Expo Router, data layer, auth, módulos y componentes compartidos.
4. `04_auditoria_flujos_end_to_end.md`
   - Evaluación de flujos de negocio completos: login, cupones, QR, mapa, detalle club, canje.
5. `05_brechas_y_plan_accion.md`
   - Lista de brechas detectadas + plan de cierre priorizado (P0/P1/P2).
6. `06_checklist_go_live.md`
   - Checklist operativo/técnico para preparación de release.

## Alcance auditado

- Documentación técnica existente en `docs/`.
- Estructura y módulos implementados en `frontend/`.
- Coherencia entre arquitectura planificada y estado real implementado.
