import { supabase } from '../../../core/lib/supabase';
import { invokeEdgeFunction } from '../../../core/lib/edgeFunctions';

export type CouponStatus = 'available' | 'reserved' | 'redeemed' | 'expired' | 'canceled';

export type CouponListItem = {
  id: string;
  status: CouponStatus;
  sport_id: number;
  expires_at: string | null;
  metadata: Record<string, unknown>;
};

export type RedeemCouponInput = {
  qrNonce: string;
  clubBranchId: string;
  idempotencyKey: string;
};

export type RedeemCouponResult = {
  redemptionId: string;
  status: 'ok';
};

export async function getMyCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('id,status,sport_id,expires_at,metadata')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CouponListItem[];
}

export async function getCouponById(couponId: string) {
  const { data, error } = await supabase
    .from('coupons')
    .select('id,status,sport_id,expires_at,metadata')
    .eq('id', couponId)
    .single();

  if (error) throw error;
  return data as CouponListItem;
}

export async function createQrToken(couponId: string) {
  return invokeEdgeFunction<{ token: string; expiresAt: string }>('create-qr-token', {
    couponId,
  });
}

export async function redeemCoupon(input: RedeemCouponInput) {
  return invokeEdgeFunction<RedeemCouponResult>('redeem-coupon', {
    qrNonce: input.qrNonce,
    clubBranchId: input.clubBranchId,
    idempotencyKey: input.idempotencyKey,
  });
}
