import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Database, Gauge, Zap, Sliders,
  CheckCircle2, XCircle, DollarSign, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/optimization")({
  head: () => ({
    meta: [
      { title: "Cache Semântico · ORION" },
      { name: "description", content: "Edge compression and semantic cache optimization panel." },
    ],
  }),
  component: OptimizationPage,
});

const initialLog = [
  { id: 1, name: "Mapeamento Queimada · MT-N12", sim: 96.4, hit: true, ms: 38, mb: 1840 },
  { id: 2, name: "NDVI Soja · Cerrado-09", sim: 91.2, hit: true, ms: 52, mb: 1240 },
  { id: 3, name: "Pluma Térmica · Refinaria-RJ", sim: 88.1, hit: false, ms: 612, mb: 1980 },
  { id: 4, name: "Cobertura Nuvens · Pacífico-S", sim: 99.1, hit: true, ms: 31, mb: 2100 },
  { id: 5, name: "Anomalia Gás · Bacia-Campos", sim: 79.5, hit: false, ms: 740, mb: 1620 },
];

function makeRequest(id: number, threshold: number) {
  const presets = [
    "Mapeamento Queimada · ", "NDVI Soja · ", "Pluma Térmica · ", "Cobertura Nuvens · ",
    "Anomalia Gás · ", "Embargo Florestal · ", "Derretimento Glacial · ", "Tempestade Convectiva · ",
  ];
  const regions = ["MT-N12", "PA-S04", "AM-W07", "Cerrado-09", "Pacífico-S", "Atlântico-N", "BR-NE03", "Andes-22"];
  const sim = 70 + Math.random() * 30;
  const hit = sim >= threshold;
  return {
    id,
    name: presets[Math.floor(Math.random() * presets.length)] + regions[Math.floor(Math.random() * regions.length)],
    sim: Number(sim.toFixed(1)),
    hit,
    ms: hit ? 25 + Math.floor(Math.random() * 60) : 400 + Math.floor(Math.random() * 500),
    mb: 800 + Math.floor(Math.random() * 1500),
  };
}

function OptimizationPage() {
  const [threshold, setThreshold] = useState(92);
  const [log, setLog] = useState(initialLog);
  const [counter, setCounter] = useState(100);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCounter((c) => c + 1);
      setLog((prev) => [makeRequest(counter, threshold), ...prev].slice(0, 14));
    }, 2200);
    return () => clearInterval(t);
  }, [counter, threshold, paused]);

  const stats = useMemo(() => {
    const hits = log.filter((l) => l.hit).length;
    const hitRate = (hits / log.length) * 100;
    const savedMB = log.filter((l) => l.hit).reduce((s, l) => s + l.mb, 0);
    const avgMs = Math.round(log.reduce((s, l) => s + l.ms, 0) / log.length);
    return { hitRate, savedMB, avgMs, hits, misses: log.length - hits };
  }, [log]);

  // monthly running totals (simulated)
  const savedTB = 42 + stats.savedMB / 1024 / 1024;
  const savedDollars = savedTB * 60000; // $60K per TB illustrative

  return (
    <div className="h-[calc(100vh-7.5rem)] lg:h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-start justify-between gap-3 mb-5 lg:mb-8">
          <div className="min-w-0">
            <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em]">CAMADA 03</div>
            <h1 className="text-xl lg:text-3xl font-semibold tracking-tight text-glow leading-tight">Cache Semântico</h1>
            <p className="hidden lg:block text-sm text-muted-foreground mt-1">
              Deduplicação por proximidade de cosseno · Relevance Decay · Dynamic TTL
            </p>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="shrink-0 px-2.5 lg:px-3 py-2 rounded-md bg-surface/60 border border-border text-[11px] lg:text-xs hover:bg-surface-elevated"
          >
            {paused ? "▶ Retomar" : "⏸ Pausar"}
          </button>
        </div>

        {/* Hero KPI */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface/40 to-transparent p-5 lg:p-8 mb-5 lg:mb-6">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest mb-2">
              Economia este mês · Cache Hit
            </div>
            <div className="flex items-baseline gap-2 lg:gap-3">
              <motion.div
                key={Math.floor(savedTB)}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl lg:text-6xl font-bold font-mono text-primary text-glow"
              >
                {savedTB.toFixed(2)}
              </motion.div>
              <div className="text-xl lg:text-2xl font-mono text-muted-foreground">TB</div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm flex-wrap">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-mono text-primary text-base lg:text-lg">
                ${(savedDollars / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-muted-foreground">poupados em downlink + GPU</span>
              <ArrowUpRight className="h-3 w-3 text-primary" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 lg:gap-3">
              <KpiCard icon={Gauge} label="Hit Rate" value={`${stats.hitRate.toFixed(0)}%`} delta="+3.2%" positive />
              <KpiCard icon={Zap} label="Latência" value={`${stats.avgMs}ms`} delta="-18ms" positive />
              <KpiCard icon={Database} label="Custódia" value="142" delta="+12" positive={false} />
            </div>
          </div>
        </div>

        {/* Donut + Slider row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-5 lg:mb-6">
          <div className="lg:col-span-1 rounded-xl border border-border bg-surface/50 p-5 lg:p-6">
            <div className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest mb-3 lg:mb-4">
              Resolução de Requisições
            </div>
            <DonutChart hits={stats.hits} misses={stats.misses} />
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Resolvido em Órbita
                </span>
                <span className="font-mono text-primary">{stats.hits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Novo Processamento
                </span>
                <span className="font-mono">{stats.misses}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-surface/50 p-5 lg:p-6">
            <div className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest mb-1">
              <Sliders className="h-3.5 w-3.5" />
              Agressividade do Cache
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-5 lg:mb-6">
              Limiar mínimo de similaridade (cosseno) para Cache Hit.
            </p>

            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-3xl lg:text-4xl font-mono text-glow text-primary">{threshold}%</div>
              <div className="text-[10px] lg:text-xs text-muted-foreground">
                {threshold < 85 ? "AGRESSIVO" : threshold < 95 ? "BALANCEADO" : "CONSERVADOR"}
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min={70}
                max={100}
                step={0.5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-2 appearance-none bg-background rounded-full cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                  [&::-webkit-slider-thumb]:shadow-[0_0_18px_oklch(0.72_0.18_158/0.7)]"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((threshold - 70) / 30) * 100}%, var(--background) ${((threshold - 70) / 30) * 100}%, var(--background) 100%)`,
                }}
              />
              <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                <span>70 · Baixa</span>
                <span>85</span>
                <span>92 · Default</span>
                <span>100 · Alta</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <ThresholdPreset label="Climáticos" value={90} active={threshold === 90} onClick={() => setThreshold(90)} />
              <ThresholdPreset label="Florestal" value={94} active={threshold === 94} onClick={() => setThreshold(94)} />
              <ThresholdPreset label="Incêndio" value={99} active={threshold === 99} onClick={() => setThreshold(99)} />
            </div>
          </div>
        </div>

        {/* Log table */}
        <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-border flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest">
                Log · Tempo real
              </div>
              <div className="text-xs lg:text-sm font-mono text-foreground/80 mt-0.5 flex items-center">
                {log.length} eventos
                <span className={`inline-block ml-2 h-1.5 w-1.5 rounded-full ${paused ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
              </div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground text-right">
              THRESH<br className="lg:hidden" /> {threshold}%
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
            <div className="col-span-5">Requisição</div>
            <div className="col-span-2">Similaridade</div>
            <div className="col-span-2">Latência</div>
            <div className="col-span-2">Volume</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {log.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, x: -20, backgroundColor: "rgba(16,185,129,0.08)" }}
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="px-4 lg:px-6 py-3 text-sm lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center"
                >
                  {/* Mobile layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm truncate flex-1 min-w-0">{row.name}</div>
                      {row.hit ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono">
                          <CheckCircle2 className="h-3 w-3" /> HIT
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-mono">
                          <XCircle className="h-3 w-3" /> MISS
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-[11px] font-mono text-muted-foreground">
                      <span>sim {row.sim}%</span>
                      <span>·</span>
                      <span>{row.ms}ms</span>
                      <span>·</span>
                      <span>{(row.mb / 1024).toFixed(2)} GB</span>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:block col-span-5 truncate">{row.name}</div>
                  <div className="hidden lg:block col-span-2 font-mono text-foreground/80">{row.sim}%</div>
                  <div className="hidden lg:block col-span-2 font-mono text-muted-foreground">{row.ms}ms</div>
                  <div className="hidden lg:block col-span-2 font-mono text-muted-foreground">{(row.mb / 1024).toFixed(2)} GB</div>
                  <div className="hidden lg:flex col-span-1 justify-end">
                    {row.hit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-mono">
                        <CheckCircle2 className="h-3 w-3" /> HIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-mono">
                        <XCircle className="h-3 w-3" /> MISS
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, delta, positive,
}: { icon: any; label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div className="rounded-lg bg-background/50 border border-border p-3 lg:p-4 backdrop-blur">
      <div className="flex items-center justify-between text-[10px] lg:text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 truncate">
          <Icon className="h-3 w-3 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
      </div>
      <div className="mt-1 text-lg lg:text-2xl font-mono">{value}</div>
      <div className={`text-[10px] lg:text-[11px] flex items-center gap-1 mt-1 ${positive ? "text-primary" : "text-warning"}`}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {delta}
      </div>
    </div>
  );
}

function DonutChart({ hits, misses }: { hits: number; misses: number }) {
  const total = hits + misses || 1;
  const pct = hits / total;
  const C = 2 * Math.PI * 56;
  return (
    <div className="relative h-44 grid place-items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="56" fill="none" stroke="oklch(0.28 0.04 258)" strokeWidth="14" />
        <motion.circle
          cx="80" cy="80" r="56" fill="none"
          stroke="var(--primary)" strokeWidth="14"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - C * pct }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ filter: "drop-shadow(0 0 8px oklch(0.72 0.18 158 / 0.6))" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-mono text-primary">{(pct * 100).toFixed(0)}%</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hit rate</div>
      </div>
    </div>
  );
}

function ThresholdPreset({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md border text-left text-xs transition-colors ${
        active ? "bg-primary/15 border-primary/50 text-primary" : "bg-background/40 border-border text-muted-foreground hover:bg-surface-elevated"
      }`}
    >
      <div className="font-mono">{value}%</div>
      <div className="text-[10px]">{label}</div>
    </button>
  );
}
