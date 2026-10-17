import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, LifeBuoy, Loader2, Send } from "lucide-react";
import { addDoc, collection, db, getDocs, query, where } from "../../services/firebase";

interface Props { userId: string; }
interface Request { id: string; type: string; subject: string; description: string; status: string; createdAt: string; }

export const ResolutionCenterPanel: React.FC<Props> = ({ userId }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [type, setType] = useState("payment_issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = JSON.parse(localStorage.getItem(`mansa_resolution_${userId}`) || "[]");
        if (active) setRequests(saved);
        if (db) {
          const snap = await getDocs(query(collection(db, "resolutionRequests"), where("userId", "==", userId)));
          const remote: Request[] = [];
          snap.forEach((item) => remote.push({ id: item.id, ...(item.data() as any) }));
          if (active && remote.length) setRequests(remote.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }
      } catch (error) {
        console.warn("Resolution requests could not be loaded", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    if (!subject.trim() || !description.trim()) return setFeedback("Le sujet et la description sont obligatoires.");
    setIsSubmitting(true);
    const item: Request = { id: `resolution-${Date.now()}`, userId, type, subject: subject.trim(), description: description.trim(), status: "open", createdAt: new Date().toISOString() } as Request;
    try {
      let persisted = item;
      if (db) {
        const ref = await addDoc(collection(db, "resolutionRequests"), { ...item });
        persisted = { ...item, id: ref.id };
        await addDoc(collection(db, "auditLogs"), { actorId: userId, action: "resolution_created", targetId: ref.id, createdAt: item.createdAt });
      }
      const next = [persisted, ...requests];
      setRequests(next);
      localStorage.setItem(`mansa_resolution_${userId}`, JSON.stringify(next));
      setSubject("");
      setDescription("");
      setFeedback("Votre demande a été enregistrée.");
    } catch (error: any) {
      setFeedback(error?.message || "Impossible d’enregistrer la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="space-y-4 text-xs">
    <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-5"><div className="flex items-start gap-3"><LifeBuoy className="mt-0.5 size-6 text-sky-400" /><div><h4 className="font-bold text-white">Centre de résolution</h4><p className="mt-1 text-[11px] text-zinc-400">Signalez un problème de paiement, d’accès, de livraison ou demandez l’examen d’un remboursement.</p></div></div></div>
    <form onSubmit={submit} className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 space-y-3"><h4 className="font-semibold text-white">Ouvrir une demande</h4><select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#101114] p-2.5 text-white"><option value="payment_issue">Problème de paiement</option><option value="access_issue">Accès non reçu</option><option value="refund_request">Demande de remboursement</option><option value="creator_issue">Problème avec un créateur</option><option value="other">Autre</option></select><input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de la demande" className="w-full rounded-lg border border-white/10 bg-[#101114] p-2.5 text-white outline-none focus:border-sky-400" /><textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Expliquez le problème et indiquez la transaction concernée si nécessaire" rows={4} className="w-full resize-none rounded-lg border border-white/10 bg-[#101114] p-2.5 text-white outline-none focus:border-sky-400" />{feedback && <p className="text-[11px] text-emerald-300">{feedback}</p>}<button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 font-semibold text-black disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{isSubmitting ? "Envoi..." : "Envoyer la demande"}</button></form>
    <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4"><h4 className="font-semibold text-white">Mes demandes</h4>{isLoading ? <div className="mt-3 flex items-center gap-2 text-zinc-400"><Loader2 className="size-4 animate-spin" /> Chargement...</div> : requests.length === 0 ? <p className="mt-3 text-[11px] text-zinc-500">Aucune demande ouverte.</p> : <div className="mt-3 space-y-2">{requests.map((request) => <div key={request.id} className="rounded-lg border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-2"><span className="font-semibold text-white">{request.subject}</span><span className="inline-flex items-center gap-1 text-[10px] text-amber-300">{request.status === "resolved" ? <CheckCircle2 className="size-3" /> : <Clock3 className="size-3" />}{request.status === "resolved" ? "Résolue" : "Ouverte"}</span></div><p className="mt-1 text-[11px] text-zinc-400">{request.description}</p></div>)}</div>}</div>
  </div>;
};
