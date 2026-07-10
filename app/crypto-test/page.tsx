"use client";

import { useState } from "react";
import { generateKey, encrypt, decrypt, pack, unpack } from "@/lib/crypto";

export default function CryptoTestPage() {
  const [plaintext, setPlaintext] = useState("");
  const [packed, setPacked] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [key, setKey] = useState<CryptoKey | null>(null);

  async function handleEncrypt() {
    const k = await generateKey();
    setKey(k);
    const { iv, ciphertext } = await encrypt(k, plaintext);
    setPacked(pack(iv, ciphertext));
  }

  async function handleDecrypt() {
    if (!key) return;
    const { iv, ciphertext } = unpack(packed);
    const result = await decrypt(key, iv, ciphertext);
    setDecrypted(result);
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Crypto Test</h1>
      <input
        className="border p-2 w-full"
        placeholder="Enter plaintext"
        value={plaintext}
        onChange={e => setPlaintext(e.target.value)}
      />
      <button onClick={handleEncrypt} className="bg-blue-500 text-white px-4 py-2 rounded">
        Encrypt
      </button>
      {packed && <p className="break-all text-sm text-gray-500">{packed}</p>}
      <button onClick={handleDecrypt} className="bg-green-500 text-white px-4 py-2 rounded">
        Decrypt
      </button>
      {decrypted && <p className="text-green-700">Decrypted: {decrypted}</p>}
    </div>
  );
}