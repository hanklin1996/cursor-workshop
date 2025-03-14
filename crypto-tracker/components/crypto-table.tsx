"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCoinsList } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CurrencyType = "usd" | "twd";

interface CryptoTableProps {
  currency?: CurrencyType;
  page?: number;
  perPage?: number;
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

// 安全格式化數字的輔助函數
const safeFormat = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString();
};

export function CryptoTable({
  currency = "usd",
  page = 1,
  perPage = 100,
}: CryptoTableProps) {
  const { coins, isLoading, isError } = useCoinsList(page, perPage, currency);
  const [currencySign, setCurrencySign] = useState<string>("$");

  useEffect(() => {
    if (currency === "twd") {
      setCurrencySign("NT$");
    } else {
      setCurrencySign("$");
    }
  }, [currency]);

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        載入失敗，請稍後再試
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead>名稱</TableHead>
            <TableHead className="text-right">價格</TableHead>
            <TableHead className="text-right">24小時漲跌</TableHead>
            <TableHead className="text-right hidden md:table-cell">24小時交易量</TableHead>
            <TableHead className="text-right hidden md:table-cell">市值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : coins?.map((coin: Coin) => (
                <TableRow key={coin.id}>
                  <TableCell>{coin.market_cap_rank || "N/A"}</TableCell>
                  <TableCell>
                    <Link
                      href={`/coin/${coin.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      {coin.image && (
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div>{coin.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencySign}
                    {safeFormat(coin.current_price)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      (coin.price_change_percentage_24h || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                    {(coin.price_change_percentage_24h || 0)?.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    {currencySign}
                    {safeFormat(coin.total_volume)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    {currencySign}
                    {safeFormat(coin.market_cap)}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
} 