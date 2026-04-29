const DEFAULT_ORACLE_ENDPOINT = '/api/aptos/oracle';
const DEFAULT_NETWORK = 'testnet';

export const SUPPORTED_APTOS_WALLETS = ['Petra', 'Martian'];

export const getOracleEndpoint = () =>
  process.env.REACT_APP_AGRIME_ORACLE_ENDPOINT || DEFAULT_ORACLE_ENDPOINT;

export const getAptosNetwork = () =>
  process.env.REACT_APP_APTOS_NETWORK || DEFAULT_NETWORK;

export const formatShortAddress = (address) => {
  if (!address) {
    return 'unconnected';
  }

  return address.length > 12 ? `${address.slice(0, 8)}...${address.slice(-4)}` : address;
};

const fallbackHash = (value) => {
  let hash = 0;
  const text = typeof value === 'string' ? value : JSON.stringify(value);

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
};

export const hashPayload = async (payload) => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);

  if (window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return `0x${Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  return fallbackHash(text);
};

export const connectAptosWallet = async () => {
  if (!window.aptos) {
    throw new Error('No Aptos wallet detected. Install Petra or Martian to continue.');
  }

  const account = await window.aptos.connect();

  return {
    address: account?.address || account?.publicKey || window.aptos.address || null,
    walletName: window.aptos.walletName || 'Aptos Wallet',
    provider: window.aptos,
  };
};

export const buildLivestockRecord = ({ id, ownerAddress, gpsReference, status = 'safe', metadata = {} }) => ({
  livestock_id: id,
  owner_address: ownerAddress,
  gps_reference: gpsReference,
  status,
  metadata,
});

export const buildOracleEvent = ({
  eventType,
  livestockId,
  ownerAddress,
  locationRef,
  status = 'safe',
  metadata = {},
}) => ({
  event_type: eventType,
  livestock_id: livestockId,
  owner_address: ownerAddress,
  location_ref: locationRef,
  status,
  metadata,
  network: getAptosNetwork(),
});

export const buildRewardTransfer = ({ recipient, amount, reason, source = 'agri-me', metadata = {} }) => ({
  recipient,
  amount,
  reason,
  source,
  metadata,
});

export const buildInsuranceTrigger = ({ livestockId, claimType, proofHash, severity = 'medium' }) => ({
  livestock_id: livestockId,
  claim_type: claimType,
  proof_hash: proofHash,
  severity,
  network: getAptosNetwork(),
});

export const anchorOracleEvent = async (payload) => {
  const eventHash = await hashPayload(payload);
  const request = {
    event_hash: eventHash,
    payload,
    network: getAptosNetwork(),
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(getOracleEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Oracle endpoint returned ${response.status}`);
    }

    const data = await response.json();

    return {
      ok: true,
      submitted: true,
      eventHash,
      data,
    };
  } catch (error) {
    return {
      ok: true,
      submitted: false,
      eventHash,
      note: 'Oracle backend unavailable; event hashed locally for offline sync.',
      error: error.message,
    };
  }
};

export const summarizeAptosEvent = (payload) => ({
  eventHash: fallbackHash(payload),
  payload,
  network: getAptosNetwork(),
});