import React, { useState } from "react";
import { Cpu, Plus, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";

interface Power {
  id: string;
  name: string;
  description: string;
}

interface PowersSectionProps {
  powers: Power[];
  onChange: (powers: Power[]) => void;
  type?: "normal" | "mask";
}

export function PowersSection({ powers, onChange, type = "normal" }: PowersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPower, setNewPower] = useState({ name: "", description: "" });
  const isMaskPowers = type === "mask";

  const handleAdd = () => {
    const name = newPower.name.trim();
    if (!name) return;
    onChange([...powers, { id: nanoid(), ...newPower, name }]);
    setNewPower({ name: "", description: "" });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(powers.filter((power) => power.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-primary/20 pb-3">
        <div>
          <p className="section-kicker">MOD-03 // Capacidades especiais</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            {isMaskPowers ? <Sparkles className="w-5 h-5 text-red-300" /> : <Cpu className="w-5 h-5" />}
            {isMaskPowers ? "Protocolos de ruptura" : "Protocolos e capacidades"}
          </h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-primary/40 bg-background/45 text-primary hover:bg-primary hover:text-primary-foreground font-mono uppercase text-xs"
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar módulo
        </Button>
      </div>

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Entrada de sistema"
        title={isMaskPowers ? "Novo protocolo de ruptura" : "Nova capacidade"}
        description="Preencha os dados abaixo. A janela permanece centralizada e o conteúdo pode ser rolado sem sair da ficha."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={!newPower.name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">
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
              className="bg-background/65 border-primary/35 focus-visible:ring-primary text-primary font-bold"
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
              className="bg-background/65 border-primary/35 focus-visible:ring-primary min-h-[180px] resize-y"
              placeholder="Efeito, custo em PD, acionamento e limitações..."
            />
          </div>
        </div>
      </ResponsiveFormDialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {powers.map((power, index) => (
          <article key={power.id} className="module-card p-4 group min-h-[132px]">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">CAP-{String(index + 1).padStart(2, "0")}</p>
                <h3 className="font-bold text-lg text-primary mt-1 break-words">{power.name}</h3>
              </div>
              <button
                onClick={() => handleRemove(power.id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-40 group-hover:opacity-100 shrink-0"
                title="Remover protocolo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-foreground/72 whitespace-pre-wrap leading-relaxed border-t border-primary/10 pt-3">{power.description}</p>
          </article>
        ))}
        {powers.length === 0 && (
          <div className="col-span-full py-10 text-center border border-dashed border-primary/18 bg-background/20 text-muted-foreground text-sm font-mono uppercase tracking-wider">
            Nenhum protocolo especial registrado
          </div>
        )}
      </div>
    </div>
  );
}
