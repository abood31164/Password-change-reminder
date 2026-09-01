import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { useReminders } from '@/context/ReminderContext';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

export default function LockScreen() { const colors = useColors(); const insets = useSafeAreaInsets(); const { unlock } = useReminders(); const { isRTL, t } = useLanguage(); return <View style={[styles.screen, { backgroundColor: colors.navy, paddingTop: insets.top, paddingBottom: insets.bottom, direction: isRTL ? 'rtl' : 'ltr' }]}><BrandMark /><Text style={styles.title}>{t('unlockTitle')}</Text><Text style={styles.body}>{t('unlockBody')}</Text><Pressable testID="unlock-button" onPress={unlock} style={({ pressed }) => [styles.button, { backgroundColor: colors.coral, opacity: pressed ? 0.8 : 1 }]}><Feather name="unlock" size={19} color={colors.primaryForeground} /><Text style={styles.buttonText}>{t('unlock')}</Text></Pressable></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, gap: 15 }, title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 10 }, body: { color: '#B7C3D7', fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 280 }, button: { width: '100%', minHeight: 55, borderRadius: 18, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 12 }, buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' } });
