import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Package, GripHorizontal, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

interface InventorySectionProps {
  inventory: InventoryItem[];
  onChange: (inventory: InventoryItem[]) => void;
}

export function InventorySection({ inventory, onChange }: InventorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", quantity: 1 });

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const pw = panelRef.current.offsetWidth || 480;
      const ph = panelRef.current.offsetHeight || 360;
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
    if (!newItem.name) return;
    onChange([...inventory, { id: nanoid(), ...newItem }]);
    setNewItem({ name: "", description: "", quantity: 1 });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(inventory.filter(i => i.id !== id));

  const handleQtyChange = (id: string, qty: number) => {
    onChange(inventory.map(i => i.id === id ? { ...i, quantity: Math.max(0, qty) } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 flex-1 flex items-center gap-2">
          <Package className="w-5 h-5" /> Inventário
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
            className="pointer-events-auto absolute w-[480px] max-w-[95vw] tech-border bg-background border-primary shadow-2xl shadow-primary/20"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "default" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/30 bg-primary/10 cursor-grab select-none" onMouseDown={onMouseDown}>
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-primary/50" />
                <span className="text-primary font-mono uppercase text-sm font-bold">Novo Item</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Nome do Item</label>
                  <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary text-primary font-bold" placeholder="Ex: Pistola, Kit Médico..." autoFocus onKeyDown={e => e.key === "Enter" && handleAdd()} />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Qtd.</label>
                  <Input type="number" min="0" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="bg-black/50 border-primary/50 focus-visible:ring-primary text-center" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Descrição</label>
                <Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="bg-black/50 border-primary/50 focus-visible:ring-primary min-h-[80px]" placeholder="Detalhes do item..." />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/50 text-muted-foreground">Cancelar</Button>
                <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/80 glow-box">Registrar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-border text-muted-foreground text-sm font-mono uppercase">
          Inventário vazio
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inventory.map(item => (
            <div key={item.id} className="tech-border p-3 group flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-primary truncate">{item.name}</span>
                  <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded shrink-0">x{item.quantity}</span>
                </div>
                {item.description && <p className="text-xs text-foreground/60 whitespace-pre-wrap">{item.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleQtyChange(item.id, item.quantity - 1)} className="w-6 h-6 rounded border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-xs font-bold">−</button>
                <button onClick={() => handleQtyChange(item.id, item.quantity + 1)} className="w-6 h-6 rounded border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-xs font-bold">+</button>
                <button onClick={() => handleRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
