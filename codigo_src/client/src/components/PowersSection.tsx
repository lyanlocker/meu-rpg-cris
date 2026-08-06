import React, { useState } from "react";
import { Cpu, LockKeyhole, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import {
  AbilityCatalog,
  type CharacterPower,
} from "@/components/AbilityCatalog";

interface PowersSectionProps {
  powers: CharacterPower[];
  onChange: (powers: CharacterPower[]) => void;
  type?: "normal" | "mask";
}

export function PowersSection({ powers, onChange, type = "normal" }: PowersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPower, setNewPower] = useState({ name: "", description: "" });
  const isMaskPowers = type === "mask";
  const canEdit = typeof window === "undefined"
    || new URLSearchParams(window.location.search).get("mode") !== "player";
  const customPowers = powers.filter((power) => power.source !== "panacea-nex15");

  const handleAdd = () => {
    const name = newPower.name.trim();
    if (!canEdit || !name) return;

    onChange([
      ...powers,
      {
        id: nanoid(),
        ...newPower,
        name,
        source: "custom",
      },
    ]);
    setNewPower({ name: "", description: "" });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    if (!canEdit) return;
    onChange(powers.filter((power) => power.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-primary/20 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MOD-03 // Capacidades especiais</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            {isMaskPowers
              ? <Sparkles className="h-5 w-5 text-red-300" />
              : <Cpu className="h-5 w-5" />}
            {isMaskPowers ? "Protocolos de ruptura" : "Habilidades e protocolos"}
          </h2>
        </div>
        {canEdit ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="border-primary/40 bg-background/45 font-mono text-xs uppercase text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Registrar personalizado
          </Button>
        ) : (
          <span className="data-chip"><LockKeyhole className="h-3.5 w-3.5" /> Somente leitura</span>
        )}
      </div>

      {!isMaskPowers && (
        <div className={canEdit ? "" : "[&_button]:hidden"} aria-readonly={!canEdit}>
          <AbilityCatalog powers={powers} onChange={canEdit ? onChange : () => undefined} />
        </div>
      )}

      <section className={`space-y-3 ${isMaskPowers ? "" : "border-t border-primary/15 pt-5"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">
              {isMaskPowers ? "REGISTROS DE RUPTURA" : "REGISTROS LIVRES"}
            </p>
            <h3 className="mt-1 font-mono text-sm font-bold uppercase tracking-wider text-primary">
              {isMaskPowers ? "Capacidades da Máscara" : "Habilidades personalizadas"}
            </h3>
          </div>
          <span className="data-chip">{customPowers.length}</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {customPowers.map((power, index) => (
            <article key={power.id} className="module-card group min-h-[132px] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">
                    CAP-{String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 break-words text-lg font-bold text-primary">{power.name}</h3>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemove(power.id)}
                    className="grid h-10 w-10 shrink-0 place-items-center border border-destructive/20 text-muted-foreground opacity-45 transition-colors hover:border-destructive/55 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Remover protocolo"
                    aria-label={`Remover habilidade ${power.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/72">
                {power.description}
              </p>
            </article>
          ))}

          {customPowers.length === 0 && (
            <div className="col-span-full border border-dashed border-primary/18 bg-background/20 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Nenhuma habilidade personalizada registrada
            </div>
          )}
        </div>
      </section>

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Entrada de sistema"
        title={isMaskPowers ? "Novo protocolo de ruptura" : "Nova habilidade personalizada"}
        description="Somente o mestre pode registrar capacidades que não fazem parte automaticamente da classe, origem, trilha ou catálogo Panacea."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newPower.name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box"
            >
              Registrar protocolo
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="section-kicker">Identificação do protocolo</label>
            <Input
              value={newPower.name}
              onChange={(event) => setNewPower({ ...newPower, name: event.target.value })}
              className="border-primary/35 bg-background/65 font-bold text-primary focus-visible:ring-primary"
              placeholder="Ex: Reflexos Defensivos"
              autoFocus
              onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="space-y-2">
            <label className="section-kicker">Descrição técnica</label>
            <Textarea
              value={newPower.description}
              onChange={(event) => setNewPower({ ...newPower, description: event.target.value })}
              className="min-h-[180px] resize-y border-primary/35 bg-background/65 focus-visible:ring-primary"
              placeholder="Efeito, custo em PD, acionamento e limitações..."
            />
          </div>
        </div>
      </ResponsiveFormDialog>
    </div>
  );
}
