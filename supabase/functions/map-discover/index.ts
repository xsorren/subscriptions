import { supabaseAdmin } from '../_shared/client.ts';
import { requireUser } from '../_shared/auth.ts';
import { HttpError } from '../_shared/errors.ts';
import { errorResponse, handleOptions, jsonResponse, parseJsonBody } from '../_shared/http.ts';
import { assertNumber } from '../_shared/validation.ts';

type MapDiscoverRequest = {
  lat?: number;
  lng?: number;
  radiusMeters?: number;
};

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(s1 + s2));
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST' } }, 405);

  try {
    const user = await requireUser(req);
    const body = await parseJsonBody<MapDiscoverRequest>(req);

    const lat = assertNumber(body.lat, 'lat');
    const lng = assertNumber(body.lng, 'lng');
    const radiusMeters = typeof body.radiusMeters === 'number' ? Math.max(100, Math.min(body.radiusMeters, 50000)) : 3000;

    const { data: offers, error: offersError } = await supabaseAdmin
      .from('v_user_eligible_club_offers')
      .select('club_id,club_branch_id,available_coupons')
      .eq('user_id', user.id);

    if (offersError) {
      throw new HttpError(500, 'map_discover_failed', 'Could not discover eligible offers', { cause: offersError.message });
    }

    const branchIds = Array.from(new Set((offers ?? []).map((row) => row.club_branch_id)));
    if (branchIds.length === 0) return jsonResponse([]);

    const { data: branches, error: branchesError } = await supabaseAdmin
      .from('club_branches')
      .select('id,club_id,name,location')
      .in('id', branchIds)
      .eq('is_active', true);

    if (branchesError) {
      throw new HttpError(500, 'map_discover_failed', 'Could not fetch branches', { cause: branchesError.message });
    }

    const { data: clubs, error: clubsError } = await supabaseAdmin
      .from('clubs')
      .select('id,name')
      .in('id', Array.from(new Set((branches ?? []).map((b) => b.club_id))));

    if (clubsError) {
      throw new HttpError(500, 'map_discover_failed', 'Could not fetch clubs', { cause: clubsError.message });
    }

    const clubNameById = new Map((clubs ?? []).map((c) => [c.id as string, c.name as string]));
    const offerByBranch = new Map((offers ?? []).map((o) => [o.club_branch_id as string, Number(o.available_coupons ?? 0)]));

    const items = (branches ?? [])
      .map((branch) => {
        const locationRaw = branch.location;
        let bLat: number | null = null;
        let bLng: number | null = null;

        if (typeof locationRaw === 'string') {
          const match = locationRaw.match(/POINT\((-?[0-9.]+) (-?[0-9.]+)\)/i);
          if (match) {
            bLng = Number(match[1]);
            bLat = Number(match[2]);
          }
        } else if (locationRaw && typeof locationRaw === 'object' && 'coordinates' in locationRaw) {
          const coordinates = (locationRaw as { coordinates?: [number, number] }).coordinates;
          if (coordinates && coordinates.length === 2) {
            bLng = Number(coordinates[0]);
            bLat = Number(coordinates[1]);
          }
        }

        if (bLat === null || bLng === null) return null;
        const meters = distanceMeters(lat, lng, bLat, bLng);
        return {
          clubId: String(branch.club_id),
          clubBranchId: String(branch.id),
          name: clubNameById.get(String(branch.club_id)) ?? String(branch.name),
          lat: bLat,
          lng: bLng,
          distanceMeters: meters,
          availableCoupons: offerByBranch.get(String(branch.id)) ?? 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter((item) => item.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return jsonResponse(items);
  } catch (error) {
    return errorResponse(error);
  }
});
