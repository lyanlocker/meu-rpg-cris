import React, { useState } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import { LoadoutCatalogButton } from "@/components/EquipmentCatalogDialogs";
import type { LoadoutCatalogEntry } from "@/data/equipmentCatalog";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category?: string;
  spaces?: string;
  source?: string;
  itemType?: string;
  catalogId?: string;
}

interface InventorySectionProps {
  inventory: InventoryItem[];
  onChange: (inventory: InventoryItem[]) => void;
}

export function InventorySection({ inventory, onChange }: InventorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const emptyDraft = { name: "", description: "", quantity: 1, category: "", spaces: "", itemType: "" };
  const [newItem, setNewItem] = useState(emptyDraft);

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name) return;
    onChange([...inventory, { id: nanoid(), ...newItem, name, source: "Personalizado" }]);
    setNewItem(emptyDraft);
    setIsOpen(false);
  };

  const handleCatalogAdd = (entry: LoadoutCatalogEntry) => {
    const existing = inventory.find((item) => item.catalogId === entry.id);
    if (existing) {
      onChange(inventory.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item));
      return;
    }
    onChange([
      ...inventory,
      {
        id: nanoid(),
        name: entry.name,
        description: entry.summary,
        quantity: 1,
        category: entry.category,
        spaces: entry.spaces,
        source: entry.source,
        itemType: entry.kind,
        catalogId: entry.id,
      },
    ]);
  };

  const handleRemove = (id: string) => onChange(inventory.filter((item) => item.id !== id));

  const handleQtyChange = (id: string, quantity: number) => {
    onChange(inventory.map((item) => item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-primary/20 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MOD-06 // Logística de missão</p>
          <h2 className="section-title mt-1 flex items-center gap-2"><Boxes className="h-5 w-5" /> Carga operacional</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <LoadoutCatalogButton onSelect={handleCatalogAdd} />
          <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="border-primary/40 bg-background/45 font-mono text-xs uppercase text-primary hover:bg-primary hover:text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Registrar manualmente
          </Button>
        </div>
      </div>

      <ResponsiveFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        kicker="Manifesto de bordo"
        title="Nova carga"
        description="Use o catálogo para itens das fontes ou este formulário para equipamentos próprios da campanha."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-primary/30 text-muted-foreground">Cancelar</Button>
            <Button onClick={handleAdd} disabled={!newItem.name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/85 glow-box">Registrar carga</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <div className="space-y-1.5">
              <label className="section-kicker">Identificação do item</label>
              <Input value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} className="border-primary/35 bg-background/65 font-bold text-primary" placeholder="Ex: Kit médico, ferramenta, amostra..." autoFocus onKeyDown={(event) => event.key === "Enter" && handleAdd()} />
            </div>
            <div className="space-y-1.5">
              <label className="section-kicker">Qtd.</label>
              <Input type="number" min="1" value={newItem.quantity} onChange={(event) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(event.target.value) || 1) })} className="border-primary/35 bg-background/65 text-center" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><label className="section-kicker">Tipo</label><Input value={newItem.itemType} onChange={(event) => setNewItem({ ...newItem, itemType: event.target.value })} className="border-primary/35 bg-background/65" placeholder="Item operacional" /></div>
            <div className="space-y-1.5"><label className="section-kicker">Categoria</label><Input value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} className="border-primary/35 bg-background/65 font-mono" placeholder="I" /></div>
            <div className="space-y-1.5"><label className="section-kicker">Espaços</label><Input value={newItem.spaces} onChange={(event) => setNewItem({ ...newItem, spaces: event.target.value })} className="border-primary/35 bg-background/65 font-mono" placeholder="1" /></div>
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Descrição e restrições</label>
            <Textarea value={newItem.description} onChange={(event) => setNewItem({ ...newItem, description: event.target.value })} className="min-h-[180px] resize-y border-primary/35 bg-background/65" placeholder="Detalhes, origem, condição e observações..." />
          </div>
        </div>
      </ResponsiveFormDialog>

      {inventory.length === 0 ? (
        <div className="border border-dashed border-primary/18 bg-background/20 py-10 text-center font-mono text-sm uppercase tracking-wider text-muted-foreground">
          Compartimento operacional vazio
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {inventory.map((item, index) => (
            <article key={item.id} className="module-card group flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/40">CRG-{String(index + 1).padStart(2, "0")}</p>
                <div className="mb-2 mt-1 flex items-center gap-2">
                  <span className="truncate text-base font-bold text-primary">{item.name}</span>
                  <span className="data-chip shrink-0">x{item.quantity}</span>
                </div>
                {(item.itemType || item.category || item.spaces || item.source) && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {item.itemType && <span className="data-chip">{item.itemType}</span>}
                    {item.category && <span className="data-chip">Cat. {item.category}</span>}
                    {item.spaces && <span className="data-chip">{item.spaces} esp.</span>}
                    {item.source && <span className="data-chip">{item.source}</span>}
                  </div>
                )}
                {item.description && <p className="whitespace-pre-wrap border-t border-primary/10 pt-2 text-xs leading-relaxed text-foreground/65">{item.description}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => handleQtyChange(item.id, item.quantity + 1)} className="h-8 w-8 border border-primary/25 text-xs font-bold text-primary transition-colors hover:bg-primary/15">+</button>
                <button type="button" onClick={() => handleQtyChange(item.id, item.quantity - 1)} className="h-8 w-8 border border-primary/25 text-xs font-bold text-primary transition-colors hover:bg-primary/15">−</button>
                <button type="button" onClick={() => handleRemove(item.id)} className="grid h-8 w-8 place-items-center text-muted-foreground opacity-45 transition-colors hover:text-destructive group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
