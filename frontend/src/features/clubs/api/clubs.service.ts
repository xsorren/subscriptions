import { supabase } from '../../../core/lib/supabase';
import { invokeEdgeFunction } from '../../../core/lib/edgeFunctions';

export type ClubBranch = {
  id: string;
  name: string;
  address_line: string;
  city: string;
};

export type ClubDetail = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  club_branches: ClubBranch[];
};

export type ClubEligibility = {
  clubId: string;
  availableCoupons: number;
  sports: string[];
};

export async function getClubDetail(clubId: string) {
  const { data, error } = await supabase
    .from('clubs')
    .select('id,name,description,logo_url,club_branches(id,name,address_line,city)')
    .eq('id', clubId)
    .single();

  if (error) throw error;
  return data as ClubDetail;
}

export async function getClubEligibility(clubId: string) {
  return invokeEdgeFunction<ClubEligibility>('club-eligibility', { clubId });
}
