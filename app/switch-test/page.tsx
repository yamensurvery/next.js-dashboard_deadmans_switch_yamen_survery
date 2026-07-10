'use client';

import { useState } from 'react';
import { generateKey, exportKey, deriveKey } from '@/lib/crypto';
import { createSwitch } from '@/app/actions/switch';
import { reconstructKey } from '@/app/actions/reconstruct';

const TEST_EMAILS = ['alice@example.com', 'bob@example.com', 'carol@example.com'];
const THRESHOLD = 2;

export default function SwitchTestPage() {
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function run() {
    setLog([]);
    try {
      // 1. Generate key
      const key = await generateKey();
      const keyBytes = await exportKey(key);
      const originalHex = toHex(keyBytes);
      addLog(`✅ Generated AES key (${keyBytes.length} bytes)`);
      addLog(`   Original: ${originalHex}`);

      // 2. Create switch + store shares
      const switchId = await createSwitch(Array.from(keyBytes), TEST_EMAILS, THRESHOLD);
      addLog(`\n✅ Switch created: ${switchId}`);

      // 3. Reconstruct from DB
      const reconstructedArr = await reconstructKey(switchId);
      const reconstructedHex = toHex(new Uint8Array(reconstructedArr));
      addLog(`\n✅ Reconstructed from DB shares`);
      addLog(`   Reconstructed: ${reconstructedHex}`);

      // 4. Verify
      const match = originalHex === reconstructedHex;
      addLog(`\n${match ? '✅ MATCH — end-to-end round-trip works!' : '❌ MISMATCH'}`);
    } catch (err) {
      addLog(`❌ Error: ${err}`);
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-bold mb-4">Switch Creation Test</h1>
      <button
        onClick={run}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Run End-to-End Test
      </button>
      <div className="bg-gray-900 text-green-400 p-4 rounded text-sm whitespace-pre-wrap">
        {log.length === 0 ? 'Press Run End-to-End Test to start…' : log.join('\n')}
      </div>
    </main>
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}