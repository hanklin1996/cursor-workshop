"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables, ChartDataset, TooltipItem } from 'chart.js';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import annotationPlugin from 'chartjs-plugin-annotation';

// 註冊所有需要的 Chart.js 組件
Chart.register(...registerables, annotationPlugin);

type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";
type PriceDataPoint = [number, number];

interface PriceChartProps {
  data: PriceDataPoint[];
  timeRange: TimeRange;
}

// 均線策略類型
type StrategyType = "goldencross" | "multiema" | "machannel";

export default function PriceChart({ data, timeRange }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // 均線策略開關狀態
  const [strategies, setStrategies] = useState({
    goldencross: false,
    multiema: false,
    machannel: false
  });

  // 處理策略開關變化
  const handleStrategyToggle = (strategy: StrategyType) => {
    setStrategies(prev => ({
      ...prev,
      [strategy]: !prev[strategy]
    }));
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除舊圖表
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // 格式化數據
    const labels = data.map(([timestamp]) => {
      const date = new Date(timestamp);
      if (timeRange === "24h") {
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === "7d" || timeRange === "30d") {
        return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
      }
    });
    
    const prices = data.map(([, price]) => price);

    // 創建數據集
    const datasets: ChartDataset<'line'>[] = [{
      label: '價格',
      data: prices,
      fill: {
        target: 'origin',
        above: 'rgba(59, 130, 246, 0.1)',
      },
      borderColor: '#3b82f6',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }];

    // 計算和添加均線
    if (strategies.goldencross || strategies.multiema) {
      // 計算短期均線 (5日/20日)
      const shortTermMA = calculateMA(prices, 5);
      datasets.push({
        label: '5日均線',
        data: shortTermMA.map(val => val === null ? null : val),
        fill: false,
        borderColor: '#10b981', // 綠色
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.1,
      });

      // 計算長期均線 (50日/200日)
      const longTermMA = calculateMA(prices, 20);
      datasets.push({
        label: '20日均線',
        data: longTermMA.map(val => val === null ? null : val),
        fill: false,
        borderColor: '#ef4444', // 紅色
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.1,
      });

      // 如果使用多重均線系統，添加更多均線
      if (strategies.multiema) {
        // 計算中期均線 (10日)
        const midTermMA = calculateMA(prices, 10);
        datasets.push({
          label: '10日均線',
          data: midTermMA.map(val => val === null ? null : val),
          fill: false,
          borderColor: '#f59e0b', // 黃色
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
        });

        // 計算較長期均線 (60日)
        const longerTermMA = calculateMA(prices, 60);
        datasets.push({
          label: '60日均線',
          data: longerTermMA.map(val => val === null ? null : val),
          fill: false,
          borderColor: '#8b5cf6', // 紫色
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
        });
      }
    }

    // 計算均線通道
    if (strategies.machannel) {
      const periodMA = calculateMA(prices, 20);
      const stdDev = calculateStdDev(prices, periodMA, 20);
      
      // 上軌 (均線 + 2 * 標準差)
      const upperBand = periodMA.map((ma, i) => ma !== null ? ma + 2 * stdDev : null);
      datasets.push({
        label: '上軌',
        data: upperBand.map(val => val === null ? null : val),
        fill: false,
        borderColor: 'rgba(236, 72, 153, 0.7)', // 粉色
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1,
      });
      
      // 下軌 (均線 - 2 * 標準差)
      const lowerBand = periodMA.map((ma, i) => ma !== null ? ma - 2 * stdDev : null);
      datasets.push({
        label: '下軌',
        data: lowerBand.map(val => val === null ? null : val),
        fill: {
          target: '+1',
          above: 'rgba(236, 72, 153, 0.05)',
        },
        borderColor: 'rgba(236, 72, 153, 0.7)', // 粉色
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1,
      });
    }

    // 計算買賣點
    const buyPoints: Array<{x: number, y: number}> = [];
    const sellPoints: Array<{x: number, y: number}> = [];

    if (strategies.goldencross) {
      // 計算黃金交叉和死亡交叉的買賣點
      const shortMA = calculateMA(prices, 5);
      const longMA = calculateMA(prices, 20);
      
      for (let i = 1; i < prices.length; i++) {
        // 黃金交叉 (短線上穿長線)
        if (shortMA[i-1] !== null && longMA[i-1] !== null && shortMA[i] !== null && longMA[i] !== null) {
          if (shortMA[i-1] <= longMA[i-1] && shortMA[i] > longMA[i]) {
            buyPoints.push({
              x: i,
              y: prices[i]
            });
          }
          // 死亡交叉 (短線下穿長線)
          else if (shortMA[i-1] >= longMA[i-1] && shortMA[i] < longMA[i]) {
            sellPoints.push({
              x: i,
              y: prices[i]
            });
          }
        }
      }
    }

    if (strategies.machannel) {
      // 均線通道的買賣點
      const ma20 = calculateMA(prices, 20);
      const stdDev = calculateStdDev(prices, ma20, 20);
      
      for (let i = 1; i < prices.length; i++) {
        if (ma20[i] !== null && ma20[i-1] !== null) {
          // 價格突破上軌 (賣出信號)
          if (prices[i-1] <= ma20[i-1] + 2 * stdDev && prices[i] > ma20[i] + 2 * stdDev) {
            sellPoints.push({
              x: i,
              y: prices[i]
            });
          }
          // 價格跌破下軌 (買入信號)
          else if (prices[i-1] >= ma20[i-1] - 2 * stdDev && prices[i] < ma20[i] - 2 * stdDev) {
            buyPoints.push({
              x: i,
              y: prices[i]
            });
          }
        }
      }
    }

    // 創建買入點和賣出點標註
    const annotations: Record<string, any> = {};
    
    // 添加買入點
    buyPoints.forEach((point, index) => {
      annotations[`buy${index}`] = {
        type: 'point',
        xValue: point.x,
        yValue: point.y,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderWidth: 2,
        borderColor: 'white',
        radius: 6,
        label: {
          display: true,
          content: '買入',
          color: 'white',
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
        }
      };
    });
    
    // 添加賣出點
    sellPoints.forEach((point, index) => {
      annotations[`sell${index}`] = {
        type: 'point',
        xValue: point.x,
        yValue: point.y,
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderWidth: 2,
        borderColor: 'white',
        radius: 6,
        label: {
          display: true,
          content: '賣出',
          color: 'white',
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
        }
      };
    });

    // 創建圖表
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context: TooltipItem<'line'>) {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
              }
            }
          },
          // 添加買賣點標記
          annotation: {
            annotations
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(tickValue: number | string) {
                const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return '$' + numValue.toLocaleString();
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, timeRange, strategies]);

  // 計算移動平均線
  function calculateMA(prices: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    
    // 前 period-1 個點沒有足夠數據計算移動平均
    for (let i = 0; i < period - 1; i++) {
      result.push(null);
    }
    
    // 從第 period 個點開始計算
    for (let i = period - 1; i < prices.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      result.push(sum / period);
    }
    
    return result;
  }

  // 計算標準差
  function calculateStdDev(prices: number[], ma: (number | null)[], period: number): number {
    let sumSquares = 0;
    let validPoints = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      if (i >= 0 && ma[i] !== null) {
        sumSquares += Math.pow(prices[i] - (ma[i] as number), 2);
        validPoints++;
      }
    }
    
    return Math.sqrt(sumSquares / validPoints);
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="goldencross"
            checked={strategies.goldencross}
            onCheckedChange={() => handleStrategyToggle('goldencross')}
          />
          <Label htmlFor="goldencross">黃金交叉策略</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="multiema"
            checked={strategies.multiema}
            onCheckedChange={() => handleStrategyToggle('multiema')}
          />
          <Label htmlFor="multiema">多重均線策略</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="machannel"
            checked={strategies.machannel}
            onCheckedChange={() => handleStrategyToggle('machannel')}
          />
          <Label htmlFor="machannel">均線通道策略</Label>
        </div>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
} 