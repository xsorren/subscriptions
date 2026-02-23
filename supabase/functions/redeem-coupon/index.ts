import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { getExistingRedemptionByIdempotencyKey } from '../_shared/idempotency.ts';
import { logError, logInfo } from '../_shared/telemetry.ts';
import { assertString, assertUuid } from '../_shared/validation.ts';

type RedeemCouponRequest = {
  qrNonce?: string;
  clubBranchId?: string;
  idempotencyKey?: string;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<RedeemCouponRequest>(req);
    const qrNonce = assertString(body.qrNonce, 'qrNonce');
    const clubBranchId = assertUuid(body.clubBranchId, 'clubBranchId');
    const idempotencyKey = assertString(body.idempotencyKey, 'idempotencyKey');

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('club_staff_assignments')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('club_branch_id', clubBranchId)
      .eq('is_active', true)
      .maybeSingle();

    if (assignmentError) {
      throw new HttpError(500, 'staff_lookup_failed', 'Could not verify staff permissions', { cause: assignmentError.message });
    }

    if (!assignment) {
      throw new HttpError(403, 'not_authorized_branch', 'User is not authorized to redeem at this branch');
    }

    const existing = await getExistingRedemptionByIdempotencyKey(user.id, idempotencyKey);
    if (existing) {
      return jsonResponse({
        redemptionId: existing.id,
        couponId: existing.coupon_id,
        redeemedAt: existing.redeemed_at,
        status: 'ok',
      });
    }

    const { data, error } = await supabaseAdmin.rpc('redeem_coupon', {
      p_qr_nonce: qrNonce,
      p_club_branch_id: clubBranchId,
      p_staff_user_id: user.id,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('inválido') || message.includes('invalid')) {
        throw new HttpError(404, 'qr_not_found', error.message);
      }
      if (message.includes('ya utilizado') || message.includes('already')) {
        throw new HttpError(409, 'qr_already_used', error.message);
      }
      if (message.includes('expirado') || message.includes('expired')) {
        throw new HttpError(409, 'qr_expired', error.message);
      }
      if (message.includes('no disponible')) {
        throw new HttpError(409, 'coupon_not_redeemable', error.message);
      }

      throw new HttpError(500, 'redeem_failed', 'Redemption failed', { cause: error.message });
    }

    const redemptionId = data as string;

    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from('coupon_redemptions')
      .select('id,coupon_id,redeemed_at')
      .eq('id', redemptionId)
      .single();

    if (redemptionError) {
      throw new HttpError(500, 'redemption_lookup_failed', 'Redemption created but could not be fetched', {
        cause: redemptionError.message,
      });
    }

    logInfo('coupon_redeemed', {
      redemptionId: redemption.id,
      couponId: redemption.coupon_id,
      clubBranchId,
      staffUserId: user.id,
    });

    return jsonResponse({
      redemptionId: redemption.id,
      couponId: redemption.coupon_id,
      redeemedAt: redemption.redeemed_at,
      status: 'ok',
    });
  } catch (error) {
    logError('redeem_coupon_failed', { error: error instanceof Error ? error.message : 'unknown_error' });
    return errorResponse(error);
  }
});
