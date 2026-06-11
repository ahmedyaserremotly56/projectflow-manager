export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-28">
            <div className="w-10 h-10 bg-slate-200 rounded-xl mb-3" />
            <div className="h-7 bg-slate-200 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl h-72 border border-slate-100" />
        <div className="lg:col-span-2 bg-white rounded-2xl h-72 border border-slate-100" />
      </div>
    </div>
  );
}
