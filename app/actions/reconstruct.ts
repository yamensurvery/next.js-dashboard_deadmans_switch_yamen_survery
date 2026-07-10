'use server';

import { createClient } from '@/lib/supabase/server';
import { combineShares } from '@/lib/shamir';

export async function reconstructKey(switchId: string): Promise<number[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('recipients')
    .select('encrypted_payload')
    .eq('switch_id', switchId);

  if (error) throw error;

  const shares = data
    .map((r) => r.encrypted_payload)
    .filter(Boolean) as string[];

  const keyBytes = combineShares(shares);
  return Array.from(keyBytes);
}