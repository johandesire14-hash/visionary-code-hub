import React from "react";
import { Button } from "@/components/ui/button";
import { AfhubLogo } from "./AfhubLogo";

interface HeaderProps {
  onOpenMarketplace: () => void;
  onOpenDocs: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMarketplace, onOpenDocs, onOpenLogin }) => (
  <header className="w-full border-b border-store-border bg-store-background">
    <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-5 sm:px-8">
      <a href="#home" aria-label="afhub Accueil"><AfhubLogo size="md" textColor="text-store-foreground" /></a>
      <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-4">
        <Button variant="storefrontLink" onClick={onOpenMarketplace} className="px-2 text-xs sm:text-sm">Explorer</Button>
        <Button variant="storefrontLink" onClick={onOpenDocs} className="hidden sm:inline-flex">Documentation</Button>
        <Button variant="storefrontLink" onClick={onOpenLogin} className="px-2 text-xs sm:text-sm">Connexion</Button>
      </nav>
    </div>
  </header>
);
