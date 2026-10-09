import React from "react";
import { Button } from "@/components/ui/button";
import { AfhubLogo } from "./AfhubLogo";

interface FooterProps {
  onOpenStudio?: () => void;
  onOpenAiBuilder?: () => void;
  lang: "fr" | "en";
}

export const Footer: React.FC<FooterProps> = ({ onOpenStudio, onOpenAiBuilder }) => (
  <footer className="w-full border-t border-store-border bg-store-background text-store-foreground">
    <div className="mx-auto flex max-w-[1120px] flex-col items-center px-5 py-20 text-center sm:py-28">
      <h2 className="text-4xl font-bold sm:text-6xl">Misez sur vous-même.</h2>
      <Button variant="storefront" size="lg" onClick={onOpenStudio || onOpenAiBuilder} className="mt-8 h-12 min-w-[210px] rounded-lg">Créer ma boutique</Button>
    </div>
    <div className="border-t border-store-border">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-5 px-5 py-6 sm:px-8">
        <AfhubLogo size="sm" textColor="text-store-foreground" />
        <nav aria-label="Liens de pied de page" className="flex gap-5 text-xs text-store-muted">
          <a href="#marketplace" className="hover:text-store-foreground">Marketplace</a>
          <a href="https://docs.mansa.app" target="_blank" rel="noreferrer" className="hover:text-store-foreground">Documentation</a>
          <a href="#faq" className="hover:text-store-foreground">FAQ</a>
        </nav>
        <span className="text-xs text-store-muted">© 2026 afhub</span>
      </div>
    </div>
  </footer>
);
