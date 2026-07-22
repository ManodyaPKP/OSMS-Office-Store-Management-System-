import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-slate-100 rounded-2xl animate-pulse ${className}`}>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
      <div className="h-8 bg-slate-200 rounded-lg w-full" />
      <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 rounded-lg" />
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="w-full h-64 bg-slate-100 rounded-2xl animate-pulse" />
);

export const DashboardSkeleton = () => (
  <div className="p-8 space-y-6">
    {/* Stat cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>

    {/* Table */}
    <SkeletonTable rows={8} />
  </div>
);
