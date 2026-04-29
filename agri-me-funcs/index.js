const crypto = require('crypto');
const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const firestore = admin.apps.length ? admin.firestore() : null;
const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

const hashRecord = (payload) => {
  return `0x${crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
};

const buildOracleEnvelope = (kind, payload) => {
  const eventHash = hashRecord({ kind, payload, timestamp: new Date().toISOString() });

  return {
    kind,
    eventHash,
    network: 'testnet',
    payload,
    createdAt: new Date().toISOString(),
  };
};

const recordEvent = async (envelope) => {
  if (firestore) {
    await firestore.collection('aptosOracleEvents').add(envelope);
  }

  return envelope;
};

app.get('/health', (_request, response) => {
  response.json({ ok: true, network: 'aptos-testnet', sdk: '@aptos-labs/ts-sdk' });
});

app.post('/oracle/livestock/register', async (request, response) => {
  const envelope = buildOracleEnvelope('livestock.register', request.body);
  const stored = await recordEvent(envelope);
  response.json({ ok: true, stored });
});

app.post('/oracle/iot/event', async (request, response) => {
  const envelope = buildOracleEnvelope('iot.event', request.body);
  const stored = await recordEvent(envelope);
  response.json({ ok: true, stored });
});

app.post('/oracle/reward', async (request, response) => {
  const envelope = buildOracleEnvelope('reward.transfer', request.body);
  const stored = await recordEvent(envelope);
  response.json({ ok: true, stored });
});

app.post('/oracle/insurance/trigger', async (request, response) => {
  const envelope = buildOracleEnvelope('insurance.trigger', request.body);
  const stored = await recordEvent(envelope);
  response.json({ ok: true, stored });
});

app.get('/oracle/verify/:eventHash', async (request, response) => {
  const { eventHash } = request.params;

  if (!firestore) {
    response.json({ ok: true, eventHash, source: 'offline', verified: false });
    return;
  }

  const snapshot = await firestore.collection('aptosOracleEvents').where('eventHash', '==', eventHash).limit(1).get();
  response.json({
    ok: true,
    eventHash,
    verified: !snapshot.empty,
    source: 'firestore',
  });
});

app.post('/oracle/sync', async (request, response) => {
  const payload = request.body || {};
  const anchor = buildOracleEnvelope('oracle.sync', payload);
  const stored = await recordEvent(anchor);
  response.json({ ok: true, stored });
});

module.exports = { app, aptos, buildOracleEnvelope, hashRecord };

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`agri me oracle listening on port ${port}`);
  });
}
