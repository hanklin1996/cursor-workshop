import useSWR from 'swr';
import { 
  getGlobalData, 
  getCoinsList, 
  getCoinDetails, 
  getCoinMarketChart,
  localStorageCache
} from './api';

// 客戶端緩存鍵
const CACHE_KEYS = {
  GLOBAL: 'global-data',
  COINS_LIST: 'coins-list',
  COIN_DETAILS: (id: string) => `coin-details-${id}`,
  MARKET_CHART: (id: string, days: number) => `market-chart-${id}-${days}`,
};

// 使用 SWR 獲取全球市場數據
export function useGlobalData() {
  const { data, error, isLoading, mutate } = useSWR(
    CACHE_KEYS.GLOBAL,
    async () => {
      // 嘗試從本地存儲獲取緩存數據
      const cachedData = typeof window !== 'undefined' 
        ? localStorageCache.get(CACHE_KEYS.GLOBAL) 
        : null;
      
      if (cachedData) return cachedData;
      
      // 如果沒有緩存或緩存過期，則從 API 獲取
      const freshData = await getGlobalData();
      
      // 將新數據存儲到本地緩存
      if (typeof window !== 'undefined') {
        localStorageCache.set(CACHE_KEYS.GLOBAL, freshData);
      }
      
      return freshData;
    },
    {
      refreshInterval: 5 * 60 * 1000, // 5分鐘刷新一次
      revalidateOnFocus: false,
    }
  );

  return {
    globalData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// 使用 SWR 獲取加密貨幣列表
export function useCoinsList(
  page = 1,
  perPage = 100,
  currency = 'usd',
  order = 'market_cap_desc'
) {
  const cacheKey = `${CACHE_KEYS.COINS_LIST}-${currency}-${page}-${perPage}-${order}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      // 嘗試從本地存儲獲取緩存數據
      const cachedData = typeof window !== 'undefined' 
        ? localStorageCache.get(cacheKey) 
        : null;
      
      if (cachedData) return cachedData;
      
      // 如果沒有緩存或緩存過期，則從 API 獲取
      const freshData = await getCoinsList(page, perPage, currency, order);
      
      // 將新數據存儲到本地緩存
      if (typeof window !== 'undefined') {
        localStorageCache.set(cacheKey, freshData);
      }
      
      return freshData;
    },
    {
      refreshInterval: 60 * 1000, // 1分鐘刷新一次
      revalidateOnFocus: false,
    }
  );

  return {
    coins: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// 使用 SWR 獲取單個加密貨幣詳細信息
export function useCoinDetails(id: string) {
  const cacheKey = CACHE_KEYS.COIN_DETAILS(id);
  
  const { data, error, isLoading, mutate } = useSWR(
    id ? cacheKey : null,
    async () => {
      // 嘗試從本地存儲獲取緩存數據
      const cachedData = typeof window !== 'undefined' 
        ? localStorageCache.get(cacheKey) 
        : null;
      
      if (cachedData) return cachedData;
      
      // 如果沒有緩存或緩存過期，則從 API 獲取
      const freshData = await getCoinDetails(id);
      
      // 將新數據存儲到本地緩存
      if (typeof window !== 'undefined') {
        localStorageCache.set(cacheKey, freshData);
      }
      
      return freshData;
    },
    {
      refreshInterval: 60 * 1000, // 1分鐘刷新一次
      revalidateOnFocus: false,
    }
  );

  return {
    coinDetails: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// 使用 SWR 獲取加密貨幣歷史價格數據
export function useCoinMarketChart(id: string, days = 1, currency = 'usd') {
  const cacheKey = CACHE_KEYS.MARKET_CHART(id, days);
  
  const { data, error, isLoading, mutate } = useSWR(
    id ? cacheKey : null,
    async () => {
      // 嘗試從本地存儲獲取緩存數據
      const cachedData = typeof window !== 'undefined' 
        ? localStorageCache.get(cacheKey) 
        : null;
      
      if (cachedData) return cachedData;
      
      // 如果沒有緩存或緩存過期，則從 API 獲取
      const freshData = await getCoinMarketChart(id, days, currency);
      
      // 將新數據存儲到本地緩存
      if (typeof window !== 'undefined') {
        localStorageCache.set(cacheKey, freshData);
      }
      
      return freshData;
    },
    {
      refreshInterval: days === 1 ? 60 * 1000 : 30 * 60 * 1000, // 短期數據更頻繁更新
      revalidateOnFocus: false,
    }
  );

  return {
    marketChart: data,
    isLoading,
    isError: error,
    mutate,
  };
} 