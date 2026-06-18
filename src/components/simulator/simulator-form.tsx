"use client";

import type { Coin } from "@/lib/market-data";
import { FREQUENCIES, type Frequency } from "@/lib/dca";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

const fieldLabel = "text-sm font-medium text-foreground";

export function SimulatorForm(props: SimulatorFormProps) {
  const isRecurring = props.frequency !== "once";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className={fieldLabel}>Cryptomonnaie</Label>
        <CoinCombobox
          coins={props.coins}
          value={props.coinId}
          onChange={props.onCoinChange}
          loading={props.coinsLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className={fieldLabel}>
          Montant {isRecurring ? "par versement" : "investi"}
        </Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            min={1}
            inputMode="decimal"
            value={Number.isNaN(props.amount) ? "" : props.amount}
            onChange={(e) => props.onAmountChange(Number(e.target.value))}
            className="h-11 rounded-md border-input bg-input/20 pr-9 text-base"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            €
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className={fieldLabel}>Fréquence d&apos;investissement</Label>
        <Select
          value={props.frequency}
          onValueChange={(v) => props.onFrequencyChange(v as Frequency)}
        >
          <SelectTrigger className="h-11 w-full rounded-md border-input bg-input/20">
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="from" className={fieldLabel}>
            Depuis
          </Label>
          <Input
            id="from"
            type="date"
            value={props.from}
            max={props.to}
            onChange={(e) => props.onFromChange(e.target.value)}
            className="h-11 w-full min-w-0 rounded-md border-input bg-input/20"
          />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="to" className={fieldLabel}>
            Jusqu&apos;au
          </Label>
          <Input
            id="to"
            type="date"
            value={props.to}
            min={props.from}
            onChange={(e) => props.onToChange(e.target.value)}
            className="h-11 w-full min-w-0 rounded-md border-input bg-input/20"
          />
        </div>
      </div>
    </div>
  );
}
