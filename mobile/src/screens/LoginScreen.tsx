import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppNavigation } from '../../App';
import { API_URL } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LoginScreenProps = {
  navigation: AppNavigation;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Finding Moto</Text>
          <Text style={styles.title}>Welcome back, rider.</Text>
          <Text style={styles.copy}>Login screen prepared for your `/auth/login` endpoint.</Text>
        </View>

        <View style={styles.form}>
          <AppInput label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <AppInput label="Password" placeholder="Your password" secureTextEntry />
          <AppButton onPress={() => navigation.goTo({ name: 'Home' })}>Sign In</AppButton>
          <AppButton variant="ghost" onPress={() => navigation.goTo({ name: 'Register' })}>Create new account</AppButton>
        </View>

        <Text style={styles.apiText}>API: {API_URL}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  header: { gap: 10 },
  brand: { color: colors.accent, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 34, lineHeight: 39, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 23, fontWeight: '600' },
  form: { gap: spacing.md },
  apiText: { color: colors.faint, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
