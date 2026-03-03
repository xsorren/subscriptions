import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  width?: ViewStyle['width'];
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonCard({ width = '100%', height = 80, borderRadius = 20, style }: Props) {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.shimmerGradient} />
      </Animated.View>
    </View>
  );
}

export function SkeletonList({ count = 3, height = 100, style }: { count?: number, height?: number, style?: ViewStyle }) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} style={i > 0 ? { marginTop: 16 } : undefined} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  shimmerGradient: {
    flex: 1,
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    transform: [{ skewX: '-20deg' }],
  },
  list: {
    paddingVertical: 10,
  },
});
