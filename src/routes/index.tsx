import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalGlobe, type SatNode } from "@/components/OrbitalGlobe";
import { generateConstellation, generateLinks } from "@/lib/constellation";
import {
  Zap, Thermometer, Battery, X, AlertTriangle, Radio, Sun, Moon,
  Cpu, ArrowRightLeft, Waves,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbital Mesh · ORION" },
      { name: "description", content: "Real-time orbital constellation telemetry and laser mesh." },
    ],
  }),
  component: MeshPage,
});

function MeshPage() {
  const [failedSet, setFailedSet] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SatNode | null>(null);
  const [stormActive, setStormActive] = useState(false);

  const nodes = useMemo(() => generateConstellation(7), []);
  const links = useMemo(() => generateLinks(nodes, failedSet), [nodes, failedSet]);

  const triggerStorm = () => {
    setStormActive(true);
    const picks = new Set<string>();
    for (let i = 0; i < 8; i++) {
      picks.add(nodes[Math.floor(Math.random() * nodes.length)].id);
    }
    setFailedSet(picks);
    setTimeout(() => {
      setFailedSet(new Set());
      setStormActive(false);
    }, 6000);
  };

  const disableNode = () => {
    if (!selected) return;
    setFailedSet((prev) => new Set([...prev, selected.id]));
    setTimeout(() => {
      setFailedSet((prev) => {
        const n = new Set(prev);
        n.delete(selected.id);
        return n;
      });
    }, 5000);
  };

  const activeLasers = links.filter((l) => l.state === "active").length;
  const failedLasers = links.filter((l) => l.state === "failed").length;
  const solar = nodes.filter((n) => !n.inEclipse).length;

  return (
    <div className="relative h-[calc(100vh-7.5rem)] lg:h-screen overflow-hidden">
      <div className="absolute inset-0">
        <OrbitalGlobe
          nodes={nodes.map((n) => ({ ...n, failed: failedSet.has(n.id) }))}
          links={links}
          onSelectNode={setSelected}
          selectedId={selected?.id}
        />
      </div>

      <div className="absolute top-0 inset-x-0 p-3 lg:p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em]">CAMADA 01 · 02</div>
          <h1 className="text-base lg:text-2xl font-semibold tracking-tight text-glow leading-tight">Gêmeo Digital Atmosférico</h1>
          <p className="hidden lg:block text-sm text-muted-foreground mt-1">
            Orbital mesh network · Energy-aware workload scheduler
          </p>
        </div>

        <div className="pointer-events-auto flex gap-1.5 lg:gap-2 overflow-x-auto -mx-3 px-3 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
          <HudStat icon={Radio} label="Lasers" value={String(activeLasers)} tone="primary" />
          <HudStat icon={Sun} label="Solar" value={String(solar)} tone="warning" />
          <HudStat icon={Moon} label="Eclipse" value={String(nodes.length - solar)} tone="muted" />
          {failedLasers > 0 && (
            <HudStat icon={AlertTriangle} label="DTN" value={String(failedLasers)} tone="destructive" />
          )}
        </div>
      </div>

      <div className={`absolute left-3 right-3 lg:left-6 lg:right-auto flex flex-col lg:flex-row gap-2 z-40 transition-all duration-500 ease-in-out ${
          selected ? "bottom-[78vh] lg:bottom-6" : "bottom-3 lg:bottom-6"
      }`}>
        <button
          onClick={triggerStorm}
          disabled={stormActive}
          className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 rounded-md bg-destructive/15 border border-destructive/40 text-destructive text-xs lg:text-sm hover:bg-destructive/20 transition-colors disabled:opacity-60 backdrop-blur-md"
        >
          <Waves className="h-4 w-4" />
          {stormActive ? "Tempestade Ativa..." : "Simular Tempestade Solar"}
        </button>
        <button
          onClick={disableNode}
          disabled={!selected}
          className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 rounded-md bg-surface/70 border border-border text-xs lg:text-sm hover:bg-surface-elevated transition-colors disabled:opacity-40 backdrop-blur-md"
        >
          <Cpu className="h-4 w-4" />
          Desativar Nó Selecionado
        </button>
      </div>

      <AnimatePresence>
        {stormActive && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-28 lg:top-24 left-2 right-2 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 px-3 py-2 rounded-md bg-destructive/15 border border-destructive/50 text-[11px] lg:text-sm text-destructive flex items-center gap-2 backdrop-blur"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 animate-blink" />
            <span>Coronal mass ejection · BPv7 store-and-forward ativo</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <NodeDrawer
            node={{ ...selected, failed: failedSet.has(selected.id) }}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      <div className="hidden lg:block absolute bottom-6 right-6 p-3 rounded-md bg-surface/60 border border-border backdrop-blur-md text-[11px] space-y-1.5 font-mono">
        <LegendDot color="bg-primary" label="Link óptico ativo (FSOC)" />
        <LegendDot color="bg-destructive" label="Falha · DTN custody" />
        <LegendDot color="bg-muted-foreground" label="Eclipse · standby" />
      </div>
    </div>
  );
}

function HudStat({
  icon: Icon, label, value, tone = "primary",
}: { icon: any; label: string; value: string; tone?: "primary" | "warning" | "muted" | "destructive" }) {
  const toneClass = {
    primary: "text-primary border-primary/40",
    warning: "text-warning border-warning/40",
    muted: "text-muted-foreground border-border",
    destructive: "text-destructive border-destructive/40",
  }[tone];
  return (
    <div className={`shrink-0 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-md bg-surface/70 backdrop-blur-md border ${toneClass}`}>
      <div className="flex items-center gap-1 lg:gap-1.5 text-[9px] lg:text-[10px] uppercase tracking-wider opacity-80">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-mono text-base lg:text-lg leading-tight">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function NodeDrawer({ node, onClose }: { node: SatNode; onClose: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1200);
    return () => clearInterval(t);
  }, []);
  void tick;

  const status = node.failed
    ? { label: "Falha · DTN Bundle em custódia", tone: "destructive" }
    : node.inEclipse
      ? { label: "Eclipse · Workload migrado", tone: "muted" }
      : { label: "Solar · Inferência ativa", tone: "primary" };

  return (
    <motion.aside
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="absolute lg:top-0 lg:right-0 lg:h-full lg:w-[380px] lg:rounded-none
        bottom-0 left-0 right-0 max-h-[75vh] lg:max-h-none rounded-t-2xl
        bg-surface/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-border p-5 lg:p-6 overflow-y-auto"
    >
      <div className="lg:hidden h-1 w-10 rounded-full bg-muted-foreground/40 mx-auto mb-4" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono text-muted-foreground tracking-[0.25em]">NÓ ORBITAL</div>
          <div className="text-xl font-semibold text-glow">{node.id}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{node.name}</div>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 grid place-items-center rounded-md hover:bg-surface-elevated text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={`px-3 py-2 rounded-md mb-5 border text-xs flex items-center gap-2 ${
        status.tone === "primary"
          ? "bg-primary/10 border-primary/30 text-primary"
          : status.tone === "destructive"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-surface-elevated border-border text-muted-foreground"
      }`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        {status.label}
      </div>

      <Telemetry icon={Battery} label="Bateria (SoC)" value={node.battery} unit="%" color="primary" />
      <Telemetry icon={Thermometer} label="GPU Thermal Drift" value={node.gpuTemp} unit="°C" color="warning" max={100} />
      <Telemetry icon={Zap} label="Workload AI" value={node.workload} unit="%" color="accent" />

      <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
        <Mini label="Latitude" value={node.lat.toFixed(2) + "°"} />
        <Mini label="Longitude" value={node.lon.toFixed(2) + "°"} />
        <Mini label="Altitude" value={(550 + node.alt * 250).toFixed(0) + " km"} />
        <Mini label="VRAM" value={(8 + node.workload * 0.32).toFixed(1) + " GB"} />
      </div>

      <div className="mt-6 p-3 rounded-md bg-background/50 border border-border">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground tracking-widest mb-2">
          <ArrowRightLeft className="h-3 w-3" />
          MIGRAÇÃO DE WORKLOAD
        </div>
        <div className="text-xs text-foreground/90">
          {node.inEclipse
            ? "Estado encapsulado e enviado via OCT-laser para SAT-018 (janela solar emergindo em 4m12s)."
            : node.workload > 80
              ? "Throttling térmico iminente · Balanceamento horizontal para 3 nós vizinhos."
              : "Operação nominal · Aceitando novas requisições do gateway terrestre."}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
        <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2">PROTOCOLO</div>
        <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
          <div className="flex justify-between"><span>FSOC link</span><span className="text-primary">100 Gbps</span></div>
          <div className="flex justify-between"><span>BPv7 bundle</span><span className="text-foreground/80">CCSDS</span></div>
          <div className="flex justify-between"><span>ECC scrub</span><span className="text-foreground/80">0 SEU/24h</span></div>
          <div className="flex justify-between"><span>RTOS</span><span className="text-foreground/80">RTEMS · Rust</span></div>
        </div>
      </div>
    </motion.aside>
  );
}

function Telemetry({
  icon: Icon, label, value, unit, color, max = 100,
}: { icon: any; label: string; value: number; unit: string; color: "primary" | "warning" | "accent"; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const bg = { primary: "bg-primary", warning: "bg-warning", accent: "bg-accent" }[color];
  const text = { primary: "text-primary", warning: "text-warning", accent: "text-accent" }[color];
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className={`text-sm font-mono ${text}`}>{value.toFixed(0)}{unit}</span>
      </div>
      <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${bg}`}
        />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-md bg-background/50 border border-border">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
