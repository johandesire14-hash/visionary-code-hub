import React from "react";
import { CreditCard, Lock, RotateCcw } from "lucide-react";

export type PaymentMethodCategory = "all" | "card" | "transfers" | "wallet" | "other";

export interface PaymentMethodTemplateItem {
  id: string;
  name: string;
  category: Exclude<PaymentMethodCategory, "all">;
  action: string;
  color: string;
  pending?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_PAYMENT_METHODS: PaymentMethodTemplateItem[] = [
  { id: "wave", name: "Wave", category: "wallet", action: "Configurer", color: "#1DC3FD" },
  {
    id: "orange",
    name: "Orange Money",
    category: "wallet",
    action: "Configurer",
    color: "#FF7900",
  },
  {
    id: "mtn",
    name: "MTN Mobile Money",
    category: "wallet",
    action: "Configurer",
    color: "#FFCC00",
  },
  { id: "moov", name: "Moov Money", category: "wallet", action: "Configurer", color: "#005BAA" },
  {
    id: "card",
    name: "Carte bancaire",
    category: "card",
    action: "Configurer",
    color: "#2563EB",
  },
  {
    id: "bank",
    name: "Virement bancaire",
    category: "transfers",
    action: "Vérifier l’identité",
    color: "#8B5CF6",
  },
];

interface PaymentMethodsTemplateProps {
  methods: PaymentMethodTemplateItem[];
  includeDefaultPaymentMethods: boolean;
  onToggleDefaultPaymentMethods: () => void;
  paymentCategory: PaymentMethodCategory;
  onPaymentCategoryChange: (category: PaymentMethodCategory) => void;
  onConfigure: (method: PaymentMethodTemplateItem) => void;
  onRestoreDefaults: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const categories: Array<[PaymentMethodCategory, string]> = [
  ["all", "Tout"],
  ["card", "Carte"],
  ["transfers", "Versements"],
  ["wallet", "Portefeuille"],
  ["other", "Autres"],
];

export const PaymentMethodsTemplate: React.FC<PaymentMethodsTemplateProps> = ({
  methods,
  includeDefaultPaymentMethods,
  onToggleDefaultPaymentMethods,
  paymentCategory,
  onPaymentCategoryChange,
  onConfigure,
  onRestoreDefaults,
  onCancel,
  onSave,
  isSaving = false,
}) => {
  const visibleMethods = methods.filter(
    (method) => paymentCategory === "all" || method.category === paymentCategory,
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CreditCard className="size-5 text-white" />
        <h3 className="text-2xl font-bold text-white">Méthodes de paiement</h3>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#292929] p-4 sm:p-5">
        <div>
          <p className="text-base font-semibold text-white">
            Inclure les méthodes de paiement par défaut
          </p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-400">
            Activer automatiquement les nouvelles méthodes de paiement dès qu'elles sont
            disponibles.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={includeDefaultPaymentMethods}
          onClick={onToggleDefaultPaymentMethods}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${includeDefaultPaymentMethods ? "bg-blue-600" : "bg-zinc-600"}`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-white transition-transform ${includeDefaultPaymentMethods ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      <div className="overflow-x-auto border-b border-white/10">
        <div className="flex min-w-max items-end gap-7">
          {categories.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onPaymentCategoryChange(id)}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${paymentCategory === id ? "border-blue-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#292929]">
        {visibleMethods.map((method, index) => (
          <div
            key={method.id}
            className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${index > 0 ? "border-t border-white/[0.08]" : ""}`}
          >
            <Lock className="size-5 shrink-0 text-zinc-600" />
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ backgroundColor: method.color }}
            >
              {method.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-base font-medium text-white">
              {method.name}
            </span>
            <button
              type="button"
              onClick={() => onConfigure(method)}
              className={`shrink-0 text-right text-sm font-semibold transition-colors ${method.pending ? "text-amber-300" : "text-white hover:text-[#00D26A]"}`}
            >
              {method.pending ? "Vérification en attente" : method.action}
            </button>
          </div>
        ))}
        {visibleMethods.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">
            Aucune méthode dans cette catégorie.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onRestoreDefaults}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <RotateCcw className="size-3.5" /> Restaurer les paramètres par défaut
        </button>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-[#292929] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#383838]"
            >
              Annuler
            </button>
          )}
          <button
            type={onSave ? "button" : "submit"}
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};
