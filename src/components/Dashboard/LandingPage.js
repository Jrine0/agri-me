import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BellRing, MapPinned, Satellite, Shield, Sprout, Wallet } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPinned className="h-6 w-6" />,
      title: 'Livestock tracking',
      description: 'Register animals as Move resources with owner, GPS references, and status flags.',
    },
    {
      icon: <Satellite className="h-6 w-6" />,
      title: 'IoT oracle layer',
      description: 'ESP32 and GPS data stay off-chain while hashes and proofs are anchored to Aptos.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Verified alerts',
      description: 'Authorities can query intrusion, movement, and insurance events with deterministic rules.',
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(180deg,#07110d_0%,#0f1f19_50%,#05100d_100%)] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">agri me</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Aptos-based livestock protection for low-connectivity environments</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Sign up
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <BellRing size={16} />
              Oracle-first alerts for farmers, herders, and authorities
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
                Trace livestock, verify alerts, and reward safe grazing on Aptos.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                agri me combines IoT devices, AI route prediction, Firebase logs, and Aptos Move resources to reduce livestock conflict and keep ownership auditable.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Open Dashboard
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/iot-dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                <Wallet size={18} />
                Aptos wallet flow
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric value="Move" label="resources for livestock ownership" />
              <Metric value="Hashes" label="for IoT and AI proofs" />
              <Metric value="Events" label="for alerts, rewards, and claims" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-slate-950 to-slate-900 p-6">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Platform snapshot</span>
                <Sprout className="text-emerald-300" size={18} />
              </div>
              <div className="mt-6 space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Metric = ({ value, label }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="text-2xl font-semibold text-white">{value}</div>
    <p className="mt-1 text-sm leading-6 text-slate-400">{label}</p>
  </div>
);

export default LandingPage;
