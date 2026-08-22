"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateCurrency } from "@/lib/actions";

const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "SEK", label: "Swedish Krona" },
  { code: "NOK", label: "Norwegian Krone" },
  { code: "DKK", label: "Danish Krone" },
  { code: "PLN", label: "Polish Zloty" },
  { code: "ZAR", label: "South African Rand" },
  { code: "NPR", label: "Nepalese Rupee" },
];

export function SettingsForm({
  currency,
  formatExample,
}: {
  currency: string;
  formatExample: string;
}) {
  const preselects = CURRENCIES.filter((c) => c.code === currency);
  const [customCode, setCustomCode] = React.useState(preselects.length === 0 ? currency : "");
  const [preset, setPreset] = React.useState(customCode ? "" : currency);
  const [pending, setPending] = React.useState(false);

  const code = customCode || preset;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(code ?? "").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(value)) {
      toast.error("Currency must be a 3-letter ISO code (e.g. USD).");
      return;
    }
    setPending(true);
    const res = await updateCurrency(value);
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Saved");
    } else {
      toast.error(res.message ?? "Failed to save");
    }
  }

  return (
    <div className="grid max-w-2xl grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Choose the currency used across your dashboard, menu, orders and inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="settingsForm" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CURRENCIES.map((c) => (
                <label
                  key={c.code}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    !customCode && preset === c.code
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={c.code}
                    checked={!customCode && preset === c.code}
                    onChange={() => {
                      setPreset(c.code);
                      setCustomCode("");
                    }}
                    className="size-4 accent-[--primary]"
                  />
                  <span className="font-medium tabular-nums">{c.code}</span>
                  <span className="text-muted-foreground">{c.label}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customCurrency" className="text-sm font-medium">
                Or type a custom code
              </label>
              <input
                id="customCurrency"
                name="customCurrency"
                value={customCode}
                onChange={(e) => {
                  setCustomCode(e.target.value.toUpperCase());
                  setPreset("");
                }}
                placeholder="EUR"
                maxLength={3}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? "Saving..." : "Save currency"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How amounts will be displayed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Menu price</span>
            <span className="tabular-nums font-medium">{formatExample}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}