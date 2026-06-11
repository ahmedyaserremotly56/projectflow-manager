"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, Users, UserCheck,
  Bell, FileBarChart, Settings, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string; label: string; icon: React.ElementType; roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard",      label: "لوحة التحكم",  icon: LayoutDashboard },
  { href: "/projects",       label: "المشاريع",      icon: FolderKanban },
  { href: "/clients",        label: "العملاء",       icon: UserCheck,   roles: ["admin","manager"] },
  { href: "/team",           label: "الفريق",         icon: Users },
  { href: "/notifications",  label: "الإشعارات",     icon: Bell },
  { href: "/reports",        label: "التقارير",       icon: FileBarChart, roles: ["admin","manager"] },
  { href: "/settings",       label: "الإعدادات",      icon: Settings,    roles: ["admin"] },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const filtered = navItems.filter((i) => !i.roles || i.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">ProjectFlow</h1>
            <p className="text-xs text-slate-400">إدارة المشاريع</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">القائمة الرئيسية</p>
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-900/50" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronLeft className="w-3.5 h-3.5 mr-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4">
        <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/30">
          <p className="text-xs text-slate-500">الصلاحية الحالية</p>
          <p className="text-sm font-bold text-blue-400 mt-0.5">
            {userRole === "admin" ? "👑 مدير النظام" : userRole === "manager" ? "🧑‍💼 مدير مشاريع" : "👷 عضو فريق"}
          </p>
        </div>
      </div>
    </aside>
  );
}
