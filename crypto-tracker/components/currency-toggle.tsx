"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CurrencyType = "usd" | "twd";

interface CurrencyToggleProps {
  onCurrencyChange?: (currency: CurrencyType) => void;
}

export function CurrencyToggle({ onCurrencyChange }: CurrencyToggleProps) {
  const [currency, setCurrency] = useState<CurrencyType>("usd");

  useEffect(() => {
    // 從 localStorage 讀取偏好設定
    const savedCurrency = localStorage.getItem("preferred-currency");
    if (savedCurrency === "usd" || savedCurrency === "twd") {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    localStorage.setItem("preferred-currency", newCurrency);
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {currency.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleCurrencyChange("usd")}>
          USD (美元)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCurrencyChange("twd")}>
          TWD (新台幣)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 