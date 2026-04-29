import { anchorOracleEvent } from './aptosOracleClient';

const QUEUE_KEY = 'agri_me_offline_event_queue_v1';

const readQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('OfflineEventBuffer read error', e);
    return [];
  }
};

const writeQueue = (q) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    console.error('OfflineEventBuffer write error', e);
  }
};

export const enqueueEvent = (envelope) => {
  const q = readQueue();
  q.push(envelope);
  writeQueue(q);
};

export const getQueuedEvents = () => readQueue();

export const flushQueue = async () => {
  const q = readQueue();
  if (!q.length) return { flushed: 0 };

  const results = [];

  for (const envelope of q) {
    try {
      const res = await anchorOracleEvent(envelope);
      results.push({ envelope, ok: !!res.submitted });
    } catch (e) {
      results.push({ envelope, ok: false, error: e.message });
    }
  }

  const remaining = results.filter((r) => !r.ok).map((r) => r.envelope);
  writeQueue(remaining);

  return { flushed: results.length - remaining.length, remaining: remaining.length, results };
};

export default { enqueueEvent, getQueuedEvents, flushQueue };
