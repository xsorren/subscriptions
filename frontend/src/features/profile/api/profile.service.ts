export type UserProfile = {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    locale: string;
    timezone: string;
    is_active: boolean;
    created_at: string;
};

export async function getMyProfile(): Promise<UserProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        id: 'mock-user-id',
        full_name: 'Santiago Investor',
        phone: '+54 9 11 4455 6677',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        locale: 'es-AR',
        timezone: 'America/Argentina/Buenos_Aires',
        is_active: true,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString() // Creado hace 2 meses
    };
}

export async function updateMyProfile(updates: { full_name?: string; phone?: string }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[Mock] Profile updated:', updates);
}
