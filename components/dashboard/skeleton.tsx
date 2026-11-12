import { Skeleton } from "@/components/ui/misc";

export function DashboardSkeleton() {
  return (
    <div className="flex h-svh overflow-hidden bg-paper" aria-busy="true" aria-label="Loading your dashboard">
      <aside className="hidden w-[264px] shrink-0 flex-col gap-3 border-r border-line/70 bg-[#fafbfc] p-4 lg:flex">
        <Skeleton className="mb-3 h-7 w-32" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 border-b border-line/70" />
        <div className="mx-auto w-full max-w-[760px] space-y-4 px-6 pt-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="mt-6 h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
      <aside className="hidden w-[min(440px,32vw)] border-l border-line/70 p-5 xl:block">
        <Skeleton className="h-full w-full rounded-xl" />
      </aside>
    </div>
  );
}
