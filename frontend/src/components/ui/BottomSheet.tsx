import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const BottomSheet = DialogPrimitive.Root;
export const BottomSheetTrigger = DialogPrimitive.Trigger;
export const BottomSheetClose = DialogPrimitive.Close;

export interface BottomSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

export const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
    <DialogPrimitive.Content
      ref={ref}
      className={twMerge(
        clsx(
          'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-border-strong bg-surface p-6 shadow-2xl text-left',
          'data-[state=open]:animate-slideUp focus:outline-none pb-safe',
          className
        )
      )}
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      {...props}
    >
      {/* Visual drag handle */}
      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border-strong shrink-0" />

      {children}

      {showCloseButton && (
        <DialogPrimitive.Close className="absolute right-5 top-5 p-2 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-elevated transition focus:outline-none">
          <X className="w-5 h-5" />
          <span className="sr-only">Close sheet</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BottomSheetContent.displayName = 'BottomSheetContent';

export const BottomSheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={twMerge(clsx('flex flex-col space-y-1.5 pb-4 text-left border-b border-border-subtle mb-4', className))}
    {...props}
  />
);

export const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={twMerge(clsx('text-xl font-bold tracking-tight text-content-primary', className))}
    {...props}
  />
));
BottomSheetTitle.displayName = 'BottomSheetTitle';
