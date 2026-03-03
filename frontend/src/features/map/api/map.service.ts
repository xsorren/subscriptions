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
  distanceMeters?: number;
  sport: string;
  image_url: any;
};

const mockClubs: EligibleClub[] = [
  { 
    clubId: 'club_padel_1', 
    clubBranchId: 'branch_p1', 
    name: 'Padel House Palermo', 
    lat: -34.5885, lng: -58.4305, 
    availableCoupons: 1, 
    distanceMeters: 450,
    sport: 'Pádel',
    image_url: require('../../../../assets/mock-images/padel.jpg')
  },
  { 
    clubId: 'club_gym_1', 
    clubBranchId: 'branch_g1', 
    name: 'SportClub Belgrano', 
    lat: -34.5621, lng: -58.4552, 
    availableCoupons: 2, 
    distanceMeters: 1200,
    sport: 'Gimnasio',
    image_url: require('../../../../assets/mock-images/gym.jpg')
  },
  { 
    clubId: 'club_swim_1', 
    clubBranchId: 'branch_s1', 
    name: 'AquaCenter Recoleta', 
    lat: -34.5878, lng: -58.3970, 
    availableCoupons: 1, 
    distanceMeters: 2300,
    sport: 'Natación',
    image_url: require('../../../../assets/mock-images/swim.jpg')
  },
  { 
    clubId: 'club_cross_1', 
    clubBranchId: 'branch_c1', 
    name: 'CrossFit Rex Puerto Madero', 
    lat: -34.6118, lng: -58.3646, 
    availableCoupons: 0, 
    distanceMeters: 3500,
    sport: 'Crossfit',
    image_url: require('../../../../assets/mock-images/crossfit.jpg')
  },
  { 
    clubId: 'club_padel_2', 
    clubBranchId: 'branch_p2', 
    name: 'El Balcón Padel Caballito', 
    lat: -34.6200, lng: -58.4400, 
    availableCoupons: 1, 
    distanceMeters: 4200,
    sport: 'Pádel',
    image_url: require('../../../../assets/mock-images/padel2.jpg')
  },
];

export async function discoverEligibleClubs(params: DiscoverParams) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Opcional: ordenar por distancia simulada si se requiere más realismo
  return mockClubs.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}
