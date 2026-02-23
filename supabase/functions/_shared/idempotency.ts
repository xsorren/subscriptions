import { HttpError } from './errors.ts';
import { supabaseAdmin } from './client.ts';

export async function getExistingRedemptionByIdempotencyKey(userId: string, idempotencyKey: string) {
  const { data, error } = await supabaseAdmin
    .from('coupon_redemptions')
    .select('id,coupon_id,redeemed_at,idempotency_key')
    .eq('staff_user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'idempotency_lookup_failed', 'Failed idempotency lookup', { cause: error.message });
  }

  return data;
}
