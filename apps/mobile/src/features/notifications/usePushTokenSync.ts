import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getPushTokenIfPermitted } from '@/lib/push';
import { notificationsApi } from './api';

/**
 * Re-registers the device's push token whenever the app opens with an
 * already-granted OS permission (never prompts — that only happens once, in
 * onboarding), and routes to the notifications screen when a push is tapped.
 */
export function usePushTokenSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    void (async () => {
      const token = await getPushTokenIfPermitted();
      if (!token || !mounted) return;
      try {
        await notificationsApi.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
      } catch {
        // best-effort — in-app notifications still work without push.
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notificacoes');
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [enabled]);
}
