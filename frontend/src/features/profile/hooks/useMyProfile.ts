import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/lib/queryKeys';
import { getMyProfile } from '../api/profile.service';

export function useMyProfile() {
    return useQuery({
        queryKey: queryKeys.profile.me,
        queryFn: getMyProfile,
    });
}
