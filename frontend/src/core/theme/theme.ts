import { Platform } from 'react-native';
import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

const colors = {
  background: '#0E0E0F',
  surface: '#17171A',
  surfaceVariant: '#1F1F24',
  text: '#F5F5F6',
  muted: '#A7A7B2',
  border: '#2A2A31',
  primary: '#F7C948',
  primarySoft: '#F3D87E',
  success: '#5BD6A2',
  error: '#F36B6B',
};

const fontConfig = {
  displayLarge: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '900' },
  displayMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '900' },
  displaySmall: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '800' },
  headlineLarge: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '900' },
  headlineMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '800' },
  headlineSmall: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '800' },
  titleLarge: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '700' },
  titleMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '700' },
  titleSmall: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '700' },
  labelLarge: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '600' },
  labelMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '600' },
  labelSmall: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '600' },
  bodyLarge: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '500' },
  bodyMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' },
  bodySmall: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' },
} as const;

export const houseTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 20,
  fonts: {
    ...MD3DarkTheme.fonts,
    ...fontConfig,
  },
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: '#1A1A1A',
    secondary: colors.primarySoft,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.text,
    onBackground: colors.text,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    error: colors.error,
  },
};

export const housePalette = colors;
