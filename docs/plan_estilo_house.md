# Plan de identidad visual — House

## Objetivo

Definir una identidad minimalista, suave y lujosa para House, priorizando dark mode con contraste premium en amarillo.

## Principios de diseño

1. **Minimalismo funcional**
   - Jerarquía visual clara, ruido visual mínimo.
2. **Suavidad visual**
   - Superficies oscuras en capas (`background`, `surface`, `surfaceVariant`).
3. **Contraste elegante**
   - Amarillo como acento primario para CTAs, estados activos e highlights.
4. **Consistencia total**
   - Tokens centralizados para color, spacing, tipografía y componentes base.

## Paleta House (dark)

- Background: `#0E0E0F`
- Surface: `#17171A`
- Surface Variant: `#1F1F24`
- Text: `#F5F5F6`
- Muted: `#A7A7B2`
- Border: `#2A2A31`
- Primary (amarillo): `#F7C948`
- Primary Soft: `#F3D87E`
- Success: `#5BD6A2`
- Error: `#F36B6B`

## Librerías de estilo seleccionadas

- **react-native-paper** (tema MD3 dark custom + componentes premium).
- **@expo/vector-icons** (iconografía consistente para navegación y estado).

## Arquitectura de estilo

1. `core/theme/theme.ts`
   - Fuente única de tema y tokens.
2. `app/_layout.tsx`
   - Montaje de `PaperProvider` global.
3. `shared/ui/*`
   - Componentes base reutilizables (`Screen`, `SectionTitle`, `StateMessage`).
4. Pantallas por módulo
   - Uso de `Card`, `Button`, `Chip`, tipografías y spacing consistentes.

## Plan módulo por módulo

### Auth
- Landing/sign-in con branding House y CTA principal amarilla.

### Home
- Tarjeta de bienvenida premium con foco en claridad.

### Coupons
- Wallet con cards elevadas + chips de estado.

### Map
- Descubrimiento con cards accionables + CTA de navegación.

### Club Detail
- Resumen elegante + elegibilidad + botón "Cómo llegar".

### Redeem QR
- Pantalla dedicada con CTA prominente para iniciar escaneo.

## Criterios de calidad visual

- Contraste AA mínimo para textos.
- CTAs primarias siempre en amarillo.
- Máximo de 2 niveles de elevación por pantalla.
- Estados vacíos/errores consistentes y sobrios.

## Próxima fase visual

- Añadir animaciones sutiles (entradas/fade/scale corto).
- Incorporar tipografía premium (por ejemplo, Inter o Manrope).
- Construir design system completo con tokens de spacing y radius.
