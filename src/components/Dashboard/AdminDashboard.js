import React from 'react';
import { Shield, MapPinned, MessageCircle, BadgeCheck, TriangleAlert } from 'lucide-react';
import GeoTracker from '../Cowtracking/GeoTracker';
import ChatBox from '../Cowtracking/ChatBox';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const userId = 'admin-1';

  return (
    <div className="min-h-screen bg-[#07110d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">agri me</p>
              <h2 className="mt-2 text-3xl font-semibold">Authority operations dashboard</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Review geofences, verify oracle-submitted alerts, and coordinate with farmers or herders without exposing raw IoT payloads on-chain.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <StatusChip icon={<Shield size={14} />} label="Verified authority" />
              <StatusChip icon={<MapPinned size={14} />} label="Geofence control" />
              <StatusChip icon={<BadgeCheck size={14} />} label="Oracle validation" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
            <GeoTracker userRole="admin" />
          </div>

          <div className="space-y-6">
            <Panel title="Authority notes" subtitle="Low-tech friendly guidance for field teams.">
              <div className="space-y-3 text-sm text-slate-300">
                <p>• Confirm alerts with the backend oracle before escalation.</p>
                <p>• Use the map to mark private land, safe corridors, and buffer zones.</p>
                <p>• Keep raw sensor data off-chain; only publish hashes and event IDs to Aptos.</p>
              </div>
            </Panel>

            <Panel title="Collaboration" subtitle="Chat with field teams and local stakeholders.">
              <ChatBox userId={userId} role="admin" />
            </Panel>

            <Panel title="Escalation checklist" subtitle="Before approving a claim or warning.">
              <div className="space-y-3 text-sm text-slate-300">
                <ChecklistItem icon={<TriangleAlert size={16} />} text="Verify the event hash against the oracle queue." />
                <ChecklistItem icon={<MessageCircle size={16} />} text="Log a message for the relevant farmer or herder." />
                <ChecklistItem icon={<BadgeCheck size={16} />} text="Approve any insurance or reward trigger only after validation." />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusChip = ({ icon, label }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">
    {icon}
    {label}
  </span>
);

const Panel = ({ title, subtitle, children }) => (
  <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
    {children}
  </section>
);

const ChecklistItem = ({ icon, text }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
    <span className="mt-0.5 text-emerald-300">{icon}</span>
    <p>{text}</p>
  </div>
);

export default AdminDashboard;
