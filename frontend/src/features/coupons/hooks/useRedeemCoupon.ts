import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { redeemCoupon, RedeemCouponInput } from '../api/coupons.service';

export function useRedeemCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RedeemCouponInput) => redeemCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.redemptions.all });
    },
  });
}
