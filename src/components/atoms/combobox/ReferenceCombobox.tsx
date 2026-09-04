"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  /** Stable identifier, passed back on select so a dependent field can filter. */
  id: string;
  /** What gets stored: these fields hold a name, not a foreign key. */
  label: string;
  /** Optional second line, e.g. how many programmes a campus offers. */
  hint?: string;
}

interface ReferenceComboboxProps {
  value: string;
  onChange: (label: string, option?: ComboboxOption) => void;
  options: ComboboxOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  /** Shown when nothing matches and the typed text is still usable. */
  freeTextHint: string;
  emptyHint: string;
  onSearchChange: (search: string) => void;
}

/**
 * A picker that suggests without insisting.
 *
 * The target-campus fields were free text, so "UI", "Universitas Indonesia"
 * and "univ indonesia" were three different answers and nothing downstream
 * could group them. Suggestions come from the reference tables now.
 *
 * Selection is deliberately not mandatory. Those tables hold state
 * universities only, so forcing a choice would leave anyone aiming at a
 * private campus - or at a programme the dataset misses - unable to save a
 * profile at all. Whatever is typed can always be kept.
 */
export default function ReferenceCombobox({
  value,
  onChange,
  options,
  loading,
  disabled,
  placeholder,
  searchPlaceholder,
  freeTextHint,
  emptyHint,
  onSearchChange,
}: ReferenceComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => onSearchChange(search), 300);
    return () => clearTimeout(id);
  }, [search, onSearchChange]);

  const trimmed = search.trim();
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );

  const commit = (label: string, option?: ComboboxOption) => {
    onChange(label, option);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between font-normal"
        >
          <span className={value ? "truncate" : "truncate text-muted-foreground"}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        // w-(--var), bukan w-[--var]: bentuk kurung siku adalah sintaks
        // Tailwind v3, dan di v4 ia terkompilasi jadi
        // `width:--radix-popover-trigger-width` - tanpa var(), jadi nilainya
        // tidak sah dan popover-nya tidak pernah selebar pemicunya.
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Mencari...
              </div>
            ) : (
              <>
                {options.length === 0 && !trimmed && (
                  <CommandEmpty>{emptyHint}</CommandEmpty>
                )}

                {options.length > 0 && (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => commit(option.label, option)}
                      >
                        <Check
                          className={`mr-2 size-4 ${
                            value === option.label ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.hint && (
                            <span className="truncate text-xs text-muted-foreground">
                              {option.hint}
                            </span>
                          )}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* The escape hatch. Without it the PTN-only dataset would
                    block every private-campus target. */}
                {trimmed && !exactMatch && (
                  <CommandGroup heading={freeTextHint}>
                    <CommandItem
                      value={`__free__${trimmed}`}
                      onSelect={() => commit(trimmed)}
                    >
                      <PencilLine className="mr-2 size-4" />
                      Pakai &quot;{trimmed}&quot;
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
