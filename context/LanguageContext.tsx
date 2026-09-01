import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'ar' | 'en';

const LANGUAGE_KEY = '@password-reminder/language';

const ar = {
  safeSpace: 'مساحتك الآمنة',
  welcome: 'مرحباً بك',
  smallHabit: 'عادة صغيرة، حماية أكبر',
  doNotWait: 'لا تنتظر حتى تنسى',
  reminderIntro: 'نذكّرك في الوقت المناسب لتبقى حساباتك أكثر أماناً.',
  accounts: 'حساباتك',
  account: 'حساب',
  accountsPlural: 'حسابات',
  nextReminder: 'التذكير القادم',
  startWithOne: 'ابدأ بحساب واحد',
  emptyBody: 'أضف حساباتك وسنتولى تذكيرك بتغيير كلمات المرور في الوقت المناسب.',
  addAccount: 'إضافة حساب',
  settings: 'الإعدادات',
  passwordSuggestion: 'اقتراح كلمة مرور',
  passwordSuggestionBody: 'أنشئ كلمة قوية وعشوائية دون حفظها',
  accountDetails: 'تفاصيل الحساب',
  delete: 'حذف',
  cancel: 'إلغاء',
  deleteAccount: 'حذف الحساب؟',
  deleteAccountBody: 'سيتم حذف هذا الحساب وإلغاء تذكيره من جهازك.',
  accountMissing: 'الحساب غير موجود',
  lastChange: 'آخر تغيير',
  nextReminderDate: 'التذكير القادم',
  reminderStatus: 'حالة التذكير',
  passwordChanged: 'تم تغيير كلمة المرور',
  great: 'أحسنت!',
  reminderUpdated: 'تم تحديث الموعد وجدولة التذكير القادم.',
  reminderFrequency: 'تكرار التذكير',
  edit: 'تعديل',
  save: 'حفظ',
  addAccountTitle: 'ما الحساب الذي تريد حمايته؟',
  addAccountBody: 'لن نطلب كلمة المرور. نحتاج فقط إلى اسم الخدمة لتخصيص تذكيرك.',
  accountName: 'اسم الحساب أو الخدمة',
  accountPlaceholder: 'مثال: Instagram',
  chooseFrequency: 'اختر ما يناسبك',
  localPrivacy: 'بياناتك تبقى على جهازك. هذا التطبيق لا يحفظ كلمات المرور ولا يرسل أسماء حساباتك.',
  saveReminder: 'حفظ التذكير',
  saving: 'جاري الحفظ...',
  requiredName: 'اسم الحساب مطلوب',
  requiredNameBody: 'اكتب اسم الخدمة أو الحساب أولاً.',
  unableToSave: 'تعذر الحفظ',
  unableToSaveBody: 'تحقق من صلاحيات الإشعارات وحاول مرة أخرى.',
  biometricUnavailable: 'القفل الحيوي غير متاح',
  biometricUnavailableBody: 'فعّل بصمة الإصبع أو Face ID على جهازك ثم حاول مرة أخرى.',
  securityTools: 'أدوات الأمان',
  lockApp: 'قفل التطبيق',
  lockAppBody: 'استخدم البصمة أو Face ID عند فتح التطبيق',
  privacySecurity: 'الخصوصية والحماية',
  privacyNote: 'نحفظ اسم الخدمة وموعد التذكير على جهازك فقط. لا نطلب كلمة المرور ولا نرسل بياناتك إلى أي خادم.',
  about: 'عن التطبيق',
  appName: 'مُذكّر الأمان',
  appTagline: 'حماية يومية، بدون تعقيد',
  version: 'إصدار 1.0.0',
  language: 'لغة التطبيق',
  arabic: 'العربية',
  english: 'English',
  unlockTitle: 'مُذكّر الأمان مقفل',
  unlockBody: 'افتح التطبيق بالبصمة أو Face ID للوصول إلى حساباتك.',
  unlock: 'فتح التطبيق',
  generator: 'اقتراح كلمة مرور',
  strongerPassword: 'كلمة أقوى، حساب أكثر أماناً',
  generatorBody: 'ولّد اقتراحاً عشوائياً قوياً. لن يتم حفظه داخل التطبيق.',
  newSuggestion: 'اقتراح جديد',
  generatorOptions: 'خيارات الاقتراح',
  passwordLength: 'طول كلمة المرور',
  uppercase: 'أحرف كبيرة',
  numbers: 'أرقام',
  symbols: 'رموز خاصة',
  copied: 'تم النسخ',
  copiedBody: 'أصبحت كلمة المرور جاهزة للصقها في إعدادات الحساب.',
  generatorPrivacy: 'استخدم كلمة مختلفة لكل حساب، واحفظها في مدير كلمات مرور موثوق.',
  loading: 'جاري تجهيز مساحتك الآمنة...',
  reminderDue: 'التذكير مستحق الآن',
  reminderAfter: 'التذكير بعد',
  day: 'يوم',
  days: 'أيام',
  allDay: 'كل يوم',
  everyTwoDays: 'كل يومين',
  everyThreeDays: 'كل 3 أيام',
  everyFiveDays: 'كل 5 أيام',
  everyTenDays: 'كل 10 أيام',
  everyFifteenDays: 'كل 15 يوماً',
  everyMonth: 'كل شهر',
  everyTwoMonths: 'كل شهرين',
  everyThreeMonths: 'كل 3 أشهر',
  everySixMonths: 'كل 6 أشهر',
} as const;

const en = {
  safeSpace: 'Your safe space',
  welcome: 'Welcome back',
  smallHabit: 'A small habit, stronger protection',
  doNotWait: 'Don’t wait until you forget',
  reminderIntro: 'We’ll remind you at the right time to keep your accounts safer.',
  accounts: 'Your accounts',
  account: 'account',
  accountsPlural: 'accounts',
  nextReminder: 'Next reminder',
  startWithOne: 'Start with one account',
  emptyBody: 'Add your accounts and we’ll remind you to change your passwords at the right time.',
  addAccount: 'Add account',
  settings: 'Settings',
  passwordSuggestion: 'Password suggestion',
  passwordSuggestionBody: 'Create a strong, random password without saving it',
  accountDetails: 'Account details',
  delete: 'Delete',
  cancel: 'Cancel',
  deleteAccount: 'Delete account?',
  deleteAccountBody: 'This account and its reminder will be removed from your device.',
  accountMissing: 'Account not found',
  lastChange: 'Last changed',
  nextReminderDate: 'Next reminder',
  reminderStatus: 'Reminder status',
  passwordChanged: 'Password changed',
  great: 'Great!',
  reminderUpdated: 'The date was updated and the next reminder was scheduled.',
  reminderFrequency: 'Reminder frequency',
  edit: 'Edit',
  save: 'Save',
  addAccountTitle: 'Which account do you want to protect?',
  addAccountBody: 'We never need your password. We only need the service name to personalize your reminder.',
  accountName: 'Account or service name',
  accountPlaceholder: 'Example: Instagram',
  chooseFrequency: 'Choose what works for you',
  localPrivacy: 'Your data stays on your device. This app never stores passwords or sends account names anywhere.',
  saveReminder: 'Save reminder',
  saving: 'Saving...',
  requiredName: 'Account name required',
  requiredNameBody: 'Enter a service or account name first.',
  unableToSave: 'Could not save',
  unableToSaveBody: 'Check notification permissions and try again.',
  biometricUnavailable: 'Biometric lock unavailable',
  biometricUnavailableBody: 'Enable fingerprint or Face ID on your device and try again.',
  securityTools: 'Security tools',
  lockApp: 'App lock',
  lockAppBody: 'Use your fingerprint or Face ID when opening the app',
  privacySecurity: 'Privacy & security',
  privacyNote: 'We save the service name and reminder date on your device only. We never ask for or send your password.',
  about: 'About',
  appName: 'Security Reminder',
  appTagline: 'Daily protection, without the hassle',
  version: 'Version 1.0.0',
  language: 'App language',
  arabic: 'العربية',
  english: 'English',
  unlockTitle: 'Security Reminder is locked',
  unlockBody: 'Use your fingerprint or Face ID to access your accounts.',
  unlock: 'Unlock app',
  generator: 'Password suggestion',
  strongerPassword: 'A stronger password, a safer account',
  generatorBody: 'Generate a strong random suggestion. It will not be saved in the app.',
  newSuggestion: 'New suggestion',
  generatorOptions: 'Suggestion options',
  passwordLength: 'Password length',
  uppercase: 'Uppercase',
  numbers: 'Numbers',
  symbols: 'Special symbols',
  copied: 'Copied',
  copiedBody: 'The password is ready to paste into your account settings.',
  generatorPrivacy: 'Use a different password for every account and keep it in a trusted password manager.',
  loading: 'Preparing your safe space...',
  reminderDue: 'Reminder due now',
  reminderAfter: 'Reminder in',
  day: 'day',
  days: 'days',
  allDay: 'Every day',
  everyTwoDays: 'Every 2 days',
  everyThreeDays: 'Every 3 days',
  everyFiveDays: 'Every 5 days',
  everyTenDays: 'Every 10 days',
  everyFifteenDays: 'Every 15 days',
  everyMonth: 'Every month',
  everyTwoMonths: 'Every 2 months',
  everyThreeMonths: 'Every 3 months',
  everySixMonths: 'Every 6 months',
} as const;

type TranslationKey = keyof typeof ar;

const intervalKeys: Record<string, TranslationKey> = {
  day: 'allDay',
  '2days': 'everyTwoDays',
  '3days': 'everyThreeDays',
  '5days': 'everyFiveDays',
  '10days': 'everyTenDays',
  '15days': 'everyFifteenDays',
  month: 'everyMonth',
  '2months': 'everyTwoMonths',
  '3months': 'everyThreeMonths',
  '6months': 'everySixMonths',
};

type LanguageContextValue = {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  intervalLabel: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved === 'ar' || saved === 'en') setLanguageState(saved);
    });
  }, []);

  async function setLanguage(next: Language) {
    setLanguageState(next);
    await AsyncStorage.setItem(LANGUAGE_KEY, next);
  }

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = language === 'ar' ? ar : en;
    return {
      language,
      isRTL: language === 'ar',
      setLanguage,
      t: (key) => dictionary[key],
      intervalLabel: (key) => dictionary[intervalKeys[key] ?? 'everyMonth'],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}