"use client";

import { useState, useEffect } from "react";

export function Footer() {
  const [dateTime, setDateTime] = useState<string>("");
  
  useEffect(() => {
    // 只在客戶端執行時更新日期
    setDateTime(new Date().toLocaleString('zh-TW'));
  }, []);
  
  return (
    <footer className="py-4 border-t">
      <div className="container flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          資料更新時間：{dateTime}
        </div>
        <div className="text-sm text-muted-foreground">
          資料來源：CoinGecko API
        </div>
      </div>
    </footer>
  );
} 