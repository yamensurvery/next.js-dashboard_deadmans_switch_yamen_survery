"use client";

import { useState } from "react";
import { generateKey } from "@/lib/crypto";
import { encryptAndUploadFile, downloadAndDecryptFile } from "@/lib/files";

export default function FileTestPage() {
  const [status, setStatus] = useState<string>("");
  const [switchId, setSwitchId] = useState<string>("");

  async function handleTest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Starting...");

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file || !switchId) {
      setStatus("Need both a switch ID and a file.");
      return;
    }

    try {
      setStatus("Generating key...");
      const key = await generateKey();

      setStatus("Encrypting and uploading...");
      const { storagePath } = await encryptAndUploadFile(switchId, file, key);

      // In a real flow you'd fetch the IV back from the DB row.
      // For this test, refetch it directly to keep the test self-contained.
      const res = await fetch(`/api/file-test/iv?path=${encodeURIComponent(storagePath)}`);
      const { iv } = await res.json();

      setStatus("Downloading and decrypting...");
      const decrypted = await downloadAndDecryptFile(storagePath, iv, key);

      const originalBuffer = await file.arrayBuffer();
      const originalBytes = new Uint8Array(originalBuffer);
      const decryptedBytes = new Uint8Array(decrypted);

      const matches =
        originalBytes.length === decryptedBytes.length &&
        originalBytes.every((b, i) => b === decryptedBytes[i]);

      setStatus(matches ? "✅ Round-trip successful, bytes match" : "❌ Mismatch — bytes differ");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>File Encryption Round-Trip Test</h1>
      <form onSubmit={handleTest}>
        <div>
          <label>Switch ID: </label>
          <input
            type="text"
            value={switchId}
            onChange={(e) => setSwitchId(e.target.value)}
            placeholder="paste an existing switch id"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <input type="file" name="file" />
        </div>
        <button type="submit" style={{ marginTop: 12 }}>
          Run Test
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
}