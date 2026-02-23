import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';

type RedemptionHistoryRequest = {
  scope?: 'me' | 'staff';
  page?: number;
  pageSize?: number;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<RedemptionHistoryRequest>(req);

    const scope = body.scope === 'staff' ? 'staff' : 'me';
    const page = Number.isFinite(body.page) ? Math.max(1, Number(body.page)) : 1;
    const pageSize = Number.isFinite(body.pageSize) ? Math.min(100, Math.max(1, Number(body.pageSize))) : 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from('coupon_redemptions')
      .select('id,coupon_id,club_branch_id,staff_user_id,redeemed_at,idempotency_key', { count: 'exact' })
      .order('redeemed_at', { ascending: false })
      .range(from, to);

    if (scope === 'staff') {
      query = query.eq('staff_user_id', user.id);
    } else {
      query = query.in(
        'coupon_id',
        (
          await supabaseAdmin
            .from('coupons')
            .select('id')
            .eq('user_id', user.id)
        ).data?.map((row) => row.id) ?? ['00000000-0000-0000-0000-000000000000']
      );
    }

    const { data, error, count } = await query;
    if (error) throw new HttpError(500, 'redemption_history_failed', 'Could not load redemption history', { cause: error.message });

    return jsonResponse({
      items: data ?? [],
      pagination: { page, pageSize, total: count ?? 0 },
    });
  } catch (error) {
    return errorResponse(error);
  }
});
