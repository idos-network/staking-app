"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { createContext, useContext, useId } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const AmountFieldContext = createContext<{
  fieldId: string;
} | null>(null);

function AmountField({
  id,
  className,
  size = "default",
  ...props
}: NumberFieldPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg";
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values
    <AmountFieldContext.Provider value={{ fieldId }}>
      <NumberFieldPrimitive.Root
        className={cn("flex w-full flex-col items-start gap-2", className)}
        data-size={size}
        data-slot="amount-field"
        id={fieldId}
        {...props}
      />
    </AmountFieldContext.Provider>
  );
}

function AmountFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      className={cn(
        "relative flex w-full items-center justify-between rounded-2xl border border-input bg-background bg-clip-padding text-sm shadow-xs ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[15px] not-data-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-within:border-ring focus-within:ring-[3px] has-aria-invalid:border-destructive/36 focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/48 data-disabled:pointer-events-none data-disabled:opacity-64 dark:bg-input/32 dark:not-in-data-[slot=group]:bg-clip-border dark:not-data-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)] dark:has-aria-invalid:ring-destructive/24 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [[data-disabled],:focus-within,[aria-invalid]]:shadow-none",
        className,
      )}
      data-slot="amount-field-group"
      {...props}
    />
  );
}

function AmountFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      className={cn(
        "w-full min-w-0 flex-1 bg-transparent px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] tabular-nums outline-none in-data-[size=lg]:py-[calc(--spacing(2)-1px)] in-data-[size=sm]:px-[calc(--spacing(2.5)-1px)] in-data-[size=sm]:py-[calc(--spacing(1)-1px)]",
        className,
      )}
      data-slot="amount-field-input"
      {...props}
    />
  );
}

function AmountFieldScrubArea({
  className,
  label,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props & {
  label: string;
}) {
  const context = useContext(AmountFieldContext);

  if (!context) {
    throw new Error(
      "AmountFieldScrubArea must be used within a AmountField component for accessibility.",
    );
  }

  return (
    <NumberFieldPrimitive.ScrubArea
      className={cn("flex cursor-ew-resize", className)}
      data-slot="amount-field-scrub-area"
      {...props}
    >
      <Label className="cursor-ew-resize" htmlFor={context.fieldId}>
        {label}
      </Label>
      <NumberFieldPrimitive.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
        <CursorGrowIcon />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  );
}

function CursorGrowIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="black"
      height="14"
      stroke="white"
      viewBox="0 0 24 14"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Cursor grow icon</title>
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

export {
  AmountField,
  AmountFieldScrubArea,
  AmountFieldGroup,
  AmountFieldInput,
};
