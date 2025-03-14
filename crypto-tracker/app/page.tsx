"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { CryptoTable } from "@/components/crypto-table";
import { MarketOverview } from "@/components/market-overview";
import { CurrencyToggle } from "@/components/currency-toggle";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CurrencyType = "usd" | "twd";
type CategoryType = "all" | "defi" | "layer1" | "exchange";

export default function Home() {
  const [currency, setCurrency] = useState<CurrencyType>("usd");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">虛擬貨幣市場</h1>
            <CurrencyToggle onCurrencyChange={handleCurrencyChange} />
          </div>
          
          {/* 市場概覽區 */}
          <MarketOverview />
          
          {/* 篩選區 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center py-4">
            <div className="flex gap-2">
              <Button 
                variant={activeCategory === "all" ? "outline" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => setActiveCategory("all")}
              >
                全部
              </Button>
              <Button 
                variant={activeCategory === "defi" ? "outline" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => setActiveCategory("defi")}
              >
                DeFi
              </Button>
              <Button 
                variant={activeCategory === "layer1" ? "outline" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => setActiveCategory("layer1")}
              >
                Layer1
              </Button>
              <Button 
                variant={activeCategory === "exchange" ? "outline" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => setActiveCategory("exchange")}
              >
                交易所
              </Button>
            </div>
            <Tabs defaultValue="market_cap" className="w-full sm:w-auto">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="market_cap">
                  市值
                </TabsTrigger>
                <TabsTrigger value="volume">
                  交易量
                </TabsTrigger>
                <TabsTrigger value="change">
                  漲幅
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* 虛擬貨幣列表 */}
          <CryptoTable currency={currency} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
