export type CouponStatus = 'available' | 'reserved' | 'redeemed' | 'expired' | 'canceled';

export type CouponListItem = {
  id: string;
  status: CouponStatus;
  sport_id: number;
  expires_at: string | null;
  metadata: {
    club_name?: string;
    sport_name?: string;
    service_name?: string;
    image_url?: any;
    redeemed_at?: string;
  };
};

export type RedeemCouponInput = {
  qrNonce: string;
  clubBranchId: string;
  idempotencyKey: string;
};

export type RedeemCouponResult = {
  redemptionId: string;
  status: 'ok';
};

const mockCoupons: CouponListItem[] = [
  { 
    id: 'c1', 
    status: 'available', 
    sport_id: 1, 
    expires_at: new Date(Date.now() + 86400000 * 3).toISOString(), 
    metadata: { 
      club_name: 'Padel House Palermo',
      sport_name: 'Pádel',
      service_name: 'Turno 90 min - Cancha Cristal',
      image_url: require('../../../../assets/mock-images/padel.jpg')
    } 
  },
  { 
    id: 'c2', 
    status: 'available', 
    sport_id: 2, 
    expires_at: new Date(Date.now() + 86400000 * 5).toISOString(), 
    metadata: { 
      club_name: 'SportClub Belgrano',
      sport_name: 'Gimnasio',
      service_name: 'Pase Libre Musculación',
      image_url: require('../../../../assets/mock-images/gym.jpg')
    } 
  },
  { 
    id: 'c3', 
    status: 'available', 
    sport_id: 3, 
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(), 
    metadata: { 
      club_name: 'AquaCenter Recoleta',
      sport_name: 'Natación',
      service_name: 'Pileta Libre 60 min',
      image_url: require('../../../../assets/mock-images/swim.jpg')
    } 
  },
  { 
    id: 'c4', 
    status: 'redeemed', 
    sport_id: 1, 
    expires_at: new Date(Date.now() - 86400000 * 2).toISOString(), 
    metadata: { 
      club_name: 'El Balcón Padel',
      sport_name: 'Pádel',
      service_name: 'Turno 90 min',
      image_url: require('../../../../assets/mock-images/padel2.jpg'),
      redeemed_at: new Date(Date.now() - 86400000 * 3).toISOString()
    } 
  },
  { 
    id: 'c5', 
    status: 'expired', 
    sport_id: 4, 
    expires_at: new Date(Date.now() - 86400000 * 10).toISOString(), 
    metadata: { 
      club_name: 'CrossFit Rex',
      sport_name: 'Crossfit',
      service_name: 'Clase WOD',
      image_url: require('../../../../assets/mock-images/crossfit.jpg')
    } 
  },
];

export async function getMyCoupons() {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockCoupons;
}

export async function getCouponById(couponId: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const coupon = mockCoupons.find(c => c.id === couponId) || mockCoupons[0];
  return coupon;
}

export async function createQrToken(couponId: string) {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simula tiempo de generación
  return { token: `mock-qr-${Math.random().toString(36).substring(7)}`, expiresAt: new Date(Date.now() + 60000).toISOString() };
}

export async function redeemCoupon(input: RedeemCouponInput) {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simula validación compleja
  return { redemptionId: `red-${Math.random().toString(36).substring(7)}`, status: 'ok' as const };
}
