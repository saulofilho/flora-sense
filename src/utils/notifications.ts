import { soundManager } from './audio';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  vibrate?: number[];
  plantId?: string;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações de desktop/mobile.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Erro ao pedir permissão de notificação:', err);
    return 'denied';
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export function triggerMobileVibration(pattern: number[] = [300, 100, 300, 100, 500]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error if restricted
    }
  }
}

export function dispatchPlantAlert(payload: PushNotificationPayload, sound: boolean = true) {
  // 1. Audio tone
  if (sound) {
    soundManager.playThirstAlert();
  }

  // 2. Mobile vibration
  triggerMobileVibration([300, 150, 300]);

  // 3. System notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '🌱',
        tag: payload.tag || payload.plantId || 'plant-alert',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Falha ao disparar Notification nativa:', err);
    }
  }
}
