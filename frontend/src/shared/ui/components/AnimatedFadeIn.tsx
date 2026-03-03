import { useEffect, useRef, PropsWithChildren } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { hapticFeedback } from '../../../core/lib/haptics';

type Props = PropsWithChildren<{
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  withHaptic?: boolean;
}>;

export function AnimatedFadeIn({ children, delay = 0, duration = 600, style, withHaptic = false }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (withHaptic) {
      setTimeout(() => hapticFeedback.light(), delay);
    }
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration, withHaptic]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
