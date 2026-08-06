import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import type { Character } from "@shared/schema";

export type ParanormalItemElement = "sangue" | "morte" | "conhecimento" | "energia" | "medo";

export interface ParanormalItem {
  id: string;
  name: string;
  element: ParanormalItemElement;
  description: string;
  imageUrl?: string;
}

interface ParanormalItemsSectionProps {
  characterId: string;
  enabled: boolean;
  items: ParanormalItem[];
  isPlayerMode: boolean;
  onToggle: (enabled: boolean) => void;
  onChange: (items: ParanormalItem[]) => void;
}

const ELEMENT_OPTIONS: Array<{ id: ParanormalItemElement; label: string }> = [
  { id: "sangue", label: "Sangue" },
  { id: "morte", label: "Morte" },
  { id: "conhecimento", label: "Conhecimento" },
  { id: "energia", label: "Energia" },
  { id: "medo", label: "Medo" },
];

const ELEMENT_TONES: Record<ParanormalItemElement, string> = {
  sangue: "border-red-400/35 bg-red-400/[0.055] text-red-300",
  morte: "border-emerald-400/35 bg-emerald-400/[0.055] text-emerald-300",
  conhecimento: "border-violet-400/35 bg-violet-400/[0.055] text-violet-300",
  energia: "border-fuchsia-400/35 bg-fuchsia-400/[0.055] text-fuchsia-300",
  medo: "border-slate-200/35 bg-slate-200/[0.055] text-slate-100",
};

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const TARGET_BYTES = 1_100_000;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Não foi possível compactar a imagem.")),
      "image/webp",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem compactada."));
    reader.readAsDataURL(blob);
  });
}

async function compressItemImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("A imagem original deve possuir no máximo 15 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Formato de imagem não reconhecido."));
      element.src = objectUrl;
    });

    let maxDimension = 1200;
    let quality = 0.84;
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("O navegador não conseguiu processar a imagem.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, width, height);

      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= TARGET_BYTES) return blobToDataUrl(blob);

      maxDimension = Math.max(640, Math.round(maxDimension * 0.84));
      quality = Math.max(0.55, quality - 0.06);
    }

    throw new Error("A imagem continuou muito pesada mesmo após a compactação.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function ItemImage({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-primary/20 bg-background/55">
      {src && !failed ? (
        <img
          src={src}
          alt={`Equipamento paranormal ${name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center px-5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/45">
          <div>
            <ImageIcon className="mx-auto mb-3 h-8 w-8 text-primary/30" />
            Imagem do equipamento não registrada
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
    </div>
  );
}

export function ParanormalItemsSection({
  characterId,
  enabled,
  items,
  isPlayerMode,
  onToggle,
  onChange,
}: ParanormalItemsSectionProps) {
  const isMaster = !isPlayerMode;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParanormalItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ParanormalItem | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<ParanormalItem, "id" | "imageUrl">>({
    name: "",
    element: "conhecimento",
    description: "",
  });

  if (!enabled && isPlayerMode) return null;

  const syncCharacter = (updated: Character) => {
    queryClient.setQueryData([api.characters.get.path, updated.id], updated);
    queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
  };

  const openCreate = () => {
    if (!isMaster) return;
    setEditingItem(null);
    setDraft({ name: "", element: "conhecimento", description: "" });
    setFormOpen(true);
  };

  const openEdit = (item: ParanormalItem) => {
    if (!isMaster) return;
    setEditingItem(item);
    setDraft({ name: item.name, element: item.element, description: item.description });
    setFormOpen(true);
  };

  const saveItem = () => {
    if (!isMaster || !draft.name.trim()) return;
    const normalized = { ...draft, name: draft.name.trim(), description: draft.description.trim() };
    if (editingItem) {
      onChange(items.map((item) => item.id === editingItem.id ? { ...item, ...normalized } : item));
    } else {
      onChange([...items, { id: nanoid(), ...normalized, imageUrl: "" }]);
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const uploadImage = async (item: ParanormalItem, file?: File) => {
    if (!isMaster || !file) return;
    setBusyItemId(item.id);
    try {
      const dataUrl = await compressItemImage(file);
      const response = await fetch(`/api/characters/${characterId}/paranormal-items/${item.id}/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CRIS-Mode": "master",
        },
        credentials: "include",
        body: JSON.stringify({ dataUrl }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível salvar a imagem do item.");

      syncCharacter(payload as Character);
      toast({
        title: "ITEM PARANORMAL ARQUIVADO",
        description: "A imagem foi compactada e armazenada permanentemente no Neon.",
      });
    } catch (error) {
      toast({
        title: "FALHA NO ARQUIVAMENTO",
        description: error instanceof Error ? error.message : "Não foi possível processar a imagem.",
        variant: "destructive",
      });
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async () => {
    if (!isMaster || !pendingDelete) return;
    const item = pendingDelete;
    setBusyItemId(item.id);
    try {
      const response = await fetch(`/api/characters/${characterId}/paranormal-items/${item.id}`, {
        method: "DELETE",
        headers: { "X-CRIS-Mode": "master" },
        credentials: "include",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível remover o item paranormal.");

      syncCharacter(payload as Character);
      setPendingDelete(null);
      toast({ title: "ITEM REMOVIDO", description: "O registro e sua imagem permanente foram apagados." });
    } catch (error) {
      toast({
        title: "FALHA NA REMOÇÃO",
        description: error instanceof Error ? error.message : "Não foi possível remover o item.",
        variant: "destructive",
      });
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-primary/20 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MOD-05 // Acervo paranormal autorizado</p>
          <h2 className="section-title mt-1 flex items-center gap-2">
            <PackageOpen className="h-5 w-5 text-violet-300" /> Itens paranormais
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Equipamentos anômalos liberados pelo controle de missão para este operador.
          </p>
        </div>

        {isMaster && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onToggle(!enabled)}
              className={enabled
                ? "min-h-10 border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
                : "min-h-10 border-emerald-400/40 text-emerald-200 hover:bg-emerald-400/10"}
            >
              {enabled ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {enabled ? "Ocultar do jogador" : "Ativar protocolo"}
            </Button>
            {enabled && (
              <Button type="button" size="sm" onClick={openCreate} className="min-h-10 bg-violet-500 text-white hover:bg-violet-400">
                <Plus className="mr-2 h-4 w-4" /> Adicionar item
              </Button>
            )}
          </div>
        )}
      </div>

      {!enabled ? (
        <div className="border border-dashed border-violet-400/25 bg-violet-400/[0.035] px-5 py-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-violet-300/55" />
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-violet-200">Protocolo desativado</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Enquanto estiver desativado, esta seção e todos os seus itens permanecem invisíveis no link do jogador. Os registros já cadastrados não são apagados.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-primary/20 bg-background/20 px-5 py-9 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Nenhum equipamento paranormal autorizado
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item, index) => {
            const busy = busyItemId === item.id;
            const inputId = `paranormal-item-image-${characterId}-${item.id}`;
            return (
              <article key={item.id} className="module-card group overflow-hidden border border-violet-400/20">
                <ItemImage src={item.imageUrl} name={item.name} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-violet-300/55">
                        ITP-{String(index + 1).padStart(2, "0")} // Equipamento autorizado
                      </p>
                      <h3 className="mt-1 break-words text-lg font-bold text-primary">{item.name}</h3>
                    </div>
                    <span className={`shrink-0 border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${ELEMENT_TONES[item.element]}`}>
                      {item.element}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
                    {item.description || "Nenhuma descrição operacional registrada."}
                  </p>

                  {isMaster && (
                    <div className="grid grid-cols-1 gap-2 border-t border-primary/10 pt-3 sm:grid-cols-3">
                      <input
                        id={inputId}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={busyItemId !== null}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.currentTarget.value = "";
                          void uploadImage(item, file);
                        }}
                      />
                      <Button asChild size="sm" variant="outline" disabled={busyItemId !== null} className="border-violet-400/35 text-violet-200">
                        <label htmlFor={inputId} className="cursor-pointer">
                          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {item.imageUrl ? "Trocar imagem" : "Imagem"}
                        </label>
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)} disabled={busyItemId !== null} className="border-primary/30 text-primary">
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setPendingDelete(item)} disabled={busyItemId !== null} className="border-destructive/35 text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Remover
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ResponsiveFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kicker="ITP-MESTRE // Registro paranormal"
        title={editingItem ? "Editar item paranormal" : "Novo item paranormal"}
        description="Somente o mestre pode alterar este acervo. A imagem poderá ser enviada após o registro do item."
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} className="border-primary/30 text-muted-foreground">Cancelar</Button>
            <Button onClick={saveItem} disabled={!draft.name.trim()} className="bg-violet-500 text-white hover:bg-violet-400">
              {editingItem ? "Salvar alterações" : "Registrar item"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="section-kicker">Nome do equipamento</label>
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="border-violet-400/35 bg-background/65 font-bold text-primary focus-visible:ring-violet-400"
              placeholder="Ex: Ampola de Sangue Reverberante"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="section-kicker">Elemento paranormal</label>
            <select
              value={draft.element}
              onChange={(event) => setDraft({ ...draft, element: event.target.value as ParanormalItemElement })}
              className="h-10 w-full border border-violet-400/35 bg-background/80 px-3 font-mono text-sm text-foreground outline-none focus:border-violet-300"
            >
              {ELEMENT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="section-kicker">Descrição, efeitos e restrições</label>
            <Textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              className="min-h-[220px] resize-y border-violet-400/35 bg-background/65 focus-visible:ring-violet-400"
              placeholder="Aparência, funcionamento, bônus, custo, maldição, condições de uso e demais observações..."
            />
          </div>
        </div>
      </ResponsiveFormDialog>

      <ResponsiveFormDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        kicker="ITP-MESTRE // Confirmação necessária"
        title="Remover item paranormal?"
        description="O registro e a imagem armazenada no Neon serão apagados. Esta ação não pode ser desfeita."
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)} className="min-h-11 border-emerald-400/45 text-emerald-200 hover:bg-emerald-400/10">
              Não, manter item
            </Button>
            <Button onClick={() => void removeItem()} disabled={busyItemId !== null} className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/85">
              {busyItemId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Sim, remover item
            </Button>
          </>
        }
      >
        {pendingDelete && (
          <div className="border border-destructive/25 bg-destructive/[0.055] p-4">
            <p className="section-kicker">ITEM SELECIONADO</p>
            <p className="mt-1 text-lg font-bold text-destructive">{pendingDelete.name}</p>
          </div>
        )}
      </ResponsiveFormDialog>
    </div>
  );
}
