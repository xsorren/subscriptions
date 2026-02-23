import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getCouponById } from '../api/coupons.service';

export function useCouponDetail(couponId: string) {
  return useQuery({
    queryKey: queryKeys.coupons.detail(couponId),
    queryFn: () => getCouponById(couponId),
    enabled: Boolean(couponId),
  });
}
