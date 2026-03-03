import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { invokeEdgeFunction } from '../../../core/lib/edgeFunctions';

export type RedemptionHistoryItem = {
    id: string;
    coupon_id: string;
    redeemed_at: string;
    club_branch_id: string;
    club_name?: string;
    branch_name?: string;
};

async function getRedemptionHistory(): Promise<RedemptionHistoryItem[]> {
    return invokeEdgeFunction<RedemptionHistoryItem[]>('redemption-history', {});
}

export function useRedemptionHistory(enabled = true) {
    return useQuery({
        queryKey: queryKeys.redemptions.history,
        queryFn: getRedemptionHistory,
        enabled,
    });
}
