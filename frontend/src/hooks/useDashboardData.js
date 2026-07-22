import { useQuery } from '@tanstack/react-query';
import { repairAPI, assetAPI, authAPI } from '../services/api';
import api from '../services/api';

// Custom hook to fetch dashboard data with React Query
export const useDashboardData = (hasAdminRole = false) => {
  const repairStatsQuery = useQuery({
    queryKey: ['repairs', 'stats'],
    queryFn: () => repairAPI.getStats().then(res => res.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const assetStatsQuery = useQuery({
    queryKey: ['assets', 'stats'],
    queryFn: () => assetAPI.getStats().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const repairsQuery = useQuery({
    queryKey: ['repairs', 'all'],
    queryFn: () => repairAPI.getAll({ status: '' }).then(res => res.data.data),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const costDataQuery = useQuery({
    queryKey: ['costs', 'summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/costs/summary');
        if (res.data?.success) {
          const costBudget = res.data?.data?.budget || res.data?.data || {};
          return {
            total_allocated: Number(costBudget.total_allocated) || 0,
            total_spent: Number(costBudget.total_spent) || 0,
            total_remaining: Number(costBudget.total_remaining) || 0,
          };
        }
        return { total_allocated: 0, total_spent: 0, total_remaining: 0 };
      } catch {
        return { total_allocated: 0, total_spent: 0, total_remaining: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const assetAnalysisQuery = useQuery({
    queryKey: ['asset-analysis', 'summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/asset-analysis/summary');
        if (res.data?.success) {
          const assetStats = res.data?.stats || res.data || {};
          return {
            total_assets: Number(assetStats.total_assets) || 0,
            active_assets: Number(assetStats.active_assets) || Number(assetStats.active) || 0,
            under_repair_assets: Number(assetStats.under_repair) || Number(assetStats.under_repair_assets) || 0,
            duplicate_count: Number(res.data?.duplicateCount) || (res.data?.duplicateItems || []).length || 0,
          };
        }
        return { total_assets: 0, active_assets: 0, under_repair_assets: 0, duplicate_count: 0 };
      } catch {
        return { total_assets: 0, active_assets: 0, under_repair_assets: 0, duplicate_count: 0 };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const pendingRegistrationsQuery = useQuery({
    queryKey: ['registrations', 'pending'],
    queryFn: () => authAPI.getPendingRegistrations().then(res => res.data.data || []),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: hasAdminRole, // Only fetch if admin
  });

  const isLoading = 
    repairStatsQuery.isLoading ||
    assetStatsQuery.isLoading ||
    repairsQuery.isLoading ||
    costDataQuery.isLoading ||
    assetAnalysisQuery.isLoading;

  const error = 
    repairStatsQuery.error ||
    assetStatsQuery.error ||
    repairsQuery.error ||
    costDataQuery.error ||
    assetAnalysisQuery.error;

  return {
    stats: repairStatsQuery.data,
    assets: assetStatsQuery.data,
    repairs: repairsQuery.data || [],
    costData: costDataQuery.data,
    assetAnalysisData: assetAnalysisQuery.data,
    pendingRegistrations: pendingRegistrationsQuery.data || [],
    isLoading,
    error,
    refetch: () => {
      repairStatsQuery.refetch();
      assetStatsQuery.refetch();
      repairsQuery.refetch();
      costDataQuery.refetch();
      assetAnalysisQuery.refetch();
      if (hasAdminRole) pendingRegistrationsQuery.refetch();
    },
  };
};
