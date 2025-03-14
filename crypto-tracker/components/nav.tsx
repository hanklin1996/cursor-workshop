import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="font-bold text-lg mr-6">
          虛擬貨幣追蹤
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            首頁
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
} 