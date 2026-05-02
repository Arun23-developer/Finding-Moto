import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppNavigation } from '../../App';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type RegisterScreenProps = {
  navigation: AppNavigation;
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>Join Finding Moto</Text>
          <Text style={styles.title}>Create your rider profile.</Text>
          <Text style={styles.copy}>This form maps cleanly to your current register API and role workflow.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.twoCol}>
            <AppInput label="First name" placeholder="Thulax" style={styles.flexInput} />
            <AppInput label="Last name" placeholder="Rider" style={styles.flexInput} />
          </View>
          <AppInput label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <AppInput label="Phone" placeholder="+94 77 123 4567" keyboardType="phone-pad" />
          <AppInput label="Password" placeholder="Create password" secureTextEntry />
          <AppButton onPress={() => navigation.goTo({ name: 'Home' })}>Create Account</AppButton>
          <AppButton variant="ghost" onPress={() => navigation.goTo({ name: 'Login' })}>Already have an account?</AppButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  header: { gap: 10 },
  brand: { color: colors.accent, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 34, lineHeight: 39, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 23, fontWeight: '600' },
  form: { gap: spacing.md },
  twoCol: { flexDirection: 'row', gap: 12 },
  flexInput: { flex: 1 },
});
