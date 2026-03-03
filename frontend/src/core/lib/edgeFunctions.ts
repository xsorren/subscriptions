import { supabase } from './supabase';
import { AppError } from '../errors/appError';

export async function invokeEdgeFunction<TResponse>(
  functionName: string,
  body?: unknown
): Promise<TResponse> {
  // Mock implementations for presentation/static mode
  if (functionName === 'redemption-history') {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'red_1',
        coupon_id: 'c4',
        redeemed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        club_branch_id: 'branch_p2',
        club_name: 'El Balcón Padel',
        branch_name: 'Sede Caballito'
      },
      {
        id: 'red_2',
        coupon_id: 'c6',
        redeemed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        club_branch_id: 'branch_g1',
        club_name: 'SportClub',
        branch_name: 'Sede Belgrano'
      }
    ] as unknown as TResponse;
  }

  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new AppError(error.message, `edge_${functionName}_error`, { functionName, body });
  }

  return data as TResponse;
}
