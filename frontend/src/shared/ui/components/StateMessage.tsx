import { Text, useTheme } from 'react-native-paper';

type Props = {
  variant?: 'error' | 'empty' | 'info';
  message: string;
};

export function StateMessage({ variant = 'info', message }: Props) {
  const theme = useTheme();
  const color =
    variant === 'error'
      ? theme.colors.error
      : variant === 'empty'
        ? theme.colors.onSurfaceVariant
        : theme.colors.onSurface;

  return (
    <Text
      style={{ color }}
      accessibilityRole={variant === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion={variant === 'error' ? 'assertive' : 'polite'}
    >
      {message}
    </Text>
  );
}
