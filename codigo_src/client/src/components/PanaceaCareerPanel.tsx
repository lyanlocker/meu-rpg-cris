import React, { useState } from "react";
import { BookMarked, BriefcaseBusiness, ExternalLink, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PanaceaPathSection } from "@/components/PanaceaPathSection";
import { getPanaceaOrigin, getPanaceaTrail } from "@/data/panacea-content";

interface PanaceaCareerPanelProps {
  originId?: string | null;
  trailId?: string | null;
  characterClass?: string | null;
  nex: number;
  onOriginChange: (originId: string) => void;
  onTrailChange: (trailId: string) => void;
}

export function PanaceaCareerPanel({
  originId,
  trailId,
  characterClass,
  nex,
  onOriginChange,
  onTrailChange,
}: PanaceaCareerPanelProps) {
  const [open, setOpen] = useState(false);
  const origin = getPanaceaOrigin(originId);
  const trail = getPanaceaTrail(trailId);

  return (
    <>
      <section className="tech-border hud-panel p-5">
        <div className="flex items-start justify-between gap-3 border-b border-primary/20 pb-3">
          <div>
            <p className="section-kicker">ARQ-PAN // Carreira corporativa</p>
            <h2 className="mt-1 flex items-center gap-2 font-mono font-bold uppercase tracking-[0.1em] text-primary">
              <BookMarked className="h-4 w-4" /> Origem e trilha
            </h2>
          </div>
          <span className="data-chip">NEX {nex}%</span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="module-card flex items-center gap-3 p-3">
            <BriefcaseBusiness className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="section-kicker">Origem Panacea</p>
              <p className={`truncate text-sm font-semibold ${origin ? "text-foreground" : "text-muted-foreground"}`}>
                {origin?.name ?? "Não selecionada"}
              </p>
            </div>
          </div>

          <div className="module-card flex items-center gap-3 p-3">
            <Route className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="section-kicker">Trilha Panacea</p>
              <p className={`truncate text-sm font-semibold ${trail ? "text-foreground" : "text-muted-foreground"}`}>
                {trail?.name ?? "Não selecionada"}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-none border-primary/40 bg-background/45 font-mono text-xs uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Abrir arquivo de carreira
        </Button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-none border-primary/50 bg-background/95 p-0 shadow-2xl shadow-primary/20 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]">
          <DialogHeader className="shrink-0 border-b border-primary/25 bg-gradient-to-r from-primary/10 to-transparent px-5 py-4 pr-14 text-left">
            <p className="section-kicker">Panacea Industries // Registro profissional</p>
            <DialogTitle className="flex items-center gap-2 font-mono text-lg font-bold uppercase tracking-wider text-primary">
              <BookMarked className="h-5 w-5" /> Arquivo de origem e trilha
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Selecione o histórico do operador e consulte as habilidades liberadas pela trilha conforme o NEX atual.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
            <PanaceaPathSection
              originId={originId}
              trailId={trailId}
              characterClass={characterClass}
              nex={nex}
              onOriginChange={onOriginChange}
              onTrailChange={onTrailChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
