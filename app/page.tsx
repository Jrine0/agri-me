'use client';

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { stellarService } from '../services/stellar';

export default function Page() {
  const { publicKey, connect } = useWallet();
  const [data, setData] = useState('');
  const [id, setId] = useState('0');
  const [records, setRecords] = useState<any[]>([]);

  const requireWallet = async () => publicKey || (await connect());

  return (
    <main>
      <h1>Agri Me Soroban</h1>
      <button onClick={connect}>Connect Wallet</button>
      <p>{publicKey || 'Not connected'}</p>

      <button onClick={async () => stellarService.registerUser(await requireWallet())}>Register User</button>

      <div>
        <input value={data} onChange={(e) => setData(e.target.value)} placeholder="record data" />
        <button onClick={async () => stellarService.addRecord(await requireWallet(), data)}>Add Record</button>
      </div>

      <div>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="record id" />
        <input value={data} onChange={(e) => setData(e.target.value)} placeholder="new data" />
        <button onClick={async () => stellarService.updateRecord(await requireWallet(), Number(id), data)}>Update Record</button>
      </div>

      <button
        onClick={async () => {
          const result = await stellarService.getRecords(await requireWallet());
          setRecords(result);
        }}
      >
        Fetch Records
      </button>

      <pre>{JSON.stringify(records, null, 2)}</pre>
    </main>
  );
}
