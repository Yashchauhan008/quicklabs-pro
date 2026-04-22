import type { ReactNode } from 'react';
import { AlertTriangle, CircleHelp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  processingText?: string;
  variant?: 'default' | 'destructive';
  isProcessing?: boolean;
  icon?: ReactNode;
}

export const ConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  processingText = 'Please wait…',
  variant = 'default',
  isProcessing = false,
  icon,
}: ConfirmationModalProps) => {
  const resolvedIcon = icon ?? (
    variant === 'destructive' ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
        <CircleHelp className="h-3.5 w-3.5" />
      </span>
    )
  );

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isProcessing) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="shrink-0">{resolvedIcon}</span>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
            disabled={isProcessing}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isProcessing ? processingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};