import { Ionicons } from '@expo/vector-icons';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { featuredProducts } from '../data/catalog';
import { AppNavigation } from '../../App';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProductDetailScreenProps = {
  navigation: AppNavigation;
  productId: string;
};

export function ProductDetailScreen({ navigation, productId }: ProductDetailScreenProps) {
  const product = featuredProducts.find((item) => item.id === productId) || featuredProducts[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={{ uri: product.image }} imageStyle={styles.image} style={styles.hero}>
          <Pressable onPress={navigation.goBack} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>

          <View style={styles.sellerCard}>
            <View style={styles.sellerIcon}>
              <Ionicons name="storefront" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.seller}>{product.seller}</Text>
              <Text style={styles.location}>{product.location}</Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          </View>

          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.specGrid}>
            {product.specs.map((spec) => (
              <View key={spec} style={styles.spec}>
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            A premium listing layout ready to connect with your product detail API. Add seller chat, order workflow,
            reviews and image galleries as your next mobile features.
          </Text>

          <View style={styles.actions}>
            <AppButton variant="secondary" style={{ flex: 1 }}>Chat</AppButton>
            <AppButton style={{ flex: 1 }}>Add to Cart</AppButton>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 34 },
  hero: { height: 360, padding: spacing.md, justifyContent: 'space-between', backgroundColor: colors.surface },
  image: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 16, 0.74)',
  },
  rating: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 11, 16, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  body: { padding: spacing.md, gap: spacing.md },
  category: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 32, fontWeight: '900' },
  price: { color: colors.text, fontSize: 22, fontWeight: '900' },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 106, 0, 0.12)',
  },
  seller: { color: colors.text, fontSize: 15, fontWeight: '900' },
  location: { marginTop: 3, color: colors.muted, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  spec: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.surfaceSoft },
  specText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
});
