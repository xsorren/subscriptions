export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'expired';

export type SubscriptionPlan = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    price_amount: number;
    currency: string;
    billing_interval: 'monthly' | 'yearly';
};

export type MySubscription = {
    id: string;
    status: SubscriptionStatus;
    starts_at: string;
    ends_at: string | null;
    plan: SubscriptionPlan;
};

export type SubscriptionPeriod = {
    id: string;
    period_start: string;
    period_end: string;
    status: 'open' | 'closed';
};

export async function getMySubscription(): Promise<MySubscription | null> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
        id: 'sub_pro_1234',
        status: 'active',
        starts_at: new Date(Date.now() - 15 * 86400000).toISOString(), // Empezó hace 15 días
        ends_at: new Date(Date.now() + 15 * 86400000).toISOString(),   // Termina en 15 días
        plan: {
            id: 'plan_pro',
            code: 'PRO_ALL_ACCESS',
            name: 'House Pro All-Access',
            description: 'Acceso ilimitado a todos los deportes y clubes de la red, con hasta 12 pases premium mensuales.',
            price_amount: 35000,
            currency: 'ARS',
            billing_interval: 'monthly'
        }
    };
}

export async function getMySubscriptionPeriods(subscriptionId: string): Promise<SubscriptionPeriod[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
        {
            id: 'period_current',
            period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
            period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
            status: 'open'
        },
        {
            id: 'period_prev',
            period_start: new Date(Date.now() - 45 * 86400000).toISOString(),
            period_end: new Date(Date.now() - 15 * 86400000).toISOString(),
            status: 'closed'
        }
    ];
}
