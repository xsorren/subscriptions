import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getClubEligibility } from '../api/clubs.service';

export function useClubEligibility(clubId: string) {
  return useQuery({
    queryKey: queryKeys.clubs.eligibility(clubId),
    queryFn: () => getClubEligibility(clubId),
    enabled: Boolean(clubId),
  });
}
