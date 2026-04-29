import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BadgeCheck, BellRing, Beef, CloudLightning, MapPinned, ShieldAlert, Signal, Wallet } from 'lucide-react';
import {
  SUPPORTED_APTOS_WALLETS,
  anchorOracleEvent,
  buildInsuranceTrigger,
  buildLivestockRecord,
  buildOracleEvent,
  buildRewardTransfer,
  connectAptosWallet,
  formatShortAddress,
  hashPayload,
} from '../../services/aptosOracleClient';

const demoLivestock = [
  {
    id: 'AGM-1001',
    owner: '0x8f12...44a1',
    status: 'safe',
    location: 'Kano grazing corridor',
    health: 'stable',
  },
  {
    id: 'AGM-1002',
    owner: '0x8f12...44a1',
    status: 'intruding',
    location: 'Private farmland buffer',
    health: 'monitor',
  },
  {
    id: 'AGM-1003',
    owner: '0x91cd...d12f',
    status: 'lost',
    location: 'Offline sync pending',
    health: 'unknown',
  },
];

const baseAlerts = [
  {
    id: 'alert-1',
    title: 'Restricted land entry detected',
    description: 'GPS proof hashed and queued for oracle submission.',
    severity: 'critical',
  },
  {
    id: 'alert-2',
    title: 'Movement anomaly on route 3',
    description: 'AI route model flagged a deviation from approved grazing corridor.',
    severity: 'medium',
  },
];

const IoTLivestockDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState('Wallet not connected');
  const [livestock, setLivestock] = useState(demoLivestock);
  const [alerts, setAlerts] = useState(baseAlerts);
  const [eventLog, setEventLog] = useState([]);
  const [proofDraft, setProofDraft] = useState('GPS:KANO:BUFFER:001');

  useEffect(() => {
    setEventLog((current) => [
      ...current,
      {
        title: 'Offline sync ready',
        description: 'The dashboard can queue proofs until connectivity returns.',
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const summary = useMemo(() => {
    const safe = livestock.filter((item) => item.status === 'safe').length;
    const flagged = livestock.length - safe;

    return {
      safe,
      flagged,
      alerts: alerts.length,
    };
  }, [alerts.length, livestock]);

  const handleConnect = async () => {
    try {
      const nextWallet = await connectAptosWallet();
      setWallet(nextWallet);
      setStatus(`Connected via ${nextWallet.walletName}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleRegisterLivestock = async () => {
    if (!wallet?.address) {
      setStatus('Connect an Aptos wallet first.');
      return;
    }

    const nextId = `AGM-${1000 + livestock.length + 1}`;
    const record = buildLivestockRecord({
      id: nextId,
      ownerAddress: wallet.address,
      gpsReference: 'off-chain:gps-track:demo',
      status: 'safe',
      metadata: { device: 'ESP32', source: 'manual-registration' },
    });

    const anchor = await anchorOracleEvent(buildOracleEvent({
      eventType: 'livestock.registered',
      livestockId: record.livestock_id,
      ownerAddress: record.owner_address,
      locationRef: record.gps_reference,
      status: record.status,
      metadata: record.metadata,
    }));

    setLivestock((current) => [
      { id: record.livestock_id, owner: formatShortAddress(record.owner_address), status: record.status, location: 'On-chain registered', health: 'stable' },
      ...current,
    ]);

    setEventLog((current) => [
      {
        title: 'Livestock anchored on Aptos',
        description: `Record ${record.livestock_id} stored as a Move resource hash ${anchor.eventHash}`,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  };

  const handleAnchorProof = async () => {
    const proofHash = await hashPayload({ proofDraft, capturedAt: new Date().toISOString() });
    const anchor = await anchorOracleEvent(buildOracleEvent({
      eventType: 'iot.location_update',
      livestockId: livestock[0]?.id || 'unknown',
      ownerAddress: wallet?.address || 'unconnected',
      locationRef: proofDraft,
      status: 'safe',
      metadata: { proofHash },
    }));

    setEventLog((current) => [
      {
        title: 'IoT proof anchored',
        description: `Proof hash ${anchor.eventHash} queued for backend verification.`,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);

    setAlerts((current) => [
      {
        id: `alert-${Date.now()}`,
        title: 'Location proof submitted',
        description: 'A hashed GPS update has been forwarded to the oracle layer.',
        severity: 'low',
      },
      ...current,
    ]);
  };

  const handleReward = async () => {
    if (!wallet?.address) {
      setStatus('Connect an Aptos wallet first.');
      return;
    }

    const reward = buildRewardTransfer({
      recipient: wallet.address,
      amount: '25 AGRI',
      reason: 'Safe route compliance',
      metadata: { routeId: 'route-3', source: 'oracle' },
    });

    const anchor = await anchorOracleEvent({
      event_type: 'reward.transfer',
      ...reward,
    });

    setEventLog((current) => [
      {
        title: 'Reward scheduled',
        description: `Compliance reward hashed as ${anchor.eventHash}.`,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  };

  const handleInsuranceTrigger = async () => {
    const claim = buildInsuranceTrigger({
      livestockId: livestock[1]?.id || 'unknown',
      claimType: 'intrusion_damage',
      proofHash: await hashPayload({ image: 'cattle-entry-frame', route: 'private-land' }),
      severity: 'high',
    });

    const anchor = await anchorOracleEvent({
      event_type: 'insurance.claim_triggered',
      ...claim,
    });

    setEventLog((current) => [
      {
        title: 'Insurance trigger created',
        description: `Claim proof anchored with hash ${anchor.eventHash}.`,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#08130d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-stone-900 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">agri me</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Livestock tracking, Aptos anchoring, and oracle verification</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                IoT devices stay off-chain, proofs are hashed and forwarded to the backend oracle, and Move resources carry ownership, status, and auditability on Aptos.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleConnect}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                <Wallet size={18} />
                Connect Aptos Wallet
              </button>
              <button
                type="button"
                onClick={handleRegisterLivestock}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <BadgeCheck size={18} />
                Register Livestock
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">{status}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Network: testnet</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Wallets: {SUPPORTED_APTOS_WALLETS.join(', ')}</span>
            {wallet?.address && <span className="rounded-full border border-white/10 px-3 py-1">{formatShortAddress(wallet.address)}</span>}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tracked livestock" value={livestock.length} icon={<Beef size={20} />} tone="from-emerald-500 to-teal-400" />
          <StatCard title="Safe animals" value={summary.safe} icon={<ShieldAlert size={20} />} tone="from-sky-500 to-cyan-400" />
          <StatCard title="Alerts queued" value={summary.alerts} icon={<BellRing size={20} />} tone="from-amber-500 to-orange-400" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="Livestock registry" subtitle="Move resources carry owner, status, and GPS references.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {livestock.map((animal) => (
                  <article key={animal.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{animal.id}</p>
                        <p className="text-sm text-slate-400">Owner: {animal.owner}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${animal.status === 'safe' ? 'bg-emerald-400/15 text-emerald-300' : animal.status === 'intruding' ? 'bg-amber-400/15 text-amber-200' : 'bg-rose-400/15 text-rose-200'}`}>
                        {animal.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2"><MapPinned size={16} /> {animal.location}</p>
                      <p className="flex items-center gap-2"><Signal size={16} /> Health: {animal.health}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Oracle actions" subtitle="Backend validates IoT and AI proofs before anchoring them on Aptos.">
              <div className="grid gap-4 md:grid-cols-3">
                <ActionCard
                  icon={<CloudLightning size={20} />}
                  title="Anchor location proof"
                  description="Hashes the IoT payload and submits it to the backend oracle."
                  onClick={handleAnchorProof}
                />
                <ActionCard
                  icon={<ArrowUpRight size={20} />}
                  title="Issue compliance reward"
                  description="Creates a deterministic reward event for safe grazing behavior."
                  onClick={handleReward}
                />
                <ActionCard
                  icon={<AlertTriangle size={20} />}
                  title="Trigger insurance review"
                  description="Queues a verifiable claim when intrusion damage is detected."
                  onClick={handleInsuranceTrigger}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Off-chain proof reference</label>
                <input
                  value={proofDraft}
                  onChange={(event) => setProofDraft(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="GPS hash, CV frame hash, or route proof"
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Alert feed" subtitle="Authorities and verified entities can query these events.">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <article key={alert.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">{alert.severity}</p>
                    <h3 className="mt-1 text-base font-semibold text-white">{alert.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{alert.description}</p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Audit log" subtitle="Every critical action is hashed for later verification.">
              <div className="space-y-3">
                {eventLog.map((item, index) => (
                  <article key={`${item.time}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.time}</p>
                    <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 to-emerald-950 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoLine title="On-chain" body="Livestock ownership, status flags, event hashes, and reward/insurance triggers live in Move resources and events." />
            <InfoLine title="Off-chain" body="IoT telemetry, CV detections, and AI route predictions stay in Firebase and backend workers." />
            <InfoLine title="Sync first" body="The oracle layer queues proofs during low connectivity and anchors them once the backend reconnects." />
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, tone }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-300">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-slate-950`}>
        {icon}
      </div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
    {children}
  </div>
);

const ActionCard = ({ icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-slate-950"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{icon}</div>
    <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
  </button>
);

const InfoLine = ({ title, body }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">{title}</p>
    <p className="mt-3 text-sm leading-6 text-slate-200">{body}</p>
  </div>
);

export default IoTLivestockDashboard;