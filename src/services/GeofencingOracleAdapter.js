import { buildOracleEvent, hashPayload, anchorOracleEvent } from './aptosOracleClient';
import { enqueueEvent } from './OfflineEventBuffer';

/**
 * Submit a geofencing violation to the oracle.
 * - builds a minimal payload (only proof refs and metadata)
 * - hashes the payload and attempts to submit to the oracle backend
 * - if the oracle is unavailable, the event is queued for offline sync
 */
export const submitGeofenceViolation = async ({ livestockId, ownerAddress, locationRef, gpsSample = null, metadata = {} }) => {
  const payload = buildOracleEvent({
    eventType: 'geofence_violation',
    livestockId,
    ownerAddress,
    locationRef,
    status: 'intruding',
    metadata: { ...(metadata || {}), gps_sample: gpsSample ? 'offchain_ref' : undefined },
  });

  const eventHash = await hashPayload(payload);

  const envelope = { payload, eventHash, timestamp: new Date().toISOString() };

  const result = await anchorOracleEvent(envelope);

  if (!result.submitted) {
    // queue for offline sync; offline buffer will retry submission
    enqueueEvent(envelope);
  }

  return { eventHash, submitted: !!result.submitted, detail: result };
};

export default { submitGeofenceViolation };
