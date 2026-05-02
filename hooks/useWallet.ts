'use client';

import { useCallback, useState } from 'react';

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string>('');

  const connect = useCallback(async () => {
    const freighter = (window as any).freighterApi;
    if (!freighter) throw new Error('Freighter not found');
    const { address } = await freighter.getAddress();
    setPublicKey(address);
    return address;
  }, []);

  return { publicKey, connect };
}
