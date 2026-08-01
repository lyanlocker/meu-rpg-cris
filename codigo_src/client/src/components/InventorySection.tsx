import React, { useState } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";

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

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name) return;
    onChange([...inventory, { id: nanoid(), ...newItem, name }]);
    setNewItem({ name: "", description: "", quantity: 1 });
    setIsOpen(false);
  };

  const handleRemove = (id: string) => onChange(inventory.filter((item) => item.id !== id));

  const handleQtyChange = (id: string, quantity: number) => {
    onChange(inventory.map((item) => item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-primary/20 pb-3">
        <div>
          <p className="section-kicker">MOD-05 // Logística de missão</p>
          <h2 className="section-title mt-1 flex items-center gap-2"><Boxes className="w-5 h-5" /> Carga operacional</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="border-primary/40 bg-background/45 text-primary hover:bg-primary hover:text-primary-foreground font-mono uppercase text-xs">
          <Plus className="w-4 h-4 mr-2" /> Registrar carga
        </Button>
      </div>

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Manifesto de bordo"
        title="Nova carga"
        description="O formulário fica preso ao centro da tela, com rolagem interna e ações sempre visíveis."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={!newItem.name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">
              Registrar carga
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <div className="space-y-1.5">
              <label className="section-kicker">Identificação do item</label>
              <Input
                value={newItem.name}
                onChange={(event) => setNewItem({ ...newItem, name: event.target.value })}
                className="bg-background/65 border-primary/35 focus-visible:ring-primary text-primary font-bold"
                placeholder="Ex: Kit médico, arma, amostra..."
                autoFocus
                onKeyDown={(event) => event.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="section-kicker">Qtd.</label>
              <Input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(event) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(event.target.value) || 1) })}
                className="bg-background/65 border-primary/35 focus-visible:ring-primary text-center"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Descrição e restrições</label>
            <Textarea
              value={newItem.description}
              onChange={(event) => setNewItem({ ...newItem, description: event.target.value })}
              className="bg-background/65 border-primary/35 focus-visible:ring-primary min-h-[180px] resize-y"
              placeholder="Detalhes, origem, condição e observações..."
            />
          </div>
        </div>
      </ResponsiveFormDialog>

      {inventory.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-primary/18 bg-background/20 text-muted-foreground text-sm font-mono uppercase tracking-wider">
          Compartimento operacional vazio
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inventory.map((item, index) => (
            <article key={item.id} className="module-card p-4 group flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">CRG-{String(index + 1).padStart(2, "0")}</p>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span className="font-bold text-primary truncate text-base">{item.name}</span>
                  <span className="data-chip shrink-0">x{item.quantity}</span>
                </div>
                {item.description && <p className="text-xs text-foreground/65 whitespace-pre-wrap leading-relaxed border-t border-primary/10 pt-2">{item.description}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => handleQtyChange(item.id, item.quantity + 1)} className="w-7 h-7 border border-primary/25 text-primary hover:bg-primary/15 transition-colors text-xs font-bold">+</button>
                <button onClick={() => handleQtyChange(item.id, item.quantity - 1)} className="w-7 h-7 border border-primary/25 text-primary hover:bg-primary/15 transition-colors text-xs font-bold">−</button>
                <button onClick={() => handleRemove(item.id)} className="w-7 h-7 grid place-items-center text-muted-foreground hover:text-destructive transition-colors opacity-45 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
