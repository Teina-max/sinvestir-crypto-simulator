"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { Coin } from "@/lib/market-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CoinComboboxProps {
  coins: Coin[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

/** Sélecteur de cryptomonnaie avec recherche (nom ou ticker). */
export function CoinCombobox({ coins, value, onChange, loading }: CoinComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = coins.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Cryptomonnaie"
          disabled={loading || coins.length === 0}
          className="h-auto w-full justify-between border-0 bg-transparent p-0 font-light hover:bg-transparent dark:hover:bg-transparent"
        >
          {selected ? (
            <span className="flex items-center gap-2.5 truncate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.image} alt="" className="size-6 rounded-full" />
              <span className="truncate text-2xl font-light text-white">
                {selected.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {selected.symbol}
              </span>
            </span>
          ) : (
            <span className="text-2xl font-light text-muted-foreground/60">
              {loading ? "Chargement…" : "Choisir…"}
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <div className="flex items-center border-b px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Rechercher (Bitcoin, ETH…)"
              className="border-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>Aucune cryptomonnaie trouvée.</CommandEmpty>
            <CommandGroup>
              {coins.map((coin) => (
                <CommandItem
                  key={coin.id}
                  value={`${coin.name} ${coin.symbol}`}
                  onSelect={() => {
                    onChange(coin.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coin.image} alt="" className="size-5 rounded-full" />
                  <span className="truncate">{coin.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {coin.symbol}
                  </span>
                  <Check
                    className={cn(
                      "size-4",
                      coin.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
