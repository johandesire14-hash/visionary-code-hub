import React from "react";
import { Button } from "@/components/ui/button";
import storefront from "@/assets/afhub-storefront.png";

interface HeroSectionProps {
  onOpenStudio: (category?: string) => void;
  lang: "fr" | "en";
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenStudio }) => (
  <section className="afhub-home-hero flex flex-col items-center justify-center border-b border-store-border bg-store-background px-5 text-center text-store-foreground">
    <div className="mx-auto flex w-full max-w-[900px] flex-col items-center">
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">afhub. <span className="text-store-primary">Votre boutique.</span></h1>
      <img src={storefront} alt="Une boutique afhub, un portefeuille et un mégaphone" width={1536} height={1024} fetchPriority="high" className="my-2 w-full max-w-[570px] object-contain sm:my-0" />
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">Tout au même endroit.</h2>
      <Button variant="storefront" size="lg" onClick={() => onOpenStudio()} className="mt-7 h-12 min-w-[210px] rounded-lg">Créer ma boutique</Button>
    </div>
  </section>
);
