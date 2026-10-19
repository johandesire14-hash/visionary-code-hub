const productIds = new Set([
  "prod-forex-elite",
  "prod-ecommerce-mastery",
  "prod-canva-templates",
  "prod-nocode-ia",
  "prod-growth-ebook",
]);
const transactionIds = new Set([
  ...Array.from({ length: 24 }, (_, index) => `tx-demo-${index + 1}`),
  "tx-aff-1",
  "tx-aff-2",
  "tx-other-1",
]);
const customerIds = new Set(Array.from({ length: 24 }, (_, index) => `cust-demo-${index + 1}`));
const workforceIds = new Set(Array.from({ length: 4 }, (_, index) => `worker-demo-${index + 1}`));
const partnerIds = new Set(Array.from({ length: 4 }, (_, index) => `deal-demo-${index + 1}`));
const companyIds = new Set(["comp-cadre-financier", "comp-mansa-ventures", "comp-studio-dakar"]);
const subscriptionIds = new Set([
  "sub-money-life",
  "sub-cadre-financier",
  "sub-gs-trading",
  "sub-bs-syndicate",
  "sub-profitic",
  "sub-victory-odds",
  "sub-alpha-bets",
  "sub-devkreativ",
  "sub-ecommerce-mastery",
  "sub-fce-africa",
  "sub-diaspora-invest",
]);
const subscriptionCompanyIds = new Set([
  "comp-money-life",
  "comp-cadre-financier",
  "comp-gs-trading",
  "comp-bs-syndicate",
  "comp-profitic",
  "comp-victory-odds",
  "comp-alpha-bets",
  "comp-devkreativ",
  "comp-ecommerce-mastery",
  "comp-fce-africa",
  "comp-diaspora-invest",
]);
const purchaseIds = new Set(["purch-music", "purch-1", "purch-2", "purch-3", "purch-4", "purch-5"]);
const telegramChannelIds = new Set(["tg-1", "tg-2", "tg-3"]);
const telegramChannelNames = new Set([
  "VICTORY ODDS 🤑🔥",
  "VIP TRADING AFRIQUE 📈",
  "BETSPORT EXCLUSIF",
]);
const withdrawalIds = new Set(["wdr-demo-01", "wdr-demo-02"]);

function getStringField(item: unknown, field: string): string | undefined {
  if (!item || typeof item !== "object") return undefined;
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}

function removeMatchingArrayItems(key: string, isDemoItem: (item: unknown) => boolean): number {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    const filtered = parsed.filter((item) => !isDemoItem(item));
    const removed = parsed.length - filtered.length;
    if (removed > 0) window.localStorage.setItem(key, JSON.stringify(filtered));
    return removed;
  } catch {
    return 0;
  }
}

function getMatchingKeys(prefixes: string[]): string[] {
  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) keys.push(key);
  }
  return keys;
}

/** Removes only known demo fixtures and seed markers, preserving unrelated browser data. */
export function purgeLegacyDemoDataFromLocalStorage(): number {
  if (typeof window === "undefined") return 0;

  try {
    let removedCount = 0;
    const cacheRules: Array<[string[], (item: unknown) => boolean]> = [
      [
        ["mansa_saved_products_cache", "afhub_saved_products_cache"],
        (item) => productIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_saved_transactions_cache", "afhub_saved_transactions_cache"],
        (item) => transactionIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_saved_customers_cache", "afhub_saved_customers_cache"],
        (item) => customerIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_saved_workforce_cache", "afhub_saved_workforce_cache"],
        (item) => workforceIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_saved_partners_cache", "afhub_saved_partners_cache"],
        (item) => partnerIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_customer_purchases", "whop_customer_purchases"],
        (item) => purchaseIds.has(getStringField(item, "id") || ""),
      ],
      [
        ["mansa_telegram_channels", "whop_telegram_channels"],
        (item) =>
          telegramChannelIds.has(getStringField(item, "id") || "") ||
          telegramChannelNames.has(getStringField(item, "name") || ""),
      ],
    ];

    for (const [keys, isDemoItem] of cacheRules) {
      for (const key of keys) removedCount += removeMatchingArrayItems(key, isDemoItem);
    }

    for (const key of getMatchingKeys(["mansa_companies_", "afhub_companies_"])) {
      removedCount += removeMatchingArrayItems(key, (item) =>
        companyIds.has(getStringField(item, "id") || ""),
      );
    }
    for (const key of getMatchingKeys([
      "mansa_enterprise_subscriptions_",
      "afhub_enterprise_subscriptions_",
    ])) {
      removedCount += removeMatchingArrayItems(
        key,
        (item) =>
          subscriptionIds.has(getStringField(item, "id") || "") ||
          subscriptionCompanyIds.has(getStringField(item, "companyId") || ""),
      );
    }
    for (const key of getMatchingKeys(["mansa_withdrawals_", "afhub_withdrawals_"])) {
      removedCount += removeMatchingArrayItems(key, (item) =>
        withdrawalIds.has(getStringField(item, "id") || ""),
      );
    }

    for (const key of getMatchingKeys(["mansa_auto_seeded_", "mansa_subscriptions_seeded_"])) {
      window.localStorage.removeItem(key);
      removedCount += 1;
    }

    return removedCount;
  } catch {
    return 0;
  }
}
