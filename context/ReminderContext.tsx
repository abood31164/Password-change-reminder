import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { cancelReminder, prepareNotifications, scheduleReminder } from '@/lib/notifications';

export type IntervalKey = 'day' | '2days' | '3days' | '5days' | '10days' | '15days' | 'month' | '2months' | '3months' | '6months';
export type ReminderAccount = {
  id: string;
  serviceName: string;
  intervalKey: IntervalKey;
  intervalLabel: string;
  intervalDays: number;
  lastChangedAt: string;
  nextReminderAt: string;
  notificationId?: string | null;
};

export const INTERVALS: { key: IntervalKey; label: string; days: number }[] = [
  { key: 'day', label: 'كل يوم', days: 1 },
  { key: '2days', label: 'كل يومين', days: 2 },
  { key: '3days', label: 'كل 3 أيام', days: 3 },
  { key: '5days', label: 'كل 5 أيام', days: 5 },
  { key: '10days', label: 'كل 10 أيام', days: 10 },
  { key: '15days', label: 'كل 15 يوماً', days: 15 },
  { key: 'month', label: 'كل شهر', days: 30 },
  { key: '2months', label: 'كل شهرين', days: 60 },
  { key: '3months', label: 'كل 3 أشهر', days: 90 },
  { key: '6months', label: 'كل 6 أشهر', days: 180 },
];

const ACCOUNTS_KEY = '@password-reminder/accounts';
const LOCK_KEY = '@password-reminder/lock-enabled';
const INTRO_KEY = '@password-reminder/intro-seen';

type ReminderContextValue = {
  accounts: ReminderAccount[];
  loading: boolean;
  lockEnabled: boolean;
  isLocked: boolean;
  hasSeenIntro: boolean;
  addAccount: (serviceName: string, intervalKey: IntervalKey) => Promise<ReminderAccount>;
  updateAccount: (id: string, serviceName: string, intervalKey: IntervalKey) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  markPasswordChanged: (id: string) => Promise<void>;
  setLockEnabled: (enabled: boolean) => Promise<boolean>;
  unlock: () => Promise<boolean>;
  completeIntro: () => Promise<void>;
};

const ReminderContext = createContext<ReminderContextValue | null>(null);

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<ReminderAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storedAccounts, storedLock, introSeen] = await Promise.all([
          AsyncStorage.getItem(ACCOUNTS_KEY),
          AsyncStorage.getItem(LOCK_KEY),
          AsyncStorage.getItem(INTRO_KEY),
        ]);
        const parsed: ReminderAccount[] = storedAccounts ? JSON.parse(storedAccounts) : [];
        const enabled = storedLock === 'true';
        setAccounts(parsed);
        setLockEnabledState(enabled);
        setHasSeenIntro(introSeen === 'true');
        setIsLocked(enabled && Platform.OS !== 'web');
        await prepareNotifications();
      } catch {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function persist(next: ReminderAccount[]) {
    setAccounts(next);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
  }

  async function addAccount(serviceName: string, intervalKey: IntervalKey) {
    const option = INTERVALS.find((item) => item.key === intervalKey) ?? INTERVALS[6];
    const now = new Date();
    const account: ReminderAccount = {
      id: makeId(),
      serviceName: serviceName.trim(),
      intervalKey: option.key,
      intervalLabel: option.label,
      intervalDays: option.days,
      lastChangedAt: now.toISOString(),
      nextReminderAt: addDays(now, option.days).toISOString(),
      notificationId: null,
    };
    const notificationId = await scheduleReminder(account);
    const saved = { ...account, notificationId };
    await persist([saved, ...accounts]);
    return saved;
  }

  async function updateAccount(id: string, serviceName: string, intervalKey: IntervalKey) {
    const option = INTERVALS.find((item) => item.key === intervalKey) ?? INTERVALS[6];
    const current = accounts.find((item) => item.id === id);
    if (!current) return;
    const updated: ReminderAccount = {
      ...current,
      serviceName: serviceName.trim(),
      intervalKey: option.key,
      intervalLabel: option.label,
      intervalDays: option.days,
      nextReminderAt: addDays(new Date(current.lastChangedAt), option.days).toISOString(),
    };
    const notificationId = await scheduleReminder(updated);
    await persist(accounts.map((item) => item.id === id ? { ...updated, notificationId } : item));
  }

  async function removeAccount(id: string) {
    const current = accounts.find((item) => item.id === id);
    if (current) await cancelReminder(current.notificationId);
    await persist(accounts.filter((item) => item.id !== id));
  }

  async function markPasswordChanged(id: string) {
    const current = accounts.find((item) => item.id === id);
    if (!current) return;
    const now = new Date();
    const updated = { ...current, lastChangedAt: now.toISOString(), nextReminderAt: addDays(now, current.intervalDays).toISOString() };
    const notificationId = await scheduleReminder(updated);
    await persist(accounts.map((item) => item.id === id ? { ...updated, notificationId } : item));
  }

  async function setLockEnabled(enabled: boolean) {
    if (enabled && Platform.OS !== 'web') {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'افتح مُذكّر الأمان', fallbackLabel: 'استخدم رمز الجهاز' });
      if (!result.success) return false;
    }
    setLockEnabledState(enabled);
    setIsLocked(false);
    await AsyncStorage.setItem(LOCK_KEY, String(enabled));
    return true;
  }

  async function unlock() {
    if (Platform.OS === 'web') {
      setIsLocked(false);
      return true;
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'افتح مُذكّر الأمان', fallbackLabel: 'استخدم رمز الجهاز' });
    if (result.success) setIsLocked(false);
    return result.success;
  }

  async function completeIntro() {
    setHasSeenIntro(true);
    await AsyncStorage.setItem(INTRO_KEY, 'true');
  }

  const value = useMemo(() => ({ accounts, loading, lockEnabled, isLocked, hasSeenIntro, addAccount, updateAccount, removeAccount, markPasswordChanged, setLockEnabled, unlock, completeIntro }), [accounts, loading, lockEnabled, isLocked, hasSeenIntro]);
  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders() {
  const value = useContext(ReminderContext);
  if (!value) throw new Error('useReminders must be used inside ReminderProvider');
  return value;
}
