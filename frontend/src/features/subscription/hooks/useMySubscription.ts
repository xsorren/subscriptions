import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getMySubscription } from '../api/subscription.service';

export function useMySubscription() {
    return useQuery({
        queryKey: queryKeys.subscription.active,
        queryFn: getMySubscription,
    });
}
