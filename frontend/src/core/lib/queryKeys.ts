export const queryKeys = {
  coupons: {
    all: ['coupons'] as const,
    me: ['coupons', 'me'] as const,
    detail: (couponId: string) => ['couponDetail', couponId] as const,
  },
  redemptions: {
    all: ['redemptions'] as const,
  },
  map: {
    discover: (params: { lat: number; lng: number; radiusMeters?: number; sportCode?: string }) =>
      ['mapDiscover', params] as const,
  },
  clubs: {
    detail: (clubId: string) => ['clubDetail', clubId] as const,
    eligibility: (clubId: string) => ['clubEligibility', clubId] as const,
  },
};
