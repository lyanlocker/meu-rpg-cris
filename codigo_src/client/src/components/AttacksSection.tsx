import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Swords, GripHorizontal, X } from "lucide-react";
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
      setPos({ x: (window.innerWidth - pw) / 2, y: (window.innerHeight - ph) / 2 });
    }
  }, [isOpen]);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({ x: dragStart.current.px + e.clientX - dragStart.current.mx, y: dragStart.current.py + e.clientY - dragStart.current.my });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const handleAdd = () => {
    if (!newAtk.name) return;
    onChange([...attacks, { id: nanoid(), ...newAtk }]);
    setNewAtk({ name: "", test: "", attackDice: "", damageDice: "", description: "" });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(attacks.filter(a => a.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 flex-1 flex items-center gap-2">
          <Swords className="w-5 h-5" /> {isMaskAttacks ? "Ataques da Máscara" : "Ataques"}
        </h2>
        <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="ml-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      {/* Draggable floating panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            ref={panelRef}
            className="pointer-events-auto absolute w-[520px] max-w-[95vw] tech-border bg-background border-primary shadow-2xl shadow-primary/20"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "default" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/30 bg-primary/10 cursor-grab select-none" onMouseDown={onMouseDown}>
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-primary/50" />
                <span className="text-primary font-mono uppercase text-sm font-bold">{isMaskAttacks ? "Novo Ataque da Máscara" : "Novo Ataque"}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Nome do Ataque</label>
                <Input value={newAtk.name} onChange={e => setNewAtk({ ...newAtk, name: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary text-primary font-bold" placeholder="Ex: Soco, Pistola 9mm..." autoFocus />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Teste (Perícia/Atributo)</label>
                <Input value={newAtk.test} onChange={e => setNewAtk({ ...newAtk, test: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary" placeholder="Ex: Luta, Pontaria, AGI..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Dados de Ataque</label>
                  <Input value={newAtk.attackDice} onChange={e => setNewAtk({ ...newAtk, attackDice: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary font-mono" placeholder="Ex: 1d20+5" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Dados de Dano</label>
                  <Input value={newAtk.damageDice} onChange={e => setNewAtk({ ...newAtk, damageDice: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary font-mono" placeholder="Ex: 2d6+3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Descrição</label>
                <Textarea value={newAtk.description} onChange={e => setNewAtk({ ...newAtk, description: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary min-h-[80px]" placeholder="Efeito, alcance, condições especiais..." />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/50 text-muted-foreground">Cancelar</Button>
                <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/80 glow-box">Registrar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {attacks.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-border text-muted-foreground text-sm font-mono uppercase">
          Nenhum ataque registrado
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {attacks.map(atk => (
            <div key={atk.id} className="tech-border p-4 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-primary text-base">{atk.name}</h3>
                <button onClick={() => handleRemove(atk.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-mono mb-2">
                {atk.test && (
                  <span className="text-foreground/60">Teste: <span className="text-foreground/90">{atk.test}</span></span>
                )}
                {atk.attackDice && (
                  <span className="text-foreground/60">Ataque: <span className="text-yellow-400 font-bold">{atk.attackDice}</span></span>
                )}
                {atk.damageDice && (
                  <span className="text-foreground/60">Dano: <span className="text-red-400 font-bold">{atk.damageDice}</span></span>
                )}
              </div>
              {atk.description && (
                <p className="text-sm text-foreground/60 whitespace-pre-wrap border-t border-primary/10 pt-2 mt-2">{atk.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
