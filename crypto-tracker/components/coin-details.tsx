"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useCoinDetails, useCoinMarketChart } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import PriceChart from "@/components/price-chart";

type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";

interface CoinDetailsProps {
  id: string;
}

export default function CoinDetails({ id }: CoinDetailsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [daysMap] = useState({
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  });
  
  const { coinDetails, isLoading: isLoadingDetails, isError: isErrorDetails } = useCoinDetails(id);
  const { marketChart, isLoading: isLoadingChart, isError: isErrorChart } = 
    useCoinMarketChart(id, daysMap[timeRange]);

  if (isErrorDetails || isErrorChart) {
    return (
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <ChevronLeft size={16} />
            <span>返回列表</span>
          </Link>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">資料載入錯誤</h2>
            <p className="text-muted-foreground mb-6">
              無法獲取該加密貨幣的詳細資訊，請稍後再試
            </p>
            <Button asChild>
              <Link href="/">返回首頁</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <ChevronLeft size={16} />
            <span>返回列表</span>
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {/* 基本資訊區 */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div className="flex items-center gap-3">
              {isLoadingDetails ? (
                <Skeleton className="h-12 w-12 rounded-full" />
              ) : (
                coinDetails?.image?.large && (
                  <Image 
                    src={coinDetails.image.large}
                    alt={coinDetails.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {isLoadingDetails ? (
                    <Skeleton className="h-8 w-40" />
                  ) : (
                    <>
                      {coinDetails?.name}
                      <span className="text-muted-foreground text-lg uppercase">
                        {coinDetails?.symbol}
                      </span>
                    </>
                  )}
                </h1>
                <div className="text-sm text-muted-foreground">
                  {isLoadingDetails ? (
                    <Skeleton className="h-4 w-32 mt-1" />
                  ) : (
                    coinDetails?.market_data?.market_cap_rank && (
                      `排名 #${coinDetails.market_data.market_cap_rank}`
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold">
                {isLoadingDetails ? (
                  <Skeleton className="h-9 w-36" />
                ) : (
                  `$${coinDetails?.market_data?.current_price?.usd?.toLocaleString()}`
                )}
              </div>
              <div className={`text-sm font-medium ${
                (coinDetails?.market_data?.price_change_percentage_24h || 0) >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {isLoadingDetails ? (
                  <Skeleton className="h-4 w-20 mt-1" />
                ) : (
                  `${(coinDetails?.market_data?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}${coinDetails?.market_data?.price_change_percentage_24h?.toFixed(2)}% (24h)`
                )}
              </div>
            </div>
          </div>

          {/* 價格圖表 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>價格走勢</CardTitle>
                <Tabs 
                  defaultValue="7d" 
                  value={timeRange} 
                  onValueChange={(value) => setTimeRange(value as TimeRange)}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="24h">24h</TabsTrigger>
                    <TabsTrigger value="7d">7d</TabsTrigger>
                    <TabsTrigger value="30d">30d</TabsTrigger>
                    <TabsTrigger value="90d">3m</TabsTrigger>
                    <TabsTrigger value="1y">1y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoadingChart ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  marketChart?.prices ? (
                    <PriceChart 
                      data={marketChart.prices} 
                      timeRange={timeRange}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <p>無法加載價格數據</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* 市場數據 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">市值</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <div className="text-xl font-bold">
                    ${coinDetails?.market_data?.market_cap?.usd?.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">24小時交易量</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <div className="text-xl font-bold">
                    ${coinDetails?.market_data?.total_volume?.usd?.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">流通供應量</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <div className="text-xl font-bold">
                    {coinDetails?.market_data?.circulating_supply?.toLocaleString()} {coinDetails?.symbol?.toUpperCase()}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">總供應量</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <div className="text-xl font-bold">
                    {coinDetails?.market_data?.total_supply 
                      ? `${coinDetails.market_data.total_supply.toLocaleString()} ${coinDetails.symbol.toUpperCase()}`
                      : '無限制'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 專案資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>關於 {coinDetails?.name || '此加密貨幣'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingDetails ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : (
                <div 
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: coinDetails?.description?.en?.slice(0, 300) + '...' || '暫無描述' 
                  }}
                />
              )}
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {isLoadingDetails ? (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : (
                  <>
                    {coinDetails?.links?.homepage?.[0] && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coinDetails.links.homepage[0]} target="_blank" rel="noopener noreferrer">
                          官方網站
                        </a>
                      </Button>
                    )}
                    {coinDetails?.links?.blockchain_site?.[0] && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coinDetails.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">
                          區塊鏈瀏覽器
                        </a>
                      </Button>
                    )}
                    {coinDetails?.links?.official_forum_url?.[0] && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coinDetails.links.official_forum_url[0]} target="_blank" rel="noopener noreferrer">
                          官方論壇
                        </a>
                      </Button>
                    )}
                    {coinDetails?.links?.subreddit_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coinDetails.links.subreddit_url} target="_blank" rel="noopener noreferrer">
                          Reddit 社區
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
} 