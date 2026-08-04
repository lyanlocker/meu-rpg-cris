import React from "react";
import {
  BadgeCheck,
  BookMarked,
  BriefcaseBusiness,
  CheckCircle2,
  FlaskConical,
  LockKeyhole,
  Route,
  ShieldCheck,
} from "lucide-react";
import {
  PANACEA_CLASS_LABELS,
  PANACEA_ORIGINS,
  getPanaceaOrigin,
  getPanaceaTrail,
  getPanaceaTrailsForClass,
  type PanaceaClass,
} from "@/data/panacea-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PanaceaPathSectionProps {
  originId?: string | null;
  trailId?: string | null;
  characterClass?: string | null;
  nex: number;
  onOriginChange: (originId: string) => void;
  onTrailChange: (trailId: string) => void;
}

const EMPTY_VALUE = "__none__";

function classIsValid(value?: string | null): value is PanaceaClass {
  return value === "combatente" || value === "especialista" || value === "ocultista";
}

export function PanaceaPathSection({
  originId,
  trailId,
  characterClass,
  nex,
  onOriginChange,
  onTrailChange,
}: PanaceaPathSectionProps) {
  const selectedOrigin = getPanaceaOrigin(originId);
  const storedTrail = getPanaceaTrail(trailId);
  const validClass = classIsValid(characterClass) ? characterClass : "combatente";
  const classTrails = getPanaceaTrailsForClass(validClass);
  const selectedTrail = storedTrail?.class === validClass ? storedTrail : undefined;
  const incompatibleTrail = Boolean(storedTrail && storedTrail.class !== validClass);
  const highestUnlocked = selectedTrail?.milestones
    .filter((milestone) => nex >= milestone.nex)
    .at(-1);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-primary/20 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">ARQ-PAN // Carreira corporativa</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            <BookMarked className="h-5 w-5" /> Origem e Trilha Panacea
          </h2>
        </div>
        <p className="max-w-sm font-mono text-[10px] uppercase tracking-wider text-muted-foreground/65 sm:text-right">
          Histórico profissional e especialização de campo
        </p>
      </div>

      <Tabs defaultValue="origin" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-none border border-primary/20 bg-background/40 p-1">
          <TabsTrigger
            value="origin"
            className="rounded-none py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <BriefcaseBusiness className="mr-2 h-4 w-4" /> Origem Panacea
          </TabsTrigger>
          <TabsTrigger
            value="trail"
            className="rounded-none py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <Route className="mr-2 h-4 w-4" /> Trilha Panacea
          </TabsTrigger>
        </TabsList>

        <TabsContent value="origin" className="mt-4 space-y-4">
          <div>
            <label className="section-kicker">Registro profissional anterior</label>
            <Select
              value={selectedOrigin?.id ?? EMPTY_VALUE}
              onValueChange={(value) => onOriginChange(value === EMPTY_VALUE ? "" : value)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-none border-primary/35 bg-background/55 font-mono text-sm focus:ring-primary">
                <SelectValue placeholder="Selecione uma origem" />
              </SelectTrigger>
              <SelectContent className="max-h-80 rounded-none border-primary/35 bg-popover/95">
                <SelectItem value={EMPTY_VALUE}>Nenhuma origem selecionada</SelectItem>
                {PANACEA_ORIGINS.map((origin) => (
                  <SelectItem key={origin.id} value={origin.id}>{origin.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrigin ? (
            <article className="module-card space-y-5 p-4 md:p-5">
              <div>
                <p className="section-kicker">Origem registrada</p>
                <h3 className="mt-1 text-xl font-bold text-primary">{selectedOrigin.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{selectedOrigin.description}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="border border-primary/15 bg-background/35 p-3">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-primary/70">
                    <BadgeCheck className="h-4 w-4" /> Perícias treinadas
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedOrigin.trainedSkills.map((skill) => (
                      <span key={skill} className="data-chip">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="border border-primary/15 bg-background/35 p-3">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-primary/70">
                    <ShieldCheck className="h-4 w-4" /> Afinidade recomendada
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedOrigin.affinity.map((affinity) => {
                      const matchesClass = affinity === validClass;
                      return (
                        <span
                          key={affinity}
                          className={`data-chip ${matchesClass ? "border-emerald-400/35 bg-emerald-400/5 text-emerald-300" : ""}`}
                        >
                          {PANACEA_CLASS_LABELS[affinity]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-primary bg-primary/[0.045] p-4">
                <p className="section-kicker">Habilidade de origem</p>
                <h4 className="mt-1 font-bold text-primary">{selectedOrigin.abilityName}</h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {selectedOrigin.abilityDescription}
                </p>
              </div>
            </article>
          ) : (
            <div className="border border-dashed border-primary/20 bg-background/20 px-5 py-10 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-primary/35" />
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Selecione a função exercida pelo operador antes das missões de campo.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trail" className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <label className="section-kicker">Especialização de campo</label>
              <Select
                value={selectedTrail?.id ?? EMPTY_VALUE}
                onValueChange={(value) => onTrailChange(value === EMPTY_VALUE ? "" : value)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-none border-primary/35 bg-background/55 font-mono text-sm focus:ring-primary">
                  <SelectValue placeholder="Selecione uma trilha" />
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-none border-primary/35 bg-popover/95">
                  <SelectItem value={EMPTY_VALUE}>Nenhuma trilha selecionada</SelectItem>
                  {classTrails.map((trail) => (
                    <SelectItem key={trail.id} value={trail.id}>{trail.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="data-chip h-11 justify-center px-4">
              <FlaskConical className="h-3.5 w-3.5" /> {PANACEA_CLASS_LABELS[validClass]}
            </div>
          </div>

          {incompatibleTrail && (
            <div className="border border-amber-400/30 bg-amber-400/5 p-3 font-mono text-[10px] uppercase tracking-wider text-amber-200">
              A trilha anteriormente registrada pertence a outra classe. Selecione uma trilha compatível com {PANACEA_CLASS_LABELS[validClass]}.
            </div>
          )}

          {selectedTrail ? (
            <article className="module-card p-4 md:p-5">
              <div className="border-b border-primary/15 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="section-kicker">Trilha de {PANACEA_CLASS_LABELS[selectedTrail.class]}</p>
                    <h3 className="mt-1 text-xl font-bold text-primary">{selectedTrail.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="data-chip">NEX {nex}%</span>
                    <span className="data-chip">4 marcos</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{selectedTrail.description}</p>
              </div>

              <Accordion
                type="single"
                collapsible
                defaultValue={highestUnlocked ? `nex-${highestUnlocked.nex}` : undefined}
                className="mt-2"
              >
                {selectedTrail.milestones.map((milestone) => {
                  const unlocked = nex >= milestone.nex;
                  return (
                    <AccordionItem
                      key={milestone.nex}
                      value={`nex-${milestone.nex}`}
                      className={`border-primary/15 ${unlocked ? "bg-primary/[0.025]" : "opacity-70"}`}
                    >
                      <AccordionTrigger className="gap-3 px-2 text-left hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className={`grid h-9 w-14 shrink-0 place-items-center border font-mono text-[10px] font-bold ${unlocked ? "border-emerald-400/35 bg-emerald-400/5 text-emerald-300" : "border-primary/20 bg-background/35 text-muted-foreground"}`}>
                            {milestone.nex}%
                          </span>
                          <div className="min-w-0">
                            <p className={`font-semibold ${unlocked ? "text-primary" : "text-foreground/65"}`}>
                              {milestone.name}
                            </p>
                            <span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                              {unlocked ? <CheckCircle2 className="h-3 w-3 text-emerald-300" /> : <LockKeyhole className="h-3 w-3" />}
                              {unlocked ? "Habilidade liberada" : `Bloqueada até NEX ${milestone.nex}%`}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-5">
                        <div className={`whitespace-pre-line border-l-2 p-4 text-sm leading-relaxed ${unlocked ? "border-emerald-400/45 bg-emerald-400/[0.025] text-foreground/85" : "border-primary/20 bg-background/25 text-foreground/65"}`}>
                          {milestone.description}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </article>
          ) : (
            <div className="border border-dashed border-primary/20 bg-background/20 px-5 py-10 text-center">
              <Route className="mx-auto h-8 w-8 text-primary/35" />
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Selecione uma das {classTrails.length} trilhas disponíveis para {PANACEA_CLASS_LABELS[validClass]}.
              </p>
            </div>
          )}

          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/55">
            Os custos originalmente escritos como PE foram adaptados para PD, seguindo a regra atual do CRIS.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
