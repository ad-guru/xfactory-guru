"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Modal({ open, onOpenChange, title, description, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(460px,calc(100vw-32px))] bg-surface text-ink border border-border rounded-md shadow-elev p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Dialog.Title className="text-[16px] leading-6 font-medium">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-[12px] text-ink-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="size-7 rounded-md flex items-center justify-center hover:bg-surface-muted cursor-pointer" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
