import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { TeamProductivityChart } from "@/components/dashboard/TeamProductivityChart";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import {
  FolderKanban,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, client:clients(name)")
    .order("created_at", { ascending: false });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const activeProjects =
    projects?.filter((p) => p.status === "in_progress").length || 0;
  const completedProjects =
    projects?.filter((p) => p.status === "completed").length || 0;
  const overdueProjects =
    projects?.filter(
      (p) =>
        p.status !== "completed" &&
        p.status !== "cancelled" &&
        new Date(p.delivery_date) < now
    ).length || 0;

  const totalRevenue =
    projects
      ?.filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;

  const currentMonthRevenue =
    projects
      ?.filter((p) => {
        const date = new Date(p.created_at);
        return (
          p.status === "completed" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;

  // Status distribution for chart
  const statusData = [
    { status: "لم يبدأ", count: projects?.filter((p) => p.status === "not_started").length || 0, color: "#94a3b8" },
    { status: "قيد التنفيذ", count: projects?.filter((p) => p.status === "in_progress").length || 0, color: "#3b82f6" },
    { status: "تحت المراجعة", count: projects?.filter((p) => p.status === "under_review").length || 0, color: "#f59e0b" },
    { status: "مكتمل", count: projects?.filter((p) => p.status === "completed").length || 0, color: "#10b981" },
    { status: "ملغي", count: projects?.filter((p) => p.status === "cancelled").length || 0, color: "#ef4444" },
  ].filter((d) => d.count > 0);

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthProjects = projects?.filter((p) => {
      const pDate = new Date(p.created_at);
      return (
        p.status === "completed" &&
        pDate.getMonth() === date.getMonth() &&
        pDate.getFullYear() === date.getFullYear()
      );
    });
    return {
      month: date.toLocaleString("ar-EG", { month: "short" }),
      revenue: monthProjects?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0,
    };
  }).reverse();

  const recentProjects = projects?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">
          نظرة عامة على أداء المشاريع والفريق
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="إجمالي المشاريع"
          value={totalProjects}
          icon={FolderKanban}
          color="blue"
          className="xl:col-span-1"
        />
        <StatsCard
          title="المشاريع النشطة"
          value={activeProjects}
          icon={PlayCircle}
          color="indigo"
          className="xl:col-span-1"
        />
        <StatsCard
          title="المشاريع المكتملة"
          value={completedProjects}
          icon={CheckCircle}
          color="green"
          className="xl:col-span-1"
        />
        <StatsCard
          title="المشاريع المتأخرة"
          value={overdueProjects}
          icon={AlertTriangle}
          color="red"
          className="xl:col-span-1"
        />
        <StatsCard
          title="إجمالي الأرباح"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="emerald"
          className="xl:col-span-1"
        />
        <StatsCard
          title="أرباح الشهر الحالي"
          value={formatCurrency(currentMonthRevenue)}
          icon={TrendingUp}
          color="sky"
          className="xl:col-span-1"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProjectStatusChart data={statusData} />
        </div>
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={monthlyRevenue} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects projects={recentProjects} />
        <TeamProductivityChart />
      </div>
    </div>
  );
}
