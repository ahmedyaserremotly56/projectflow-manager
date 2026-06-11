import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-6xl font-bold text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">الصفحة غير موجودة</h2>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl shadow-sm">
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
