import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, X, GripHorizontal } from "lucide-react";
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

  // Draggable state
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
      setPos({ x: (vw - pw) / 2, y: (vh - ph) / 2 });
    }
  }, [isOpen]);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const handleAdd = () => {
    if (!newPower.name) return;
    onChange([...powers, { id: nanoid(), ...newPower }]);
    setNewPower({ name: "", description: "" });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(powers.filter(p => p.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 flex-1">
          {isMaskPowers ? "Poderes da Máscara" : "Habilidades e Poderes"}
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="ml-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      {/* Draggable floating panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            ref={panelRef}
            className="pointer-events-auto absolute w-[480px] max-w-[95vw] tech-border bg-background border-primary shadow-2xl shadow-primary/20"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "default" }}
          >
            {/* Drag handle header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-primary/30 bg-primary/10 cursor-grab select-none"
              onMouseDown={onMouseDown}
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-primary/50" />
                <span className="text-primary font-mono uppercase text-sm font-bold">
                  {isMaskPowers ? "Novo Poder da Máscara" : "Novo Poder"}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase">Nome do Poder</label>
                <Input
                  value={newPower.name}
                  onChange={e => setNewPower({ ...newPower, name: e.target.value })}
                  className="bg-black/50 border-primary/50 focus-visible:ring-primary text-primary font-bold"
                  placeholder="Ex: Reflexos Defensivos"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase">Descrição</label>
                <Textarea
                  value={newPower.description}
                  onChange={e => setNewPower({ ...newPower, description: e.target.value })}
                  className="bg-black/50 border-primary/50 focus-visible:ring-primary min-h-[100px]"
                  placeholder="Descreva o efeito do poder..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/50 text-muted-foreground">
                  Cancelar
                </Button>
                <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/80 glow-box">
                  Registrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {powers.map(power => (
          <div key={power.id} className="tech-border p-4 group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-primary">{power.name}</h3>
              <button
                onClick={() => handleRemove(power.id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{power.description}</p>
          </div>
        ))}
        {powers.length === 0 && (
          <div className="col-span-full py-8 text-center border border-dashed border-border text-muted-foreground text-sm font-mono uppercase">
            Nenhum poder registrado
          </div>
        )}
      </div>
    </div>
  );
}
