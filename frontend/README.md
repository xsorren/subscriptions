# Frontend Expo — House

Base frontend en React Native + Expo con identidad visual dark-mode minimalista y acento amarillo premium.

## Stack de UI y estilo

- `react-native-paper` para theming y componentes con look profesional.
- `@expo/vector-icons` para iconografía consistente.
- Tema custom House en `src/core/theme/theme.ts`.

## Arranque local

```bash
cd frontend
npm install
npm run start
```

## Variables de entorno

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Edge Functions esperadas

- `create-qr-token`
- `map-discover`
- `club-eligibility`
- `redeem-coupon`
