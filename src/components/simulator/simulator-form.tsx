"use client";

import { Info } from "lucide-react";
import type { Coin } from "@/lib/market-data";
import { FREQUENCIES, type Frequency } from "@/lib/dca";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoinCombobox } from "./coin-combobox";

export interface FormState {
  coins: Coin[];
  coinsLoading: boolean;
  coinId: string;
  amount: number;
  frequency: Frequency;
  from: string;
  to: string;
}

interface SimulatorFormProps extends FormState {
  onCoinChange: (id: string) => void;
  onAmountChange: (n: number) => void;
  onFrequencyChange: (f: Frequency) => void;
  onFromChange: (d: string) => void;
  onToChange: (d: string) => void;
}

/** Un champ en style « underline » S'investir : label + ⓘ, valeur, unité à droite. */
function Field({
  label,
  info,
  unit,
  children,
}: {
  label: string;
  info?: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#7899ce]/25 pb-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{label}</span>
        {info && (
          <span title={info}>
            <Info className="size-3.5 opacity-50" aria-hidden />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        {unit && (
          <span className="shrink-0 pb-0.5 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

const bigInput =
  "w-full bg-transparent text-2xl font-light text-white outline-none placeholder:text-muted-foreground/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert";

export function SimulatorForm(props: SimulatorFormProps) {
  const isRecurring = props.frequency !== "once";

  return (
    <div className="space-y-7">
      <Field label="Cryptomonnaie" info="Choisissez parmi le top 100 par capitalisation.">
        <CoinCombobox
          coins={props.coins}
          value={props.coinId}
          onChange={props.onCoinChange}
          loading={props.coinsLoading}
        />
      </Field>

      <Field
        label={isRecurring ? "Montant par versement" : "Montant investi"}
        info="Montant investi à chaque échéance."
        unit="EUR"
      >
        <input
          type="number"
          min={1}
          inputMode="decimal"
          aria-label="Montant"
          value={Number.isNaN(props.amount) ? "" : props.amount}
          onChange={(e) => props.onAmountChange(Number(e.target.value))}
          className={bigInput}
        />
      </Field>

      <Field label="Fréquence d'investissement" info="Achat unique ou investissement programmé (DCA).">
        <Select
          value={props.frequency}
          onValueChange={(v) => props.onFrequencyChange(v as Frequency)}
        >
          <SelectTrigger
            aria-label="Fréquence"
            className="h-auto w-full border-0 bg-transparent p-0 text-2xl font-light text-white shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&_svg]:opacity-50"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Depuis" unit="">
          <input
            type="date"
            aria-label="Date de début"
            value={props.from}
            max={props.to}
            onChange={(e) => props.onFromChange(e.target.value)}
            className={`${bigInput} text-base sm:text-lg`}
          />
        </Field>
        <Field label="Jusqu'au" unit="">
          <input
            type="date"
            aria-label="Date de fin"
            value={props.to}
            min={props.from}
            onChange={(e) => props.onToChange(e.target.value)}
            className={`${bigInput} text-base sm:text-lg`}
          />
        </Field>
      </div>
    </div>
  );
}
