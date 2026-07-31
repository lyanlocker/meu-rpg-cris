import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
        title: "Ficha excluída",
        description: `${characterName} foi removido dos arquivos.`,
      });
      onDeleted?.();
    } catch (error) {
      toast({
        title: "Não foi possível excluir a ficha",
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
      <AlertDialogContent className="tech-border border-red-500 w-[calc(100%_-_2rem)] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500 flex items-center gap-2 uppercase font-mono">
            <AlertTriangle className="w-5 h-5" /> Excluir ficha
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground leading-relaxed">
            A ficha de <strong className="text-foreground">{characterName}</strong> será removida permanentemente. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending} className="border-primary text-primary">
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...
              </>
            ) : (
              "Excluir permanentemente"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
