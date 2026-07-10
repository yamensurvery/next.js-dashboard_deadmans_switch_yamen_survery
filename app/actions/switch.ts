'use server';

import { createClient } from '@/lib/supabase/server';
import { splitKey } from '@/lib/shamir';

export async function createSwitch(
  keyBytes: number[], // serialized Uint8Array from the browser
  recipientEmails: string[],
  threshold: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // 1. Insert the switch row
  const { data: sw, error: swError } = await supabase
    .from('switches')
    .insert({ user_id: user.id, status: 'active', label: 'Test Switch' })
    .select()
    .single();

  if (swError) throw swError;

  // 2. Split the key into shares
  const bytes = new Uint8Array(keyBytes);
  const total = recipientEmails.length;
  const shares = splitKey(bytes, threshold, total);

  // 3. Insert one recipient row per share
  const recipients = recipientEmails.map((email, i) => ({
  switch_id: sw.id,
  name: email, // use email as placeholder name
  email,
  delivery_method: 'email' as const,
  encrypted_payload: shares[i],
}));

  const { error: recError } = await supabase.from('recipients').insert(recipients);
  if (recError) throw recError;

  return sw.id;
}