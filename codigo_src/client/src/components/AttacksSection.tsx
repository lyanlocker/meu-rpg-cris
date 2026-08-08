import React, { useState } from "react";
import { Crosshair, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import { RitualsSection, type CharacterRitual } from "@/components/RitualsSection";
import { WeaponCatalogButton } from "@/components/EquipmentCatalogDialogs";
import type { WeaponCatalogEntry } from "@/data/equipmentCatalog";
import { useCharacter, useUpdateCharacter } from "@/hooks/use-characters";

interface Attack {
  id: string;
  name: string;
  test: string;
  attackDice: string;
  damageDice: string;
  description: string;
  category?: string;
  spaces?: string;
  critical?: string;
  range?: string;
  damageType?: string;
  source?: string;
  catalogId?: string;
}

interface AttacksSectionProps {
  attacks: Attack[];
  onChange: (attacks: Attack[]) => void;
  type?: "normal" | "mask";
}

function AttackList({
  attacks,
  canEdit,
  onRemove,
}: {
  attacks: Attack[];
  canEdit: boolean;
  onRemove: (id: string) => void;
}) {
  if (attacks.length === 0) {
    return (
      <div className="border border-dashed border-primary/18 bg-background/20 py-10 text-center font-mono text-sm uppercase tracking-wider text-muted-foreground">
        Nenhum armamento ou ataque registrado
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {attacks.map((attack, index) => {
        const hasSourceStats = Boolean(attack.category || attack.spaces || attack.critical || attack.range || attack.damageType || attack.source);
        return (
          <article key={attack.id} className="module-card group p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">OFS-{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 break-words text-lg font-bold text-primary">{attack.name}</h3>
                {attack.source && <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">Fonte // {attack.source}</p>}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onRemove(attack.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center border border-destructive/20 text-muted-foreground opacity-50 transition-colors hover:border-destructive/55 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={`Remover ataque ${attack.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {hasSourceStats && (
              <div className="mb-3 grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase tracking-wider sm:grid-cols-6">
                {[
                  ["Categoria", attack.category || "—"],
                  ["Espaço", attack.spaces || "—"],
                  ["Dano", attack.damageDice || "—"],
                  ["Crítico", attack.critical || "—"],
                  ["Alcance", attack.range || "—"],
                  ["Tipo", attack.damageType || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="border border-primary/12 bg-background/35 px-2 py-2 text-muted-foreground">
                    {label}<span className="mt-1 block text-xs font-bold normal-case text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-3 grid grid-cols-1 gap-2 font-mono text-[10px] uppercase tracking-wider sm:grid-cols-3">
              <div className="border border-primary/12 bg-background/35 px-2.5 py-2 text-muted-foreground">Teste <span className="mt-1 block text-xs normal-case text-foreground">{attack.test || "—"}</span></div>
              <div className="border border-amber-400/15 bg-amber-400/[0.025] px-2.5 py-2 text-muted-foreground">Ataque <span className="mt-1 block text-xs font-bold normal-case text-amber-300">{attack.attackDice || "Definido pelo operador"}</span></div>
              <div className="border border-red-400/15 bg-red-400/[0.025] px-2.5 py-2 text-muted-foreground">Dano <span className="mt-1 block text-xs font-bold normal-case text-red-300">{attack.damageDice || "—"}</span></div>
            </div>
            {attack.description && <p className="whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/65">{attack.description}</p>}
          </article>
        );
      })}
    </div>
  );
}

export function AttacksSection({ attacks, onChange, type = "normal" }: AttacksSectionProps) {
  const { id } = useParams<{ id: string }>();
  const { data: character } = useCharacter(id || "");
  const updateMutation = useUpdateCharacter();
  const isMaskAttacks = type === "mask";
  const isPlayerMode = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("mode") === "player";
  const canEditWeapons = true;
  const canEditRituals = !isPlayerMode;
  const isOccultist = character?.characterClass === "ocultista";
  const rituals = ((character?.rituals as CharacterRitual[] | undefined) ?? []);

  const emptyDraft = { name: "", test: "", attackDice: "", damageDice: "", description: "", category: "", spaces: "", critical: "", range: "", damageType: "" };
  const [isOpen, setIsOpen] = useState(false);
  const [newAtk, setNewAtk] = useState(emptyDraft);

  const handleAdd = () => {
    const name = newAtk.name.trim();
    if (!canEditWeapons || !name) return;
    onChange([...attacks, { id: nanoid(), ...newAtk, name, source: "Personalizado" }]);
    setNewAtk(emptyDraft);
    setIsOpen(false);
  };

  const handleCatalogAdd = (entry: WeaponCatalogEntry) => {
    if (!canEditWeapons) return;
    const suggestedTest = entry.group.toLowerCase().includes("corpo a corpo") ? "Luta" : "Pontaria";
    onChange([
      ...attacks,
      {
        id: nanoid(),
        name: entry.name,
        test: suggestedTest,
        attackDice: "",
        damageDice: entry.damage,
        description: entry.summary,
        category: entry.category,
        spaces: entry.spaces,
        critical: entry.critical,
        range: entry.range,
        damageType: entry.damageType,
        source: entry.source,
        catalogId: entry.id,
      },
    ]);
  };

  const handleRemove = (attackId: string) => {
    if (!canEditWeapons) return;
    onChange(attacks.filter((attack) => attack.id !== attackId));
  };

  const updateRituals = (nextRituals: CharacterRitual[]) => {
    if (!canEditRituals || !character) return;
    updateMutation.mutate({
      id: character.id,
      updates: { rituals: nextRituals } as any,
    });
  };

  const attackControls = canEditWeapons ? (
    <div className="flex flex-col gap-2 sm:flex-row">
      <WeaponCatalogButton onSelect={handleCatalogAdd} />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-primary/40 bg-background/45 font-mono text-xs uppercase text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <Plus className="mr-2 h-4 w-4" /> Registrar manualmente
      </Button>
    </div>
  ) : (
    <span className="data-chip">Somente leitura</span>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-primary/20 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MOD-04 // {isOccultist ? "Conjuração e combate" : "Combate e contenção"}</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            {isOccultist
              ? <Sparkles className={`h-5 w-5 ${isMaskAttacks ? "text-red-300" : "text-violet-300"}`} />
              : <Crosshair className={`h-5 w-5 ${isMaskAttacks ? "text-red-300" : ""}`} />}
            {isOccultist
              ? isMaskAttacks ? "Protocolos ritualísticos de ruptura" : "Protocolos ritualísticos"
              : isMaskAttacks ? "Protocolos ofensivos de ruptura" : "Protocolos ofensivos"}
          </h2>
        </div>
        {!isOccultist && attackControls}
      </div>

      {isOccultist ? (
        <Tabs defaultValue="rituais" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-none border border-primary/20 bg-background/40 p-1">
            <TabsTrigger value="rituais" className="rounded-none py-3 font-mono text-[10px] uppercase tracking-[0.14em] data-[state=active]:bg-violet-400/10 data-[state=active]:text-violet-200">
              <Sparkles className="mr-2 h-4 w-4" /> Rituais
            </TabsTrigger>
            <TabsTrigger value="armas" className="rounded-none py-3 font-mono text-[10px] uppercase tracking-[0.14em] data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <Crosshair className="mr-2 h-4 w-4" /> Armas e ataques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rituais" className="mt-5">
            <RitualsSection rituals={rituals} onChange={updateRituals} canEdit={canEditRituals} nex={character?.nex ?? 5} />
          </TabsContent>

          <TabsContent value="armas" className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">ARMAMENTOS CONVENCIONAIS</p>
                <h3 className="mt-1 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-primary">
                  {isMaskAttacks ? <Sparkles className="h-4 w-4 text-red-300" /> : <Crosshair className="h-4 w-4" />} Armas e ataques conhecidos
                </h3>
              </div>
              {attackControls}
            </div>
            <AttackList attacks={attacks} canEdit={canEditWeapons} onRemove={handleRemove} />
          </TabsContent>
        </Tabs>
      ) : (
        <AttackList attacks={attacks} canEdit={canEditWeapons} onRemove={handleRemove} />
      )}

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Entrada de armamento"
        title={isMaskAttacks ? "Novo protocolo de ruptura" : "Nova arma ou ataque"}
        description="Use o catálogo para equipamentos das fontes ou este formulário para criações próprias."
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">Cancelar</Button>
            <Button onClick={handleAdd} disabled={!newAtk.name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">Registrar protocolo</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="section-kicker">Identificação</label>
            <Input value={newAtk.name} onChange={(event) => setNewAtk({ ...newAtk, name: event.target.value })} className="border-primary/35 bg-background/65 font-bold text-primary focus-visible:ring-primary" placeholder="Ex: Pistola 9mm, Investida cinética..." autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Teste operacional</label>
            <Input value={newAtk.test} onChange={(event) => setNewAtk({ ...newAtk, test: event.target.value })} className="border-primary/35 bg-background/65 focus-visible:ring-primary" placeholder="Ex: Luta ou Pontaria" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["Categoria", "category", "I"], ["Espaço", "spaces", "1"], ["Crítico", "critical", "19/x3"], ["Alcance", "range", "Médio"], ["Tipo", "damageType", "Balístico"],
            ].map(([label, field, placeholder]) => (
              <div key={field} className="space-y-1.5">
                <label className="section-kicker">{label}</label>
                <Input value={(newAtk as any)[field]} onChange={(event) => setNewAtk({ ...newAtk, [field]: event.target.value })} className="border-primary/35 bg-background/65 font-mono text-xs" placeholder={placeholder} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="section-kicker">Dados de ataque</label><Input value={newAtk.attackDice} onChange={(event) => setNewAtk({ ...newAtk, attackDice: event.target.value })} className="border-primary/35 bg-background/65 font-mono" placeholder="Ex: 1d20+5" /></div>
            <div className="space-y-1.5"><label className="section-kicker">Dados de dano</label><Input value={newAtk.damageDice} onChange={(event) => setNewAtk({ ...newAtk, damageDice: event.target.value })} className="border-primary/35 bg-background/65 font-mono" placeholder="Ex: 2d6+3" /></div>
          </div>
          <div className="space-y-1.5"><label className="section-kicker">Parâmetros adicionais</label><Textarea value={newAtk.description} onChange={(event) => setNewAtk({ ...newAtk, description: event.target.value })} className="min-h-[160px] resize-y border-primary/35 bg-background/65" placeholder="Efeito, condições especiais, modificações..." /></div>
        </div>
      </ResponsiveFormDialog>
    </div>
  );
}
