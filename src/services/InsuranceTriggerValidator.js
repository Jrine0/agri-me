import { buildInsuranceTrigger, hashPayload, anchorOracleEvent } from './aptosOracleClient';

/**
 * Basic deterministic insurance trigger validator.
 * This file implements lightweight checks before creating an insurance trigger.
 * In production, replace/augment with richer rule engine and oracle-side verification.
 */
export const evaluateClaimSeverity = ({ incidentMetadata = {} }) => {
  // Simple heuristic: severity increases with reported damage_score (0-100)
  const score = typeof incidentMetadata.damage_score === 'number' ? incidentMetadata.damage_score : 50;
  if (score >= 80) return 'critical';
  if (score >= 50) return 'high';
  return 'medium';
};

export const submitInsuranceTrigger = async ({ livestockId, claimType, proofEnvelope, incidentMetadata = {} }) => {
  const proofHash = await hashPayload(proofEnvelope);
  const severity = evaluateClaimSeverity({ incidentMetadata });

  const trigger = buildInsuranceTrigger({ livestockId, claimType, proofHash, severity });

  const envelope = { payload: trigger, proof_hash: proofHash, metadata: incidentMetadata, timestamp: new Date().toISOString() };

  const result = await anchorOracleEvent(envelope);

  return { trigger, proofHash, submitted: !!result.submitted, detail: result };
};

export default { evaluateClaimSeverity, submitInsuranceTrigger };
