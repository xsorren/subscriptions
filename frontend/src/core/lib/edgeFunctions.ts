import { supabase } from './supabase';
import { AppError } from '../errors/appError';

export async function invokeEdgeFunction<TResponse>(
  functionName: string,
  body?: unknown
): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new AppError(error.message, `edge_${functionName}_error`, { functionName, body });
  }

  return data as TResponse;
}
