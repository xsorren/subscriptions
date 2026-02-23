# Etapa 1 — Inspección de fundaciones (app shell, auth, tema, UI base)

## Archivos auditados

- `frontend/src/app/_layout.tsx`
- `frontend/src/app/index.tsx`
- `frontend/src/app/(app)/_layout.tsx`
- `frontend/src/app/(public)/_layout.tsx`
- `frontend/src/features/auth/context/AuthContext.tsx`
- `frontend/src/features/auth/hooks/useSession.ts`
- `frontend/src/shared/ui/Screen.tsx`
- `frontend/src/shared/ui/components/SectionTitle.tsx`
- `frontend/src/shared/ui/components/StateMessage.tsx`
- `frontend/src/core/theme/theme.ts`

## Hallazgos

### H1 (P0) — Posible redirección prematura en `app/index.tsx`

La raíz redirigía directo a `/(app)/(tabs)/home`, sin contemplar estado de sesión cargando.

### H2 (P1) — Layouts devolvían `null` durante loading

Tanto `/(app)` como `/(public)` devolvían `null` mientras cargaba la sesión, generando experiencia de blank screen.

### H3 (P1) — `useSession` sin manejo explícito de error/finalización segura

La carga inicial no contemplaba `catch/finally` para robustecer estado `loading` ante errores.

## Correcciones aplicadas

1. `app/index.tsx` ahora usa estado de auth y muestra loading screen antes de decidir redirect.
2. Se creó `LoadingScreen` y se usa en layouts `/(app)` y `/(public)` durante carga.
3. `useSession` ahora usa `try/catch/finally` para finalizar loading de forma segura.

## Resultado etapa 1

- Fundaciones estabilizadas para continuar inspección por módulos sin flicker ni blank states en boot.
- Se mantiene enfoque dark/luxury y consistencia visual.
