import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../mansa/services/firebase", () => ({
  db: null,
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock("../mansa/utils/rightsAccessEngine", () => ({
  getMemberAuthorizedTelegramChannels: vi.fn(() => []),
  getMemberAuthorizedDiscordChannels: vi.fn(() => []),
  getMemberAuthorizedEbooks: vi.fn(() => []),
  getMemberAuthorizedCourses: vi.fn(() => []),
  getMemberAuthorizedOffers: vi.fn(() => []),
}));

import { getSavedCompanies } from "../mansa/utils/companyStorage";
import { getWithdrawalHistory } from "../mansa/utils/creatorFinancialEngine";
import { purgeLegacyDemoDataFromLocalStorage } from "../mansa/utils/legacyDemoDataCleanup";
import { getSavedSubscriptions } from "../mansa/utils/subscriptionsStorage";
import { getStoredTelegramChannels } from "../mansa/utils/telegramStorage";

describe("demo data defaults", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not create demo companies in an empty workspace", () => {
    expect(getSavedCompanies("fresh-user")).toEqual([]);
    expect(localStorage.getItem("mansa_companies_fresh-user")).toBeNull();
  });

  it("does not seed subscriptions, withdrawals, or Telegram channels on first read", () => {
    expect(getSavedSubscriptions("fresh-user")).toEqual([]);
    expect(getWithdrawalHistory("fresh-user")).toEqual([]);
    expect(getStoredTelegramChannels()).toEqual([]);
    expect(localStorage.getItem("mansa_enterprise_subscriptions_fresh-user")).toBeNull();
    expect(localStorage.getItem("mansa_withdrawals_fresh-user")).toBeNull();
  });

  it("removes known local demo fixtures but preserves unrelated user data", () => {
    localStorage.setItem(
      "mansa_saved_products_cache",
      JSON.stringify([{ id: "prod-forex-elite" }, { id: "real-product" }]),
    );
    localStorage.setItem(
      "mansa_saved_transactions_cache",
      JSON.stringify([{ id: "tx-demo-1" }, { id: "real-transaction" }]),
    );
    localStorage.setItem(
      "mansa_companies_alice",
      JSON.stringify([{ id: "comp-cadre-financier" }, { id: "alice-company" }]),
    );
    localStorage.setItem(
      "mansa_enterprise_subscriptions_alice",
      JSON.stringify([{ id: "sub-money-life", companyId: "comp-money-life" }, { id: "alice-sub" }]),
    );
    localStorage.setItem(
      "mansa_customer_purchases",
      JSON.stringify([{ id: "purch-1" }, { id: "real-order" }]),
    );
    localStorage.setItem(
      "mansa_telegram_channels",
      JSON.stringify([{ id: "tg-1" }, { id: "real-channel" }]),
    );
    localStorage.setItem(
      "mansa_withdrawals_alice",
      JSON.stringify([{ id: "wdr-demo-01" }, { id: "real-withdrawal" }]),
    );
    localStorage.setItem("mansa_auto_seeded_alice", "true");
    localStorage.setItem("mansa_subscriptions_seeded_alice", "true");

    expect(purgeLegacyDemoDataFromLocalStorage()).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem("mansa_saved_products_cache") || "[]")).toEqual([
      { id: "real-product" },
    ]);
    expect(JSON.parse(localStorage.getItem("mansa_saved_transactions_cache") || "[]")).toEqual([
      { id: "real-transaction" },
    ]);
    expect(JSON.parse(localStorage.getItem("mansa_companies_alice") || "[]")).toEqual([
      { id: "alice-company" },
    ]);
    expect(
      JSON.parse(localStorage.getItem("mansa_enterprise_subscriptions_alice") || "[]"),
    ).toEqual([{ id: "alice-sub" }]);
    expect(JSON.parse(localStorage.getItem("mansa_customer_purchases") || "[]")).toEqual([
      { id: "real-order" },
    ]);
    expect(JSON.parse(localStorage.getItem("mansa_telegram_channels") || "[]")).toEqual([
      { id: "real-channel" },
    ]);
    expect(JSON.parse(localStorage.getItem("mansa_withdrawals_alice") || "[]")).toEqual([
      { id: "real-withdrawal" },
    ]);
    expect(localStorage.getItem("mansa_auto_seeded_alice")).toBeNull();
    expect(localStorage.getItem("mansa_subscriptions_seeded_alice")).toBeNull();
  });
});
