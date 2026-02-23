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

export const houseTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 14,
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
