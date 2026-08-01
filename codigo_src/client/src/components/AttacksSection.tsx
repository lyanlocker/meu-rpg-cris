import React, { useState, useRef, useEffect } from "react";
import { Crosshair, GripHorizontal, Plus, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const pw = panelRef.current.offsetWidth || 520;
      const ph = panelRef.current.offsetHeight || 420;
      setPos({ x: Math.max(12, (window.innerWidth - pw) / 2), y: Math.max(12, (window.innerHeight - ph) / 2) });
    }
  }, [isOpen]);

  const onMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: event.clientX, my: event.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      setPos({ x: dragStart.current.px + event.clientX - dragStart.current.mx, y: dragStart.current.py + event.clientY - dragStart.current.my });
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
    if (!newAtk.name) return;
    onChange([...attacks, { id: nanoid(), ...newAtk }]);
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

      {isOpen && (
        <div className="fixed inset-0 z-[90] pointer-events-none bg-black/20 backdrop-blur-[1px]">
          <div
            ref={panelRef}
            className="pointer-events-auto absolute w-[520px] max-w-[calc(100vw-1.5rem)] tech-border hud-panel bg-background/95 border-primary shadow-2xl shadow-primary/20"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "default" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/25 bg-gradient-to-r from-primary/10 to-transparent cursor-grab select-none" onMouseDown={onMouseDown}>
              <div>
                <p className="section-kicker">Entrada de armamento</p>
                <span className="text-primary font-mono uppercase text-sm font-bold flex items-center gap-2">
                  <GripHorizontal className="w-4 h-4 text-primary/55" />
                  {isMaskAttacks ? "Novo protocolo de ruptura" : "Novo protocolo ofensivo"}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="section-kicker">Identificação</label>
                <Input value={newAtk.name} onChange={(event) => setNewAtk({ ...newAtk, name: event.target.value })} className="bg-background/65 border-primary/35 focus-visible:ring-primary text-primary font-bold" placeholder="Ex: Pistola 9mm, Investida cinética..." autoFocus />
              </div>
              <div className="space-y-1">
                <label className="section-kicker">Teste operacional</label>
                <Input value={newAtk.test} onChange={(event) => setNewAtk({ ...newAtk, test: event.target.value })} className="bg-background/65 border-primary/35 focus-visible:ring-primary" placeholder="Ex: Luta, Pontaria, AGI..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="section-kicker">Dados de ataque</label>
                  <Input value={newAtk.attackDice} onChange={(event) => setNewAtk({ ...newAtk, attackDice: event.target.value })} className="bg-background/65 border-primary/35 focus-visible:ring-primary font-mono" placeholder="Ex: 1d20+5" />
                </div>
                <div className="space-y-1">
                  <label className="section-kicker">Dados de dano</label>
                  <Input value={newAtk.damageDice} onChange={(event) => setNewAtk({ ...newAtk, damageDice: event.target.value })} className="bg-background/65 border-primary/35 focus-visible:ring-primary font-mono" placeholder="Ex: 2d6+3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="section-kicker">Parâmetros adicionais</label>
                <Textarea value={newAtk.description} onChange={(event) => setNewAtk({ ...newAtk, description: event.target.value })} className="bg-background/65 border-primary/35 focus-visible:ring-primary min-h-[90px]" placeholder="Efeito, alcance, condições especiais..." />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">Cancelar</Button>
                <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">Registrar protocolo</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
