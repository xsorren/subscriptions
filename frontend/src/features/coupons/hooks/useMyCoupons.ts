import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getMyCoupons } from '../api/coupons.service';

export function useMyCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons.me,
    queryFn: getMyCoupons,
  });
}
