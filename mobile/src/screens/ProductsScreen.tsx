import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '../components/ProductCard';
import { featuredProducts } from '../data/catalog';
import { AppNavigation } from '../../App';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProductsScreenProps = {
  navigation: AppNavigation;
};

export function ProductsScreen({ navigation }: ProductsScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={featuredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Marketplace</Text>
            <Text style={styles.title}>Verified bikes and parts</Text>
            <Text style={styles.copy}>Mobile-ready list design for products coming from your Express API.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <ProductCard compact product={item} onPress={() => navigation.goTo({ name: 'ProductDetail', productId: item.id })} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 110 },
  header: { marginBottom: spacing.lg, gap: 8 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' },
});
