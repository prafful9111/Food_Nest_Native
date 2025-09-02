import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { signOut } from '@/lib/authStore';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { api } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient'; // NEW

// Small gradient icon wrapper (yellow food theme)
function GradientIcon({ name, size = 24 }: { name: any; size?: number }) {
  const box = size + 12; // a bit of padding around the icon
  return (
    <LinearGradient
      colors={['#FFE082', '#FFC107', '#FFA000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradCircle,
        { width: box, height: box, borderRadius: box / 2 },
      ]}
    >
      <Feather
        name={name}
        size={size}
        color='#fff'
      />
    </LinearGradient>
  );
}



export default function SuperAdminLayout() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const refreshPendingCount = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<{ count: number }>(
        '/api/admin/requests/count'
      );
      setPendingRequests(data.count);
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      if (pendingRequests === 0) setPendingRequests(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const id = setInterval(refreshPendingCount, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  

  return (
    <Drawer
      screenOptions={{
        headerTitle: 'SuperAdmin',
        drawerActiveTintColor: '#7A4F01',
        drawerActiveBackgroundColor: 'rgba(255,193,7,0.12)',
      }}
    >
      <Drawer.Screen
        name='overview'
        options={{
          title: 'Overview',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='home'
              size={size}
            />
          ),
        }}
      />

      <Drawer.Screen
        name='user-management'
        options={{
          title: `User Management${
            pendingRequests > 0 ? ` (${pendingRequests} pending)` : ''
          }`,
          drawerIcon: ({ size }) => (
            <View style={styles.iconContainer}>
              <GradientIcon
                name='users'
                size={size}
              />
              {pendingRequests > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{pendingRequests}</Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={{
          focus: () => {
            refreshPendingCount();
          },
        }}
      />

      <Drawer.Screen
        name='food-items'
        options={{
          title: 'Food Items',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='coffee'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='inventory'
        options={{
          title: 'Inventory',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='package'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='routes-management'
        options={{
          title: 'Routes Management',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='map'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='team-management'
        options={{
          title: 'Team Management',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='users'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='combos-management'
        options={{
          title: 'Combos Management',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='layers'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='vehicles-management'
        options={{
          title: 'Vehicles Management',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='truck'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='analytics'
        options={{
          title: 'Analytics',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='bar-chart-2'
              size={size}
            />
          ),
        }}
      />

<Drawer.Screen

  name="misc-expenses"

  options={{
    title: "Expenses",          // header title
    drawerLabel: "Expenses",    // drawer item label
    drawerIcon: ({ size }) => (
      <GradientIcon name="credit-card" size={size} />
    ),
  }}
/>

      <Drawer.Screen
        name='signout'
        options={{
          title: 'Sign Out',
          drawerItemStyle: { marginTop: 'auto' },
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='log-out'
              size={size}
            />
          ),
        }}
        listeners={{
          focus: () => {
            // handled elsewhere if needed
          },
        }}
      />




      
    </Drawer>

    
    
  );
}

const styles = StyleSheet.create({
  gradCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
