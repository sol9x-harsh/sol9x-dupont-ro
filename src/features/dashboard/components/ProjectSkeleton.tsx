import { cn } from "@/lib/utils";

interface ProjectSkeletonProps {
  viewMode: 'grid' | 'list';
}

export function ProjectSkeleton({ viewMode }: ProjectSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl border border-border/40 px-5 py-3.5 flex items-center gap-4 animate-pulse">
        <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-4 w-16 bg-slate-50 rounded hidden lg:block" />
        <div className="w-8 h-8 rounded-lg bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="w-8 h-8 rounded-lg bg-slate-50" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
      </div>
      <div className="space-y-2 py-2">
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="h-3 w-1/3 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/20">
        <div className="h-3 w-16 bg-slate-50 rounded" />
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

export function FolderSkeleton() {
  return (
    <div className="flex flex-col items-start gap-2 p-3.5 rounded-xl border border-border bg-card animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200" />
      <div className="space-y-2 w-full">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProjectsGridSkeleton({ viewMode, count = 8 }: { viewMode: 'grid' | 'list', count?: number }) {
  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
        : 'flex flex-col gap-2.5'
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <ProjectSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
