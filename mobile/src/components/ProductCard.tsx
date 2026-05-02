import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../data/catalog';
import { colors } from '../theme/colors';

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
};

export function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <ImageBackground source={{ uri: product.image }} imageStyle={styles.image} style={styles.imageWrap}>
        <View style={styles.rating}>
          <Ionicons name="star" size={13} color={colors.warning} />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
      </ImageBackground>
      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{product.price}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 236,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    width: '100%',
  },
  imageWrap: {
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.surfaceSoft,
  },
  image: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 11, 16, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 14,
    gap: 6,
  },
  category: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
