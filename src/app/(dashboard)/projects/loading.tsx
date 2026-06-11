export default function ProjectsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-slate-200 rounded-xl w-32" />
        <div className="h-10 bg-slate-200 rounded-xl w-36" />
      </div>
      <div className="bg-white rounded-2xl p-4 border border-slate-100 h-16" />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 h-12 border-b border-slate-100" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-50">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-1/6" />
            <div className="h-4 bg-slate-100 rounded w-1/8" />
            <div className="h-4 bg-slate-100 rounded w-1/8" />
            <div className="h-4 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
