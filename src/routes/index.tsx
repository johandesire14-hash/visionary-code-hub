import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { hasConfiguredSiteUrl, siteUrl } from "@/lib/site";

const MansaApp = lazy(() => import("@/mansa/MansaRoot"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thal — Digital Business & Community Platform for Africa" },
      {
        name: "description",
        content:
          "Plateforme tout-en-un pour les créateurs : cours, ebooks, adhésions VIP Telegram & Discord, paiements Mobile Money.",
      },
      { property: "og:title", content: "Thal — Digital Business & Community Platform for Africa" },
      {
        property: "og:description",
        content:
          "Plateforme tout-en-un pour les créateurs : cours, ebooks, adhésions VIP Telegram & Discord, paiements Mobile Money.",
      },
      { property: "og:type", content: "website" },
      ...(hasConfiguredSiteUrl() ? [{ property: "og:url", content: siteUrl("/") }] : []),
      ...(hasConfiguredSiteUrl() ? [{ property: "og:image", content: siteUrl("/social-share-placeholder.svg") }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(hasConfiguredSiteUrl() ? [{ name: "twitter:image", content: siteUrl("/social-share-placeholder.svg") }] : []),
    ],
    links: hasConfiguredSiteUrl() ? [{ rel: "canonical", href: siteUrl("/") }] : [],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-background" />;
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MansaApp />
    </Suspense>
  );
}
