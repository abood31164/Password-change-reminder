import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ small = false }: { small?: boolean }) {
  const colors = useColors();
  return <View style={[styles.mark, { backgroundColor: colors.coral }, small && styles.small]}><Feather name="shield" size={small ? 17 : 25} color={colors.primaryForeground} /></View>;
}
const styles = StyleSheet.create({ mark: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, small: { width: 37, height: 37, borderRadius: 12 } });
