import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResponsiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  maxWidthClassName?: string;
}

export function ResponsiveFormDialog({
  open,
  onOpenChange,
  kicker,
  title,
  description,
  children,
  footer,
  maxWidthClassName = "max-w-xl",
}: ResponsiveFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] ${maxWidthClassName} flex-col gap-0 overflow-hidden border-primary/60 bg-background/95 p-0 shadow-2xl shadow-primary/20 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-none`}
      >
        <DialogHeader className="shrink-0 border-b border-primary/25 bg-gradient-to-r from-primary/10 to-transparent px-4 py-4 pr-14 text-left sm:px-5">
          <p className="section-kicker">{kicker}</p>
          <DialogTitle className="text-primary font-mono uppercase text-base font-bold tracking-wider">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {children}
        </div>

        <div className="shrink-0 border-t border-primary/20 bg-background/95 p-3 sm:p-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
