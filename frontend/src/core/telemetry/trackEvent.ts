export function trackEvent(event: string, payload?: Record<string, unknown>) {
  // Placeholder inicial: en próxima fase conectar a provider real (PostHog/Firebase/etc.)
  // Mantener en consola para trazabilidad en entorno dev.
  // eslint-disable-next-line no-console
  console.log('[telemetry]', event, payload ?? {});
}
