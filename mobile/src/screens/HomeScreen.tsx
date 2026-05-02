import { Ionicons } from '@expo/vector-icons';
import { FlatList, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '../components/ProductCard';
import { categories, featuredProducts, serviceHighlights } from '../data/catalog';
import { AppNavigation } from '../../App';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type HomeScreenProps = {
  navigation: AppNavigation;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Finding Moto</Text>
            <Text style={styles.title}>Find your next ride.</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.text} />
          </View>
        </View>

        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1400&q=80' }}
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroShade}>
            <View style={styles.pill}>
              <Ionicons name="flash" size={14} color={colors.accent} />
              <Text style={styles.pillText}>Premium marketplace</Text>
            </View>
            <Text style={styles.heroTitle}>Bikes, parts and mechanics in one garage.</Text>
            <Text style={styles.heroCopy}>Explore verified sellers, service bookings and performance parts built for Sri Lankan riders.</Text>
          </View>
        </ImageBackground>

        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <Text style={styles.searchText}>Search bikes, parts, services</Text>
          <Ionicons name="options-outline" size={20} color={colors.accent} />
        </View>

        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item, index }) => (
            <View style={[styles.chip, index === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{item}</Text>
            </View>
          )}
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Featured Rides</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </View>

        <FlatList
          horizontal
          data={featuredProducts}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.goTo({ name: 'ProductDetail', productId: item.id })} />
          )}
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Garage Services</Text>
          <Text style={styles.sectionLink}>Book now</Text>
        </View>

        <View style={styles.serviceGrid}>
          {serviceHighlights.map((service) => (
            <View key={service.title} style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Ionicons name={service.icon} size={22} color={colors.accent} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceMeta}>{service.meta}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 110, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { marginTop: 4, color: colors.text, fontSize: 30, fontWeight: '900' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: { minHeight: 260, overflow: 'hidden', borderRadius: 28, backgroundColor: colors.surface },
  heroImage: { borderRadius: 28 },
  heroShade: { flex: 1, justifyContent: 'flex-end', padding: 22, backgroundColor: 'rgba(0,0,0,0.34)', gap: 10 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 11, 16, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  heroTitle: { color: colors.text, fontSize: 27, lineHeight: 32, fontWeight: '900' },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  search: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchText: { flex: 1, color: colors.muted, fontSize: 14, fontWeight: '700' },
  categoryList: { gap: 10 },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  chipTextActive: { color: colors.text },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  sectionLink: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  serviceGrid: { gap: 12 },
  serviceCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 106, 0, 0.12)',
  },
  serviceTitle: { marginTop: 12, color: colors.text, fontSize: 16, fontWeight: '900' },
  serviceMeta: { marginTop: 4, color: colors.muted, fontSize: 13, fontWeight: '700' },
});
