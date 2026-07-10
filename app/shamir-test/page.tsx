'use client';

import { useState } from 'react';
import { generateKey, exportKey } from '@/lib/crypto';
import { splitKey, combineShares } from '@/lib/shamir';

export default function ShamirTestPage() {
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function runTest() {
    setLog([]);
    try {
      // 1. Generate a fresh AES-GCM key
      const key = await generateKey();
      const keyBytes = await exportKey(key);
      addLog(`✅ Generated AES key (${keyBytes.length} bytes)`);
      addLog(`   Original hex: ${toHex(keyBytes)}`);

      // 2. Split into 5 shares, threshold = 3
      const shares = splitKey(keyBytes, 3, 5);
      addLog(`\n✅ Split into 5 shares (threshold = 3):`);
      shares.forEach((s, i) => addLog(`   Share ${i + 1}: ${s.slice(0, 32)}…`));

      // 3. Reconstruct from shares 1, 3, 5 only (subset of 3)
      const subset = [shares[0], shares[2], shares[4]];
      const reconstructed = combineShares(subset);
      addLog(`\n✅ Reconstructed from shares 1, 3, 5:`);
      addLog(`   Reconstructed hex: ${toHex(reconstructed)}`);

      // 4. Verify
      const match = toHex(keyBytes) === toHex(reconstructed);
      addLog(`\n${match ? '✅ MATCH — keys are identical!' : '❌ MISMATCH — something went wrong'}`);
    } catch (err) {
      addLog(`❌ Error: ${err}`);
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-bold mb-4">Shamir&apos;s Secret Sharing Test</h1>
      <button
        onClick={runTest}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Run Test
      </button>
      <div className="bg-gray-900 text-green-400 p-4 rounded text-sm whitespace-pre-wrap">
        {log.length === 0 ? 'Press Run Test to start…' : log.join('\n')}
      </div>
    </main>
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}