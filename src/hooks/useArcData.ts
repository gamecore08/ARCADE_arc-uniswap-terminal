import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PoolIndexerService } from '../services/poolIndexer';
import { Pool, Position, SnapshotMeta } from '../types';

export function useArcData() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pools query: staleTime is Infinity (NO background polling!)
  const { data: pools = PoolIndexerService.getCachedPools() } = useQuery<Pool[]>({
    queryKey: ['arc_pools'],
    queryFn: () => PoolIndexerService.getCachedPools(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // User positions query: staleTime is Infinity
  const { data: positions = PoolIndexerService.getUserPositions() } = useQuery<Position[]>({
    queryKey: ['arc_positions'],
    queryFn: () => PoolIndexerService.getUserPositions(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Snapshot meta query
  const { data: snapshotMeta = PoolIndexerService.getSnapshotMeta() } = useQuery<SnapshotMeta>({
    queryKey: ['arc_snapshot'],
    queryFn: () => PoolIndexerService.getSnapshotMeta(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Manual refresh mutation triggered ONLY by user clicking ⟳ Refresh or pressing shortcut 'R'
  const refreshMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      // Fetch current live block number from Arc RPC
      const liveBlock = await PoolIndexerService.fetchLiveBlockNumber();
      // Update snapshot metadata
      const newMeta = PoolIndexerService.setSnapshotMeta(liveBlock);

      // Query live pools from DexScreener API for Arc
      const updatedPools = await PoolIndexerService.fetchLiveDexScreenerPools();

      // Artificial small delay for satisfying spinning animation
      await new Promise(r => setTimeout(r, 600));
      return { pools: updatedPools, meta: newMeta };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['arc_pools'], data.pools);
      queryClient.setQueryData(['arc_snapshot'], data.meta);
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    refreshMutation.mutate();
  };

  return {
    pools,
    positions,
    snapshotMeta,
    isRefreshing,
    handleManualRefresh,
  };
}
