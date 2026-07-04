/**
 * Best-effort Expo push delivery. Uses the raw HTTP push API (no server SDK
 * dependency needed) — a failure here must never fail the caller's request,
 * so every call site swallows errors after logging.
 */

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  for (const batch of chunk(messages, CHUNK_SIZE)) {
    try {
      await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch.map((m) => ({ ...m, sound: 'default' }))),
      });
    } catch {
      // Best-effort: push delivery failures never surface to the caller.
    }
  }
}
