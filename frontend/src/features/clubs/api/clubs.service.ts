export type ClubBranch = {
  id: string;
  name: string;
  address_line: string;
  city: string;
  lat: number;
  lng: number;
};

export type ClubDetail = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  club_branches: ClubBranch[];
};

export type ClubEligibility = {
  clubId: string;
  availableCoupons: number;
  sports: string[];
};

const MOCK_CLUBS_DATA: Record<string, ClubDetail> = {
  'club_padel_1': {
        id: 'club_padel_1',
        name: 'Padel House',
        description: 'El club de pádel más exclusivo de la ciudad. Contamos con 8 canchas indoor panorámicas de última generación, iluminación LED profesional, vestuarios premium y un bar/restaurante para el tercer tiempo.',
        logo_url: 'https://ui-avatars.com/api/?name=Padel+House&background=1c1c1e&color=facc15&size=200',
        cover_url: require('../../../../assets/mock-images/padel.jpg'),
        club_branches: [
          { id: 'branch_p1', name: 'Sede Palermo (Indoor)', address_line: 'Honduras 5500', city: 'CABA', lat: -34.5885, lng: -58.4305 },
          { id: 'branch_p1_2', name: 'Sede Núñez (Outdoor)', address_line: 'Av. del Libertador 7500', city: 'CABA', lat: -34.5452, lng: -58.4552 }
        ]
      },
      'club_gym_1': {
        id: 'club_gym_1',
        name: 'SportClub',
        description: 'Cadena líder de gimnasios. Equipamiento de musculación importado, zona de peso libre, cardio y amplios salones para clases grupales (Spinning, Yoga, Funcional).',
        logo_url: 'https://ui-avatars.com/api/?name=Sport+Club&background=1c1c1e&color=facc15&size=200',
        cover_url: require('../../../../assets/mock-images/gym.jpg'),
        club_branches: [
          { id: 'branch_g1', name: 'Sede Belgrano', address_line: 'Cabildo 2000', city: 'CABA', lat: -34.5621, lng: -58.4552 }
        ]
      }
    };
    
    export async function getClubDetail(clubId: string) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Devuelve el club si existe en el mock, o genera uno genérico
      if (MOCK_CLUBS_DATA[clubId]) {
        return MOCK_CLUBS_DATA[clubId];
      }
    
      return {
        id: clubId,
        name: 'Club Premium Generico',
        description: 'Un espacio integral dedicado al deporte y el bienestar físico, con las mejores instalaciones de la zona.',       
        logo_url: 'https://ui-avatars.com/api/?name=Club&background=1c1c1e&color=facc15&size=200',
        cover_url: require('../../../../assets/mock-images/generic_club.jpg'),
        club_branches: [      { id: 'branch_gen_1', name: 'Sede Central', address_line: 'Av. Falsa 123', city: 'CABA', lat: -34.6037, lng: -58.3816 }
    ]
  } as ClubDetail;
}

export async function getClubEligibility(clubId: string) {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simulamos elegibilidad variada
  const available = clubId === 'club_cross_1' ? 0 : (clubId === 'club_gym_1' ? 2 : 1);
  
  return {
    clubId,
    availableCoupons: available,
    sports: ['Pádel', 'Gimnasio', 'Natación'] // En la vida real dependería del club
  } as ClubEligibility;
}
