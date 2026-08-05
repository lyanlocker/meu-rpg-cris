import React, { useState } from "react";
import { AlertTriangle, DatabaseZap, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteCharacter } from "@/hooks/use-characters";
import { useToast } from "@/hooks/use-toast";

interface DeleteCharacterDialogProps {
  characterId: string;
  characterName: string;
  trigger: React.ReactElement;
  onDeleted?: () => void;
}

export function DeleteCharacterDialog({
  characterId,
  characterName,
  trigger,
  onDeleted,
}: DeleteCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteCharacter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(characterId);
      setOpen(false);
      toast({
        title: "DOSSIÊ EXPURGADO",
        description: `${characterName} foi removido dos arquivos da Panaceia.`,
      });
      onDeleted?.();
    } catch (error) {
      toast({
        title: "Falha no expurgo",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteMutation.isPending) setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-none border border-red-500/65 bg-background/95 p-0 shadow-2xl shadow-red-950/40 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]">
        <AlertDialogHeader className="shrink-0 border-b border-red-500/25 bg-gradient-to-r from-red-950/45 to-transparent px-5 py-5 pr-12 text-left sm:px-6">
          <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-red-300/70">
            <DatabaseZap className="h-3.5 w-3.5" /> Protocolo de remoção irreversível
          </div>
          <AlertDialogTitle className="flex items-center gap-2 font-mono text-lg font-bold uppercase tracking-wider text-red-400 sm:text-xl">
            <AlertTriangle className="h-6 w-6 shrink-0" /> Excluir esta ficha?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 border-l-2 border-red-500/40 pl-4 text-sm leading-relaxed text-muted-foreground">
            A ficha de <strong className="text-foreground">{characterName}</strong>, seus retratos permanentes e todos os seus registros serão removidos definitivamente. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-emerald-400/25 bg-emerald-400/[0.035] p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
                <ShieldCheck className="h-5 w-5" /> Não excluir
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Fecha esta janela e mantém a ficha exatamente como está.
              </p>
            </div>
            <div className="border border-red-500/30 bg-red-500/[0.045] p-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-red-300">
                <Trash2 className="h-5 w-5" /> Excluir permanentemente
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Remove a ficha do Neon e não permite recuperá-la depois.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="grid shrink-0 grid-cols-1 gap-3 border-t border-red-500/20 bg-background/90 px-5 py-4 sm:grid-cols-2 sm:px-6">
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            autoFocus
            className="m-0 h-12 w-full rounded-none border-emerald-400/40 bg-background/70 font-mono font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
          >
            Não, manter ficha
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-12 w-full rounded-none bg-red-600 font-mono font-bold uppercase tracking-wider text-white hover:bg-red-500"
            aria-label={`Excluir permanentemente a ficha de ${characterName}`}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Sim, excluir ficha
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
