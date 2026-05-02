import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { SellerStudioScreen } from './src/screens/SellerStudioScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

export type AppScreen =
  | { name: 'Home' }
  | { name: 'Products' }
  | { name: 'Cart' }
  | { name: 'Sell' }
  | { name: 'Profile' }
  | { name: 'Login' }
  | { name: 'Register' }
  | { name: 'ProductDetail'; productId: string };

export type AppNavigation = {
  goTo: (screen: AppScreen) => void;
  goBack: () => void;
};

const tabs: Array<{
  name: AppScreen['name'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Products', label: 'Products', icon: 'grid-outline', activeIcon: 'grid' },
  { name: 'Cart', label: 'Cart', icon: 'bag-outline', activeIcon: 'bag' },
  { name: 'Sell', label: 'Sell', icon: 'speedometer-outline', activeIcon: 'speedometer' },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function App() {
  const [history, setHistory] = useState<AppScreen[]>([{ name: 'Home' }]);
  const current = history[history.length - 1];

  const navigation: AppNavigation = {
    goTo: (screen) => setHistory((items) => [...items, screen]),
    goBack: () => setHistory((items) => (items.length > 1 ? items.slice(0, -1) : items)),
  };

  const jumpToTab = (name: AppScreen['name']) => {
    setHistory([{ name } as AppScreen]);
  };

  const renderScreen = () => {
    switch (current.name) {
      case 'Products':
        return <ProductsScreen navigation={navigation} />;
      case 'Cart':
        return <CartScreen />;
      case 'Sell':
        return <SellerStudioScreen />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Register':
        return <RegisterScreen navigation={navigation} />;
      case 'ProductDetail':
        return <ProductDetailScreen navigation={navigation} productId={current.productId} />;
      case 'Home':
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const showTabs = tabs.some((tab) => tab.name === current.name);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.screen}>{renderScreen()}</View>
        {showTabs ? (
          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const active = current.name === tab.name;

              return (
                <Pressable key={tab.name} onPress={() => jumpToTab(tab.name)} style={styles.tabItem}>
                  <Ionicons name={active ? tab.activeIcon : tab.icon} size={23} color={active ? colors.accent : colors.muted} />
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 72,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: colors.accent,
  },
});
