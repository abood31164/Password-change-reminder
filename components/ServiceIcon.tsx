import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const iconMap: Record<string, keyof typeof Feather.glyphMap> = { Facebook: 'facebook', Instagram: 'instagram', Gmail: 'mail', Google: 'globe', LinkedIn: 'linkedin', Twitter: 'twitter', X: 'x', Apple: 'command' };
export function ServiceIcon({ name, size = 48 }: { name: string; size?: number }) {
  const colors = useColors();
  const icon = iconMap[name] ?? 'key';
  return <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: colors.mint }]}><Feather name={icon} size={size * 0.46} color={colors.mintStrong} /><Text style={[styles.fallback, { color: colors.mintStrong }]}>{icon === 'key' ? name.charAt(0).toUpperCase() : ''}</Text></View>;
}
const styles = StyleSheet.create({ icon: { alignItems: 'center', justifyContent: 'center' }, fallback: { position: 'absolute', fontSize: 18, fontWeight: '700' } });
