import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { createQrToken } from '../api/coupons.service';

export function useCreateQrToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => createQrToken(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
    },
  });
}
