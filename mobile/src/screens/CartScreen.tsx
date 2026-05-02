import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function CartScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.emptyIcon}>
          <Ionicons name="bag-outline" size={42} color={colors.accent} />
        </View>
        <Text style={styles.title}>Your cart is ready for API items.</Text>
        <Text style={styles.copy}>
          Connect this screen to your existing cart endpoints and show products as compact mobile checkout cards.
        </Text>
        <AppButton>Browse Products</AppButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 106, 0, 0.12)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, textAlign: 'center', fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', fontWeight: '600' },
});
