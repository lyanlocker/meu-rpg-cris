import React, { useState, useRef, useEffect } from "react";
import { Cpu, GripHorizontal, Plus, Sparkles, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = panelRef.current.offsetWidth || 480;
      const ph = panelRef.current.offsetHeight || 360;
      setPos({ x: Math.max(12, (vw - pw) / 2), y: Math.max(12, (vh - ph) / 2) });
    }
  }, [isOpen]);

  const onMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: event.clientX, my: event.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      const dx = event.clientX - dragStart.current.mx;
      const dy = event.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const handleAdd = () => {
    if (!newPower.name) return;
    onChange([...powers, { id: nanoid(), ...newPower }]);
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

      {isOpen && (
        <div className="fixed inset-0 z-[90] pointer-events-none bg-black/20 backdrop-blur-[1px]">
          <div
            ref={panelRef}
            className="pointer-events-auto absolute w-[480px] max-w-[calc(100vw-1.5rem)] tech-border hud-panel bg-background/95 border-primary shadow-2xl shadow-primary/20"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "default" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-primary/25 bg-gradient-to-r from-primary/10 to-transparent cursor-grab select-none"
              onMouseDown={onMouseDown}
            >
              <div>
                <p className="section-kicker">Entrada de sistema</p>
                <span className="text-primary font-mono uppercase text-sm font-bold flex items-center gap-2">
                  <GripHorizontal className="w-4 h-4 text-primary/55" />
                  {isMaskPowers ? "Novo protocolo de ruptura" : "Nova capacidade"}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
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
                  className="bg-background/65 border-primary/35 focus-visible:ring-primary min-h-[110px]"
                  placeholder="Efeito, custo em PD, acionamento e limitações..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">Cancelar</Button>
                <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">Registrar protocolo</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
