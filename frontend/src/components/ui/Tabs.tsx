import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={twMerge(
      clsx(
        'inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border-subtle max-w-full overflow-x-auto no-scrollbar',
        className
      )
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={twMerge(
      clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider min-h-[38px] transition-all duration-150 select-none',
        'text-content-secondary hover:text-content-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-[#FF6B00] data-[state=active]:text-[#0E1116] data-[state=active]:shadow-sm',
        className
      )
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={twMerge(
      clsx(
        'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]',
        className
      )
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
