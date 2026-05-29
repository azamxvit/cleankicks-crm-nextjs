"use client";

import * as React from "react";

import { Input } from "@/components/shared/input";
import { applyPhoneInputChange } from "@/lib/crm/phone";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "inputMode" | "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function PhoneInput({
  value,
  onValueChange,
  className,
  placeholder,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(applyPhoneInputChange(e.target.value));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    onValueChange(applyPhoneInputChange(text));
  };

  return (
    <Input
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder={placeholder ?? "777-123-45-67"}
      className={cn(className)}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      maxLength={14}
      {...props}
    />
  );
}
