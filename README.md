# agri me

agri me is a production-focused Aptos-based agri‑tech platform that prevents livestock conflicts by combining IoT telemetry, computer vision, and deterministic on‑chain verification. The system keeps raw device telemetry and AI models off‑chain (in Firebase and edge devices), while Aptos stores verifiable ownership, event proofs (hashes), rewards, and insurance trigger events as auditable Move resources and events.

## Product Overview

- Onboard livestock to an on‑chain registry with immutable ownership records.
- Anchor geofence violations, intrusion alerts, and verified events using a trusted oracle layer.
- Reward compliant grazing and route adherence via an Aptos fungible token.
- Enable deterministic insurance triggers when verified proofs meet claim rules.
- Handle intermittent connectivity: devices and the dashboard can queue proofs and sync when online.

## High-level Architecture

- On‑chain (Aptos Move): `livestock`, `events`, `agri_token`, `insurance` — store resource handles, event hashes, and results of verified triggers.
- Oracle (backend): validates IoT/AI proofs, writes minimal proofs/hashes to Aptos, and stores full telemetry in Firebase for audits.
- Edge / AI: ESP32/GPS devices gather telemetry; computer‑vision runs off‑chain and emits signed proof envelopes to the oracle.
- Frontend: Simple dashboard for Farmers, Herders, and Authorities with Petra/Martian wallet flows.

## Key Principles

- Do NOT store raw IoT or AI data on‑chain; only hashes and verified references.
- Resource‑oriented Move design enforces ownership and capability‑based permissions.
- Oracle layer prevents fake alerts by validating payloads before anchoring.
- Offline queueing ensures operability in low connectivity environments.

## Repo Layout (important parts)

```text
src/
  components/
  services/
    aptosOracleClient.js
    GeofencingOracleAdapter.js
    OfflineEventBuffer.js
    InsuranceTriggerValidator.js
agri-me-funcs/    # Oracle backend (Aptos signer and transaction submission)
move/
  agri_me/         # Move modules + Move.toml
```

## Quick start (local dev)

1. Install frontend deps and start:

```bash
npm install
npm start
```

2. Start the oracle backend (separate):

```bash
cd agri-me-funcs
npm install
npm run serve
```

3. Environment variables (frontend):

- `REACT_APP_AGRIME_ORACLE_ENDPOINT` — URL of the oracle API (default `/api/aptos/oracle`).
- `REACT_APP_APTOS_NETWORK` — Aptos network name (`testnet` by default).
- `REACT_APP_AGROAI_ENDPOINT` — optional TinyLLaMA / agro-AI endpoint for local models.

## Development notes for integrators

- The frontend helper `src/services/aptosOracleClient.js` provides `hashPayload`, `buildOracleEvent`, and `anchorOracleEvent` used across services.
- Use `src/services/GeofencingOracleAdapter.js` to submit geofence violations; it will queue offline via `OfflineEventBuffer` if the oracle is unreachable.
- Use `src/services/InsuranceTriggerValidator.js` to evaluate and submit insurance claim triggers; oracle‑side verification is still required for production payouts.

## Security & Privacy

- Ownership can only be changed by transactions signed by the recorded owner or by privileged governance Move capabilities.
- The oracle must authenticate operator submissions to prevent spam/fake alerts; ensure backend uses proper auth and signature checks before anchoring.

## Contact

This repository is the implementation for the `agri me` platform. For deployment, ensure the oracle backend has access to a secure Aptos signer and that Firebase credentials are kept secret.
