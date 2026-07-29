"use client";

import { Input } from "@/components/ui/input";

interface SchoolSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SchoolSearchCombobox({
  value,
  onChange,
  disabled,
}: SchoolSearchComboboxProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Ketik nama sekolah, mis: SMAN 1 Jakarta"
      className="h-9 text-sm"
    />
  );
}
