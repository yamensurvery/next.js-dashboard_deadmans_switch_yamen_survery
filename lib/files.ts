import { createClient } from "@/lib/supabase/client";
import { encryptBuffer, decryptBuffer } from "@/lib/crypto";

export async function encryptAndUploadFile(
  switchId: string,
  file: File,
  key: CryptoKey
): Promise<{ id: string; storagePath: string }> {
  const supabase = createClient();

  const fileBuffer = await file.arrayBuffer();
  const { iv, ciphertext } = await encryptBuffer(key, fileBuffer);

  const ivBase64 = btoa(String.fromCharCode(...iv));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const storagePath = `${user.id}/${switchId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("encrypted-files")
    .upload(storagePath, ciphertext, {
      contentType: "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: fileRow, error: insertError } = await supabase
    .from("encrypted_files")
    .insert({
      switch_id: switchId,
      file_name: file.name,
      storage_path: storagePath,
      iv: ivBase64,
      size_bytes: ciphertext.byteLength,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Metadata insert failed: ${insertError.message}`);
  }

  return { id: fileRow.id, storagePath };
}

export async function downloadAndDecryptFile(
  storagePath: string,
  ivBase64: string,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from("encrypted-files")
    .download(storagePath);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  const ciphertext = await data.arrayBuffer();
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  return decryptBuffer(key, iv, ciphertext);
}