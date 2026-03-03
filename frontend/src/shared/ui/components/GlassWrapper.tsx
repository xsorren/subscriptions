import React from 'react';
import { Platform, View, ViewStyle, AccessibilityInfo, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassWrapperProps {
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export function GlassWrapper({
  style,
  children,
  intensity = 50,
  tint = 'light',
  borderRadius = 16
}: GlassWrapperProps) {
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  React.useEffect(() => {
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled === 'function') {
      AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency).catch(() => { });
    }
  }, []);

  if (reduceTransparency) {
    return (
      <View style={[
        style,
        {
          backgroundColor: tint === 'dark' ? '#1c1c1e' : '#ffffff',
          borderRadius
        }
      ]}>
        {children}
      </View>
    );
  }

  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return (
      <BlurView
        intensity={intensity}
        tint={tint === 'default' ? 'default' : tint}
        style={[style, { borderRadius, overflow: 'hidden' }]}
      >
        {children}
      </BlurView>
    );
  }

  // Fallback for Android or other platforms where blur might not be available
  return (
    <View style={[
      style,
      {
        backgroundColor: tint === 'dark' ? 'rgba(28,28,30,0.8)' : 'rgba(255,255,255,0.7)',
        borderRadius,
        overflow: 'hidden'
      }
    ]}>
      {children}
    </View>
  );
}
