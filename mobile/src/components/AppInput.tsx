import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';

type AppInputProps = TextInputProps & {
  label: string;
};

export function AppInput({ label, style, ...props }: AppInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.faint}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 15,
  },
});
