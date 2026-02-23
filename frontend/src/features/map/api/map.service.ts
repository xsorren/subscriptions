import { invokeEdgeFunction } from '../../../core/lib/edgeFunctions';

export type DiscoverParams = {
  lat: number;
  lng: number;
  radiusMeters?: number;
  sportCode?: string;
};

export type EligibleClub = {
  clubId: string;
  clubBranchId: string;
  name: string;
  lat: number;
  lng: number;
  availableCoupons: number;
};

export async function discoverEligibleClubs(params: DiscoverParams) {
  return invokeEdgeFunction<EligibleClub[]>('map-discover', params);
}
