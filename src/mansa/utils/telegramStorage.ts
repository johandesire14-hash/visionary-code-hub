// @ts-nocheck
export interface TelegramChannelItem {
  id: string;
  name: string;
  type: "channel" | "group";
  memberCount: number;
  isIncluded: boolean;
  linkedDate: string;
  botStatus: "admin" | "member" | "pending";
}

const STORAGE_KEY = "mansa_telegram_channels";
const LEGACY_STORAGE_KEY = "whop_telegram_channels";

export const DEFAULT_TELEGRAM_CHANNELS: TelegramChannelItem[] = [];

export function getStoredTelegramChannels(): TelegramChannelItem[] {
  if (typeof window === "undefined") return DEFAULT_TELEGRAM_CHANNELS;
  let saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      localStorage.setItem(STORAGE_KEY, saved);
    }
  }
  if (!saved) return DEFAULT_TELEGRAM_CHANNELS;
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seen = new Set<string>();
      const deduped: TelegramChannelItem[] = [];
      for (const item of parsed) {
        const key = item.id || item.name;
        if (key && !seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      }
      return deduped;
    }
  } catch (e) {
    console.warn("Failed to parse stored telegram channels", e);
  }
  return DEFAULT_TELEGRAM_CHANNELS;
}

export function saveStoredTelegramChannels(channels: TelegramChannelItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
}

export function addStoredTelegramChannel(channel: TelegramChannelItem): TelegramChannelItem[] {
  const current = getStoredTelegramChannels();
  const filtered = current.filter((c) => c.id !== channel.id && c.name !== channel.name);
  const updated = [channel, ...filtered];
  saveStoredTelegramChannels(updated);
  return updated;
}
