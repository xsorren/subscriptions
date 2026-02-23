import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getClubDetail } from '../api/clubs.service';

export function useClubDetail(clubId: string) {
  return useQuery({
    queryKey: queryKeys.clubs.detail(clubId),
    queryFn: () => getClubDetail(clubId),
    enabled: Boolean(clubId),
  });
}
