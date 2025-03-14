import axios from 'axios';

// CoinGecko API 基本 URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  }
});

// 獲取全球加密貨幣市場數據
export async function getGlobalData() {
  try {
    const response = await api.get('/global');
    return response.data;
  } catch (error) {
    console.error('獲取全球數據失敗:', error);
    throw error;
  }
}

// 獲取加密貨幣列表
export async function getCoinsList(
  page = 1, 
  perPage = 100, 
  currency = 'usd',
  order = 'market_cap_desc'
) {
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: currency,
        order,
        per_page: perPage,
        page,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });
    return response.data;
  } catch (error) {
    console.error('獲取加密貨幣列表失敗:', error);
    throw error;
  }
}

// 獲取單個加密貨幣詳細信息
export async function getCoinDetails(id: string) {
  try {
    const response = await api.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });
    return response.data;
  } catch (error) {
    console.error(`獲取加密貨幣 ${id} 詳細信息失敗:`, error);
    throw error;
  }
}

// 獲取加密貨幣歷史價格數據
export async function getCoinMarketChart(
  id: string, 
  days = 1, 
  currency = 'usd'
) {
  try {
    const response = await api.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: currency,
        days
      }
    });
    return response.data;
  } catch (error) {
    console.error(`獲取加密貨幣 ${id} 市場圖表數據失敗:`, error);
    throw error;
  }
}

// 獲取加密貨幣類別列表
export async function getCoinCategories() {
  try {
    const response = await api.get('/coins/categories/list');
    return response.data;
  } catch (error) {
    console.error('獲取加密貨幣類別列表失敗:', error);
    throw error;
  }
}

interface CacheItem<T> {
  data: T;
  expiry: number;
}

// 本地存儲緩存工具
export const localStorageCache = {
  set: <T>(key: string, data: T, ttl = 30 * 60 * 1000) => {
    const item: CacheItem<T> = {
      data,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr) as CacheItem<T>;
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
}; 