import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { assertUuid } from '../_shared/validation.ts';

type CouponDetailRequest = {
  couponId?: string;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<CouponDetailRequest>(req);
    const couponId = assertUuid(body.couponId, 'couponId');

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select(`
        id,
        user_id,
        status,
        sport_id,
        expires_at,
        metadata,
        coupon_redemptions(id,club_branch_id,staff_user_id,redeemed_at)
      `)
      .eq('id', couponId)
      .maybeSingle();

    if (error) throw new HttpError(500, 'coupon_detail_failed', 'Could not fetch coupon detail', { cause: error.message });
    if (!data) throw new HttpError(404, 'coupon_not_found', 'Coupon not found');
    if (data.user_id !== user.id) throw new HttpError(403, 'coupon_not_owned', 'Coupon does not belong to user');

    return jsonResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
});
