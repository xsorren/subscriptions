import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { assertUuid } from '../_shared/validation.ts';

type ClubEligibilityRequest = {
  clubId?: string;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<ClubEligibilityRequest>(req);
    const clubId = assertUuid(body.clubId, 'clubId');

    const { data, error } = await supabaseAdmin
      .from('v_user_eligible_club_offers')
      .select('available_coupons,sport_id')
      .eq('user_id', user.id)
      .eq('club_id', clubId);

    if (error) {
      throw new HttpError(500, 'eligibility_lookup_failed', 'Could not fetch eligibility', { cause: error.message });
    }

    const availableCoupons = (data ?? []).reduce((acc, row) => acc + Number(row.available_coupons ?? 0), 0);
    const sports = Array.from(new Set((data ?? []).map((row) => String(row.sport_id))));

    return jsonResponse({
      clubId,
      availableCoupons,
      sports,
      eligible: availableCoupons > 0,
      reasons: availableCoupons > 0 ? [] : ['no_available_coupons_for_club'],
    });
  } catch (error) {
    return errorResponse(error);
  }
});
