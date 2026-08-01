import React, { useState } from "react";
import { Crosshair, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";

interface Attack {
  id: string;
  name: string;
  test: string;
  attackDice: string;
  damageDice: string;
  description: string;
}

interface AttacksSectionProps {
  attacks: Attack[];
  onChange: (attacks: Attack[]) => void;
  type?: "normal" | "mask";
}

export function AttacksSection({ attacks, onChange, type = "normal" }: AttacksSectionProps) {
  const isMaskAttacks = type === "mask";
  const [isOpen, setIsOpen] = useState(false);
  const [newAtk, setNewAtk] = useState({ name: "", test: "", attackDice: "", damageDice: "", description: "" });

  const handleAdd = () => {
    const name = newAtk.name.trim();
    if (!name) return;
    onChange([...attacks, { id: nanoid(), ...newAtk, name }]);
    setNewAtk({ name: "", test: "", attackDice: "", damageDice: "", description: "" });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(attacks.filter((attack) => attack.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-primary/20 pb-3">
        <div>
          <p className="section-kicker">MOD-04 // Combate e contenção</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            <Crosshair className={`w-5 h-5 ${isMaskAttacks ? "text-red-300" : ""}`} />
            {isMaskAttacks ? "Protocolos ofensivos de ruptura" : "Protocolos ofensivos"}
          </h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="border-primary/40 bg-background/45 text-primary hover:bg-primary hover:text-primary-foreground font-mono uppercase text-xs">
          <Plus className="w-4 h-4 mr-2" /> Registrar protocolo
        </Button>
      </div>

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Entrada de armamento"
        title={isMaskAttacks ? "Novo protocolo de ruptura" : "Novo protocolo ofensivo"}
        description="O formulário permanece centralizado. Em telas menores, role apenas o conteúdo da janela; os botões ficam sempre acessíveis."
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={!newAtk.name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">
              Registrar protocolo
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="section-kicker">Identificação</label>
            <Input
              value={newAtk.name}
              onChange={(event) => setNewAtk({ ...newAtk, name: event.target.value })}
              className="bg-background/65 border-primary/35 focus-visible:ring-primary text-primary font-bold"
              placeholder="Ex: Pistola 9mm, Investida cinética..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Teste operacional</label>
            <Input
              value={newAtk.test}
              onChange={(event) => setNewAtk({ ...newAtk, test: event.target.value })}
              className="bg-background/65 border-primary/35 focus-visible:ring-primary"
              placeholder="Ex: Luta, Pontaria, AGI..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="section-kicker">Dados de ataque</label>
              <Input
                value={newAtk.attackDice}
                onChange={(event) => setNewAtk({ ...newAtk, attackDice: event.target.value })}
                className="bg-background/65 border-primary/35 focus-visible:ring-primary font-mono"
                placeholder="Ex: 1d20+5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="section-kicker">Dados de dano</label>
              <Input
                value={newAtk.damageDice}
                onChange={(event) => setNewAtk({ ...newAtk, damageDice: event.target.value })}
                className="bg-background/65 border-primary/35 focus-visible:ring-primary font-mono"
                placeholder="Ex: 2d6+3"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Parâmetros adicionais</label>
            <Textarea
              value={newAtk.description}
              onChange={(event) => setNewAtk({ ...newAtk, description: event.target.value })}
              className="bg-background/65 border-primary/35 focus-visible:ring-primary min-h-[160px] resize-y"
              placeholder="Efeito, alcance, condições especiais..."
            />
          </div>
        </div>
      </ResponsiveFormDialog>

      {attacks.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-primary/18 bg-background/20 text-muted-foreground text-sm font-mono uppercase tracking-wider">
          Nenhum protocolo ofensivo registrado
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {attacks.map((attack, index) => (
            <article key={attack.id} className="module-card p-4 group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">OFS-{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="font-bold text-primary text-lg mt-1 break-words">{attack.name}</h3>
                </div>
                <button onClick={() => handleRemove(attack.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-40 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-wider mb-3">
                <div className="border border-primary/12 bg-background/35 px-2.5 py-2 text-muted-foreground">Teste <span className="block text-foreground mt-1 normal-case text-xs">{attack.test || "—"}</span></div>
                <div className="border border-amber-400/15 bg-amber-400/[0.025] px-2.5 py-2 text-muted-foreground">Ataque <span className="block text-amber-300 mt-1 normal-case text-xs font-bold">{attack.attackDice || "—"}</span></div>
                <div className="border border-red-400/15 bg-red-400/[0.025] px-2.5 py-2 text-muted-foreground">Dano <span className="block text-red-300 mt-1 normal-case text-xs font-bold">{attack.damageDice || "—"}</span></div>
              </div>
              {attack.description && <p className="text-sm text-foreground/65 whitespace-pre-wrap border-t border-primary/10 pt-3 leading-relaxed">{attack.description}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
