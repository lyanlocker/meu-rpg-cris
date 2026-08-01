import React, { useState } from "react";
import { AlertTriangle, DatabaseZap, Loader2 } from "lucide-react";
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
      <AlertDialogContent className="tech-border hud-panel border-red-500/65 w-[calc(100%_-_2rem)] sm:max-w-md bg-background/95">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-red-300/65 mb-1">
            <DatabaseZap className="w-3.5 h-3.5" /> Protocolo de remoção irreversível
          </div>
          <AlertDialogTitle className="text-red-400 flex items-center gap-2 uppercase font-mono tracking-wider">
            <AlertTriangle className="w-5 h-5" /> Expurgar dossiê
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground leading-relaxed border-l border-red-500/30 pl-3 mt-2">
            O registro operacional de <strong className="text-foreground">{characterName}</strong> será removido permanentemente da base da Panaceia Industries. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending} className="border-primary/40 text-primary bg-background/50">
            Manter dossiê
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700 font-mono uppercase tracking-wider"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Expurgando...
              </>
            ) : (
              "Confirmar expurgo"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
