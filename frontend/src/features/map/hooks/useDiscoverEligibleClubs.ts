import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { discoverEligibleClubs } from '../api/map.service';

type Params = {
  lat: number;
  lng: number;
  radiusMeters?: number;
  sportCode?: string;
};

export function useDiscoverEligibleClubs(params: Params, enabled = true) {
  return useQuery({
    queryKey: queryKeys.map.discover(params),
    queryFn: () => discoverEligibleClubs(params),
    enabled,
  });
}
