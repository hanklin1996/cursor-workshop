import { Metadata } from "next";
import { Nav } from "@/components/nav";
import CoinDetails from "@/components/coin-details";

export const metadata: Metadata = {
  title: "虛擬貨幣詳情",
  description: "查看虛擬貨幣詳細的價格、市值和其他市場資訊",
};

// 正確處理 Next.js 15 中的異步參數
export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 等待參數解析完成
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <CoinDetails id={id} />
    </div>
  );
} 