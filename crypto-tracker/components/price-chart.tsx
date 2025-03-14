"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables, ChartDataset, TooltipItem } from 'chart.js';

// 註冊所有需要的 Chart.js 組件
Chart.register(...registerables);

type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";
type PriceDataPoint = [number, number]; // [timestamp, price]

interface PriceChartProps {
  data: PriceDataPoint[];
  timeRange: TimeRange;
}

export default function PriceChart({ data, timeRange }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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

    // 創建圖表
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
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
          } as ChartDataset<'line'>]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context: TooltipItem<'line'>) {
                  return `$${context.parsed.y.toLocaleString()}`;
                }
              }
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
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, timeRange]);

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
} 