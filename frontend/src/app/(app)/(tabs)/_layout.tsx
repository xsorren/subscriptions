import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { housePalette } from '../../../core/theme/theme';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { hapticFeedback } from '../../../core/lib/haptics';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => (
          <View style={{ flex: 1 }}>
            {/* We intercept the press to add haptics */}
            <View onTouchStart={() => hapticFeedback.light()}>
              {props.children as any}
            </View>
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 32,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          paddingBottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
        },
        tabBarBackground: () => (
          <GlassWrapper 
            intensity={45} 
            tint="dark" 
            borderRadius={32} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }} 
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(247, 201, 72, 0.03)' }} />
          </GlassWrapper>
        ),
        tabBarActiveTintColor: housePalette.primary,
        tabBarInactiveTintColor: housePalette.muted,
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 10,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        },
        tabBarIconStyle: {
          marginTop: 8
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-radius-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="coupons"
        options={{
          title: 'Cupones',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="ticket-percent-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
