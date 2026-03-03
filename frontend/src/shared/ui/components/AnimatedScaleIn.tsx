import { useEffect, useRef, PropsWithChildren } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { hapticFeedback } from '../../../core/lib/haptics';

type Props = PropsWithChildren<{
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  withHaptic?: boolean;
}>;

export function AnimatedScaleIn({ children, delay = 0, duration = 600, style, withHaptic = false }: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (withHaptic) {
      setTimeout(() => hapticFeedback.light(), delay);
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, delay, duration, withHaptic]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}
