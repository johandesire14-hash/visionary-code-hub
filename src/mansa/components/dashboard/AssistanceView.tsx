import React, { useEffect, useMemo, useState } from "react";
import { Bot, Building2, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Company } from "../../types";
import { getSavedCompanies, updateCompanyAutoReply } from "../../utils/companyStorage";

interface AssistanceViewProps {
  lang?: "fr" | "en";
  activeCompany?: Company | null;
  companies?: Company[];
  onNavigateToClients?: () => void;
}

const DEFAULT_MESSAGE = "Bonjour ! Merci d'avoir contacté notre équipe. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.";

export const AssistanceView: React.FC<AssistanceViewProps> = ({ lang = "fr", activeCompany, companies = [] }) => {
  const { user } = useAuth();
  const userKey = user?.email || "default";
  const availableCompanies = useMemo(() => {
    const stored = getSavedCompanies(userKey);
    return stored.length ? stored : companies;
  }, [userKey, companies]);
  const [companyId, setCompanyId] = useState(activeCompany?.id || availableCompanies[0]?.id || "");
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectedCompany = availableCompanies.find((company) => company.id === companyId) || activeCompany || null;

  useEffect(() => {
    const targetId = activeCompany?.id || availableCompanies[0]?.id || "";
    setCompanyId(targetId);
  }, [activeCompany?.id, availableCompanies]);

  useEffect(() => {
    if (!companyId) return;
    const current = getSavedCompanies(userKey).find((company) => company.id === companyId) || companies.find((company) => company.id === companyId);
    setEnabled(current?.supportAutoReplyEnabled ?? true);
    setMessage(current?.supportAutoReplyMessage || DEFAULT_MESSAGE);
    setFeedback(null);
  }, [companyId, userKey, companies]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyId || !message.trim()) {
      setFeedback("Sélectionnez une entreprise et renseignez un message.");
      return;
    }
    setIsSaving(true);
    try {
      updateCompanyAutoReply(userKey, companyId, { enabled, message: message.trim() });
      setFeedback("Message automatique enregistré.");
    } catch (error: any) {
      setFeedback(error?.message || "Impossible d’enregistrer le message.");
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="mx-auto max-w-3xl space-y-4 animate-in fade-in duration-200">
    <div className="rounded-2xl border border-white/10 bg-[#121316] p-5"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400"><Bot className="size-5" /></div><div><h1 className="text-xl font-black text-white">{lang === "fr" ? "Message automatique" : "Auto-reply message"}</h1><p className="mt-1 text-xs text-zinc-400">Configurez la réponse envoyée automatiquement lorsqu’un membre contacte votre assistance.</p></div></div></div>
    <form onSubmit={save} className="rounded-2xl border border-white/10 bg-[#121316] p-5 space-y-5">
      <div><label className="mb-2 block text-xs font-semibold text-zinc-300">Entreprise concernée</label><div className="relative"><Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" /><select value={companyId} onChange={(event) => setCompanyId(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-blue-400"><option value="">Sélectionner une entreprise</option>{availableCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></div></div>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"><div><span className="block text-sm font-semibold text-white">Activer le message automatique</span><span className="mt-1 block text-[11px] text-zinc-500">Les membres reçoivent ce message dès l’ouverture d’une demande.</span></div><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-5 accent-blue-500" /></label>
      <div><label className="mb-2 block text-xs font-semibold text-zinc-300">Message envoyé</label><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} maxLength={5000} placeholder={DEFAULT_MESSAGE} className="w-full resize-none rounded-xl border border-white/10 bg-[#101114] p-3 text-sm text-white outline-none focus:border-blue-400" /><div className="mt-1 text-right text-[10px] text-zinc-600">{message.length}/5000</div></div>
      {selectedCompany && <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-200"><MessageSquare className="mr-2 inline size-4" />Aperçu pour <strong>{selectedCompany.name}</strong> : {message || "Votre message apparaîtra ici."}</div>}
      {feedback && <div className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="size-4" />{feedback}</div>}
      <div className="flex justify-end"><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{isSaving && <Loader2 className="size-4 animate-spin" />}{isSaving ? "Enregistrement..." : "Enregistrer le message"}</button></div>
    </form>
  </div>;
};
