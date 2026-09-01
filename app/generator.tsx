import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const NUMBERS = '23456789';
const SYMBOLS = '!@#$%^&*_-+=?';

async function createPassword(length: number, uppercase: boolean, numbers: boolean, symbols: boolean) {
  let pool = LOWER;
  const groups = [LOWER];
  if (uppercase) { pool += UPPER; groups.push(UPPER); }
  if (numbers) { pool += NUMBERS; groups.push(NUMBERS); }
  if (symbols) { pool += SYMBOLS; groups.push(SYMBOLS); }

  const bytes = await Crypto.getRandomBytesAsync(Math.max(length, groups.length) * 2);
  const chars = groups.map((group, index) => group[bytes[index] % group.length]);
  for (let index = chars.length; index < length; index += 1) {
    chars.push(pool[bytes[index % bytes.length] % pool.length]);
  }
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = bytes[index % bytes.length] % (index + 1);
    const current = chars[index];
    chars[index] = chars[swapIndex];
    chars[swapIndex] = current;
  }
  return chars.join('');
}

export default function GeneratorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL, t } = useLanguage();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setPassword(await createPassword(length, uppercase, numbers, symbols));
    setCopied(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function copyPassword() {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    setCopied(true);
    Alert.alert(t('copied'), t('copiedBody'));
  }

  function toggleLength(delta: number) {
    setLength((value) => Math.min(32, Math.max(8, value + delta)));
  }

  const options = [
    { label: t('uppercase'), value: uppercase, setValue: setUppercase, icon: 'type' as const },
    { label: t('numbers'), value: numbers, setValue: setNumbers, icon: 'hash' as const },
    { label: t('symbols'), value: symbols, setValue: setSymbols, icon: 'star' as const },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-right" size={23} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>{t('generator')}</Text>
        <View style={{ width: 23 }} />
      </View>
      <View style={{ padding: 20 }}>
        <View style={[styles.intro, { backgroundColor: colors.navy }]}>
          <View style={[styles.introIcon, { backgroundColor: colors.coral }]}>
            <Feather name="key" size={24} color={colors.primaryForeground} />
          </View>
          <Text style={styles.introTitle}>{t('strongerPassword')}</Text>
          <Text style={styles.introBody}>{t('generatorBody')}</Text>
        </View>

        <View style={[styles.passwordBox, { backgroundColor: colors.card, borderColor: colors.coral }]}>
          <Text selectable style={[styles.password, { color: colors.foreground }]}>{password || '...'}</Text>
          <Pressable testID="copy-password-button" onPress={copyPassword} hitSlop={10} style={[styles.copyButton, { backgroundColor: colors.mint }]}>
            <Feather name={copied ? 'check' : 'copy'} size={19} color={colors.mintStrong} />
          </Pressable>
        </View>
        <Pressable testID="generate-password-button" onPress={refresh} style={({ pressed }) => [styles.generate, { backgroundColor: colors.coral, opacity: pressed ? 0.8 : 1 }]}>
          <Feather name="refresh-cw" size={18} color={colors.primaryForeground} />
          <Text style={styles.generateText}>{t('newSuggestion')}</Text>
        </Pressable>

        <Text style={[styles.section, { color: colors.foreground }]}>{t('generatorOptions')}</Text>
        <View style={[styles.options, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.lengthRow}>
            <Text style={[styles.optionLabel, { color: colors.foreground }]}>{t('passwordLength')}</Text>
            <View style={styles.stepper}>
              <Pressable testID="decrease-length-button" onPress={() => toggleLength(-1)} style={[styles.stepButton, { backgroundColor: colors.secondary }]}>
                <Feather name="minus" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.lengthValue, { color: colors.coral }]}>{length}</Text>
              <Pressable testID="increase-length-button" onPress={() => toggleLength(1)} style={[styles.stepButton, { backgroundColor: colors.secondary }]}>
                <Feather name="plus" size={16} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
          {options.map((option) => (
            <Pressable key={option.label} testID={'toggle-' + option.label} onPress={() => option.setValue(!option.value)} style={[styles.optionRow, { borderTopColor: colors.border }]}>
              <View style={[styles.optionIcon, { backgroundColor: option.value ? colors.mint : colors.secondary }]}>
                <Feather name={option.icon} size={16} color={option.value ? colors.mintStrong : colors.mutedForeground} />
              </View>
              <Text style={[styles.optionLabel, { color: colors.foreground }]}>{option.label}</Text>
              <View style={[styles.toggle, { backgroundColor: option.value ? colors.coral : colors.muted }]}>
                <View style={[styles.toggleThumb, { backgroundColor: colors.primaryForeground, alignSelf: option.value ? 'flex-start' : 'flex-end' }]} />
              </View>
            </Pressable>
          ))}
        </View>
        <View style={[styles.privacy, { backgroundColor: colors.mint }]}>
          <Feather name="shield" size={16} color={colors.mintStrong} />
          <Text style={[styles.privacyText, { color: colors.mintStrong }]}>{t('generatorPrivacy')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { paddingHorizontal: 20, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700' },
  intro: { borderRadius: 24, padding: 20, alignItems: 'flex-end', gap: 8 },
  introIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  introTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '700', textAlign: 'right' },
  introBody: { color: '#DCE4F0', fontSize: 13, lineHeight: 20, textAlign: 'right' },
  passwordBox: { minHeight: 86, borderWidth: 1.5, borderRadius: 20, padding: 14, marginTop: 18, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  password: { flex: 1, fontSize: 18, fontWeight: '700', letterSpacing: 1, textAlign: 'left' },
  copyButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  generate: { minHeight: 53, borderRadius: 17, marginTop: 10, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9 },
  generateText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  section: { fontSize: 16, fontWeight: '700', textAlign: 'right', marginTop: 27, marginBottom: 10 },
  options: { borderWidth: 1, borderRadius: 21, paddingHorizontal: 16 },
  lengthRow: { minHeight: 65, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  optionLabel: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  stepButton: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  lengthValue: { fontSize: 18, fontWeight: '700', minWidth: 22, textAlign: 'center' },
  optionRow: { minHeight: 58, borderTopWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  optionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 45, height: 26, borderRadius: 14, padding: 3, marginLeft: 'auto' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
  privacy: { marginTop: 15, padding: 14, borderRadius: 17, flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 9 },
  privacyText: { flex: 1, fontSize: 12, lineHeight: 18, textAlign: 'right' },
});