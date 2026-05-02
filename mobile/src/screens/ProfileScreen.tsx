import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { AppNavigation } from '../../App';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProfileScreenProps = {
  navigation: AppNavigation;
};

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.text} />
          </View>
          <Text style={styles.name}>Guest Rider</Text>
          <Text style={styles.role}>Sign in to sync cart, orders and seller tools.</Text>
          <View style={styles.actions}>
            <AppButton style={{ flex: 1 }} onPress={() => navigation.goTo({ name: 'Login' })}>Login</AppButton>
            <AppButton variant="secondary" style={{ flex: 1 }} onPress={() => navigation.goTo({ name: 'Register' })}>Register</AppButton>
          </View>
        </View>

        {['Orders', 'Notifications', 'Returns & Claims', 'Support Center'].map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.rowText}>{item}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.faint} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: 12 },
  profileCard: {
    alignItems: 'center',
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  role: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  row: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: { color: colors.text, fontSize: 15, fontWeight: '800' },
});
