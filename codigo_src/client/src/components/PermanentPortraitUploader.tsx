import React, { useEffect, useState } from "react";
import { Camera, ImageIcon, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCharacter } from "@/hooks/use-characters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@shared/routes";
import type { Character } from "@shared/schema";

type PortraitKind = "normal" | "mask";

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const TARGET_BYTES = 1_150_000;

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

async function loadImage(file: File): Promise<{
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  dispose: () => void;
}> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height),
      dispose: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Formato de imagem não reconhecido."));
    element.src = objectUrl;
  });

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    draw: (context, width, height) => context.drawImage(image, 0, 0, width, height),
    dispose: () => URL.revokeObjectURL(objectUrl),
  };
}

async function compressPortrait(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("A imagem original deve possuir no máximo 15 MB.");
  }

  const source = await loadImage(file);
  try {
    let maxDimension = 1400;
    let quality = 0.84;

    for (let attempt = 0; attempt < 7; attempt += 1) {
      const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
      const width = Math.max(1, Math.round(source.width * scale));
      const height = Math.max(1, Math.round(source.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("O navegador não conseguiu processar a imagem.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      source.draw(context, width, height);

      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= TARGET_BYTES) {
        return blobToDataUrl(blob);
      }

      maxDimension = Math.max(720, Math.round(maxDimension * 0.84));
      quality = Math.max(0.55, quality - 0.06);
    }

    throw new Error("A imagem continuou muito pesada mesmo após a compactação.");
  } finally {
    source.dispose();
  }
}

function PortraitPreview({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className="portrait-frame relative aspect-[3/4] overflow-hidden bg-background/55">
      {src && !failed ? (
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center px-6 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          <div>
            <ImageIcon className="mx-auto mb-3 h-8 w-8 text-primary/35" />
            {src ? "O link atual expirou ou não responde" : "Nenhum retrato registrado"}
          </div>
        </div>
      )}
    </div>
  );
}

export function PermanentPortraitUploader({ characterId }: { characterId: string }) {
  const { data: character } = useCharacter(characterId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busyKind, setBusyKind] = useState<PortraitKind | null>(null);

  if (!character) return null;

  const syncCharacter = (updated: Character) => {
    queryClient.setQueryData([api.characters.get.path, updated.id], updated);
    queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
  };

  const upload = async (kind: PortraitKind, file?: File) => {
    if (!file) return;
    setBusyKind(kind);
    try {
      const dataUrl = await compressPortrait(file);
      const response = await fetch(`/api/characters/${characterId}/image/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dataUrl }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Não foi possível salvar o retrato.");
      }

      syncCharacter(payload as Character);
      toast({
        title: "RETRATO ARQUIVADO",
        description: kind === "mask"
          ? "A imagem da Máscara agora está armazenada permanentemente no Neon."
          : "A imagem do operador agora está armazenada permanentemente no Neon.",
      });
    } catch (error) {
      toast({
        title: "FALHA NO ARQUIVAMENTO",
        description: error instanceof Error ? error.message : "Não foi possível processar a imagem.",
        variant: "destructive",
      });
    } finally {
      setBusyKind(null);
    }
  };

  const remove = async (kind: PortraitKind) => {
    setBusyKind(kind);
    try {
      const response = await fetch(`/api/characters/${characterId}/image/${kind}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Não foi possível remover o retrato.");
      }

      syncCharacter(payload as Character);
      toast({ title: "RETRATO REMOVIDO", description: "O arquivo visual foi apagado da ficha." });
    } catch (error) {
      toast({
        title: "FALHA NA REMOÇÃO",
        description: error instanceof Error ? error.message : "Não foi possível remover o retrato.",
        variant: "destructive",
      });
    } finally {
      setBusyKind(null);
    }
  };

  const cards: Array<{ kind: PortraitKind; title: string; code: string; src: string }> = [
    { kind: "normal", title: "Operador", code: "BIO-IMG // Estado basal", src: character.imageUrl },
    { kind: "mask", title: "Máscara", code: "RUP-IMG // Estado de ruptura", src: character.maskImageUrl },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-5 right-5 z-[70] border border-primary/55 bg-background/90 text-primary shadow-xl shadow-primary/20 backdrop-blur-md hover:bg-primary hover:text-primary-foreground">
          <Camera className="mr-2 h-4 w-4" /> Retratos
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl overflow-y-auto border-primary/55 bg-background/95 p-0 shadow-2xl shadow-primary/20 sm:max-h-[calc(100dvh-2rem)]">
        <DialogHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-5 py-5 pr-14 text-left">
          <p className="section-kicker">ARQ-VIS // Cofre de imagens</p>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-primary">
            <ShieldCheck className="h-5 w-5" /> Retratos permanentes
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm leading-relaxed">
            Arquivos enviados aqui são compactados no navegador e guardados no Neon. Eles não dependem de links temporários do Discord nem do disco do Render.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {cards.map(({ kind, title, code, src }) => {
            const busy = busyKind === kind;
            const inputId = `portrait-upload-${characterId}-${kind}`;
            return (
              <section key={kind} className="module-card space-y-4 p-4">
                <div>
                  <p className="section-kicker">{code}</p>
                  <h3 className="mt-1 font-mono text-lg font-bold uppercase tracking-wider text-primary">{title}</h3>
                </div>

                <PortraitPreview src={src} label={`Retrato ${title}`} />

                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={busyKind !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.currentTarget.value = "";
                    void upload(kind, file);
                  }}
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button asChild disabled={busyKind !== null} className="bg-primary text-primary-foreground hover:bg-primary/85">
                    <label htmlFor={inputId} className="cursor-pointer">
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {src ? "Substituir" : "Enviar imagem"}
                    </label>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!src || busyKind !== null}
                    onClick={() => void remove(kind)}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                  </Button>
                </div>
              </section>
            );
          })}
        </div>

        <div className="border-t border-primary/15 px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/65">
          PNG, JPG ou WebP // original de até 15 MB // compactação automática // endereço externo continua disponível na ficha
        </div>
      </DialogContent>
    </Dialog>
  );
}
