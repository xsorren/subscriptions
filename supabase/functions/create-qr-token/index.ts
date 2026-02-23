import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { logError, logInfo } from '../_shared/telemetry.ts';
import { assertUuid } from '../_shared/validation.ts';

type CreateQrTokenRequest = {
  couponId?: string;
  couponInstanceId?: string;
  idempotencyKey?: string;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<CreateQrTokenRequest>(req);
    const couponId = assertUuid(body.couponId ?? body.couponInstanceId, 'couponId');

    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('id,user_id,status')
      .eq('id', couponId)
      .maybeSingle();

    if (couponError) {
      throw new HttpError(500, 'coupon_lookup_failed', 'Could not load coupon', { cause: couponError.message });
    }

    if (!coupon) throw new HttpError(404, 'coupon_not_found', 'Coupon not found');
    if (coupon.user_id !== user.id) throw new HttpError(403, 'coupon_not_owned', 'Coupon does not belong to the authenticated user');
    if (coupon.status !== 'available') throw new HttpError(409, 'coupon_not_available', 'Coupon is not available');

    const { data: existingActive, error: existingError } = await supabaseAdmin
      .from('qr_tokens')
      .select('nonce,expires_at')
      .eq('coupon_id', couponId)
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw new HttpError(500, 'qr_lookup_failed', 'Could not lookup existing qr token', { cause: existingError.message });
    }

    if (existingActive) {
      return jsonResponse({ token: existingActive.nonce, nonce: existingActive.nonce, expiresAt: existingActive.expires_at });
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const nonce = crypto.randomUUID().replaceAll('-', '');

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('qr_tokens')
      .insert({
        user_id: user.id,
        coupon_id: couponId,
        nonce,
        expires_at: expiresAt,
      })
      .select('nonce,expires_at')
      .single();

    if (insertError) {
      throw new HttpError(500, 'qr_create_failed', 'Could not create qr token', { cause: insertError.message });
    }

    logInfo('qr_generated', { userId: user.id, couponId, expiresAt: inserted.expires_at });
    return jsonResponse({ token: inserted.nonce, nonce: inserted.nonce, expiresAt: inserted.expires_at });
  } catch (error) {
    logError('create_qr_token_failed', { error: error instanceof Error ? error.message : 'unknown_error' });
    return errorResponse(error);
  }
});
