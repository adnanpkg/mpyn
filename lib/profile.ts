import { supabase } from './supabase';

export interface Profile {
  id: string;
  role: 'creator' | 'business';
  state: string;
  city: string;
  username: string | null;
  email: string | null;
  phone: string | null;
}

export interface CreatorProfile {
  id: string;
  instagram_handle: string | null;
  bio: string | null;
  content_categories: string[];
  gig_charge: number | null;
  portfolio_url: string | null;
  profile_complete: boolean;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  const { data } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export function needsCreatorSetup(
  profile: Profile | null,
  creatorProfile: CreatorProfile | null
): boolean {
  return profile?.role === 'creator' && !creatorProfile?.profile_complete;
}
