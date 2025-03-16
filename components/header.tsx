import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 border-2 border-primary flex items-center justify-center">
            <div className="h-3 w-3 bg-primary"></div>
          </div>
          <h1 className="text-xl font-bold">ContextCharts</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/api-docs"
            className="text-sm hover:text-primary transition-colors"
          >
            API Docs
          </Link>
          <Link
            href="#"
            className="text-sm hover:text-primary transition-colors"
          >
            Watchlist
          </Link>
          <Link
            href="#"
            className="text-sm hover:text-primary transition-colors"
          >
            News
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
