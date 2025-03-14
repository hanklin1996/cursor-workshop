"use client";

import { useGlobalData } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketOverview() {
  const { globalData, isLoading, isError } = useGlobalData();

  if (isError) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">載入失敗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">無法獲取市場數據</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(2)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    }
  };

  // 簡易情緒指標計算（實際產品應使用更複雜的演算法）
  const getSentiment = () => {
    if (!globalData) return { text: "未知", value: 50 };
    
    const marketCapChange = globalData.data.market_cap_change_percentage_24h_usd;
    
    if (marketCapChange > 5) return { text: "極度貪婪", value: 85 };
    if (marketCapChange > 2.5) return { text: "貪婪", value: 70 };
    if (marketCapChange > 0) return { text: "中立偏樂觀", value: 60 };
    if (marketCapChange > -2.5) return { text: "中立偏恐懼", value: 40 };
    if (marketCapChange > -5) return { text: "恐懼", value: 25 };
    return { text: "極度恐懼", value: 10 };
  };

  const sentiment = getSentiment();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">總市值</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatMarketCap(globalData?.data.total_market_cap.usd || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    (globalData?.data.market_cap_change_percentage_24h_usd || 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {(globalData?.data.market_cap_change_percentage_24h_usd || 0) >= 0
                    ? "↑"
                    : "↓"}
                  {Math.abs(
                    globalData?.data.market_cap_change_percentage_24h_usd || 0
                  ).toFixed(2)}
                  %
                </span>{" "}
                過去24小時
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">比特幣主導地位</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {(globalData?.data.market_cap_percentage.btc || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-muted-foreground">
                  以太幣: {(globalData?.data.market_cap_percentage.eth || 0).toFixed(1)}%
                </span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">市場情緒</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{sentiment.text}</div>
              <p className="text-xs text-muted-foreground">
                恐懼與貪婪指數: {sentiment.value}/100
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 