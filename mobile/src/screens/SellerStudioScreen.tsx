import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SellerStudioScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Seller Studio</Text>
          <Text style={styles.title}>Add a premium listing</Text>
          <Text style={styles.copy}>A mobile-friendly CRUD form starter for your seller product module.</Text>
        </View>

        <View style={styles.upload}>
          <Ionicons name="camera-outline" size={30} color={colors.accent} />
          <Text style={styles.uploadTitle}>Upload product photos</Text>
          <Text style={styles.uploadCopy}>Use Expo Image Picker here and send FormData to your backend.</Text>
        </View>

        <View style={styles.form}>
          <AppInput label="Product name" placeholder="Yamaha R15 V4" />
          <AppInput label="Category" placeholder="Sport Bike" />
          <AppInput label="Price" placeholder="LKR 1,850,000" keyboardType="numeric" />
          <AppInput label="Description" placeholder="Condition, mileage, service records..." multiline style={{ height: 110, textAlignVertical: 'top', paddingTop: 14 }} />
          <AppButton>Create Listing</AppButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 110, gap: spacing.lg },
  header: { gap: 8 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  upload: {
    minHeight: 170,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  uploadCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', fontWeight: '600' },
  form: { gap: spacing.md },
});
