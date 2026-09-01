import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { ReminderAccount } from '@/context/ReminderContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepareNotifications() {
  if (Platform.OS === 'web') return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('password-reminders', {
      name: 'تذكيرات أمان الحسابات',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3D7BFF',
    });
  }
  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted && permissions.canAskAgain) {
    await Notifications.requestPermissionsAsync();
  }
}

export async function cancelReminder(notificationId?: string | null) {
  if (Platform.OS === 'web') return;
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

export async function scheduleReminder(account: ReminderAccount) {
  if (Platform.OS === 'web') return null;
  await cancelReminder(account.notificationId);
  const language = await AsyncStorage.getItem('@password-reminder/language');
  const english = language === 'en';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: english ? 'Time to protect your account' : 'حان وقت حماية حسابك',
      body: english
        ? 'To protect your ' + account.serviceName + ' account, please change your password now!'
        : 'لحماية حسابك ' + account.serviceName + '، يرجى التوجه لتغيير كلمة المرور الآن!',
      sound: 'default',
      data: { accountId: account.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(account.nextReminderAt),
      ...(Platform.OS === 'android' ? { channelId: 'password-reminders' } : {}),
    },
  });
  return id;
}
