import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ReminderAccount } from '@/context/ReminderContext';
import { ServiceIcon } from '@/components/ServiceIcon';
import { useLanguage } from '@/context/LanguageContext';

function formatDate(value: string) { return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' }).format(new Date(value)); }
function daysUntil(value: string) { return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000)); }
export function AccountCard({ account, onPress, onDelete }: { account: ReminderAccount; onPress: () => void; onDelete?: () => void }) {
  const colors = useColors();
  const { language, isRTL, t, intervalLabel } = useLanguage();
  const days = daysUntil(account.nextReminderAt);
  const overdue = new Date(account.nextReminderAt).getTime() < Date.now();
  const locale = language === 'ar' ? 'ar' : 'en';
  const dayLabel = days === 1 ? t('day') : t('days');
  return <Pressable testID={'account-card-' + account.id} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1, direction: isRTL ? 'rtl' : 'ltr' }]}>
    <ServiceIcon name={account.serviceName} />
    <View style={styles.copy}>
      <View style={styles.row}><Text style={[styles.name, { color: colors.foreground }]}>{account.serviceName}</Text><View style={styles.cardActions}><Feather name="chevron-left" size={19} color={colors.mutedForeground} />{onDelete ? <Pressable testID={'delete-account-' + account.id} onPress={onDelete} hitSlop={10} style={[styles.deleteButton, { backgroundColor: colors.secondary }]}><Feather name="trash-2" size={14} color={colors.destructive} /></Pressable> : null}</View></View>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>{t('lastChange')} {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(account.lastChangedAt))}</Text>
      <View style={styles.row}><Text style={[styles.meta, { color: overdue ? colors.destructive : colors.mutedForeground }]}>{overdue ? t('reminderDue') : t('reminderAfter') + ' ' + days + ' ' + dayLabel}</Text><Text style={[styles.interval, { color: colors.mintStrong, backgroundColor: colors.mint }]}>{intervalLabel(account.intervalKey)}</Text></View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({ card: { minHeight: 103, borderWidth: 1, borderRadius: 22, padding: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 14, shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, copy: { flex: 1, gap: 6 }, row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, cardActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }, deleteButton: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, name: { fontSize: 17, fontWeight: '700' }, meta: { fontSize: 12, fontWeight: '500' }, interval: { fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, overflow: 'hidden' } });
