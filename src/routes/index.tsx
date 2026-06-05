import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalGlobe, type SatNode } from "@/components/OrbitalGlobe";
import { generateConstellation, generateLinks } from "@/lib/constellation";
import {
  Zap, Thermometer, Battery, X, AlertTriangle, Radio, Sun, Moon,
  Cpu, ArrowRightLeft, Waves,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: MeshPage,
});

// ============================================================================
// 1. CAMADA DE LÓGICA E ESTADO (Custom Hook)
// ============================================================================

function useConstellationSimulator() {
  const nodes = useMemo(() => generateConstellation(7), []);
  
  const [failedSet, setFailedSet] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SatNode | null>(null);
  const [stormActive, setStormActive] = useState(false);

  const links = useMemo(() => generateLinks(nodes, failedSet), [nodes, failedSet]);

  const triggerStorm = useCallback(() => {
    setStormActive(true);
    const picks = new Set<string>();
    
    // Seleciona 8 satélites aleatórios para falharem
    for (let i = 0; i < 8; i++) {
      picks.add(nodes[Math.floor(Math.random() * nodes.length)].id);
    }
    
    setFailedSet(picks);
    
    // Recuperação após 6 segundos
    setTimeout(() => {
      setFailedSet(new Set());
      setStormActive(false);
    }, 6000);
  }, [nodes]);

  const disableNode = useCallback(() => {
    if (!selected) return;
    
    setFailedSet((prev) => new Set([...prev, selected.id]));
    
    // Recuperação individual após 5 segundos
    setTimeout(() => {
      setFailedSet((prev) => {
        const n = new Set(prev);
        n.delete(selected.id);
        return n;
      });
    }, 5000);
  }, [selected]);

  // Estatísticas Derivadas
  const stats = useMemo(() => ({
    activeLasers: links.filter((l) => l.state === "active").length,
    failedLasers: links.filter((l) => l.state === "failed").length,
    solarNodes: nodes.filter((n) => !n.inEclipse).length,
    totalNodes: nodes.length
  }), [links, nodes]);

  return {
    nodes,
    links,
    failedSet,
    selected,
    setSelected,
    stormActive,
    triggerStorm,
    disableNode,
    stats
  };
}

// ============================================================================
// 2. COMPONENTE PRINCIPAL DE PÁGINA (Apenas Interface)
// ============================================================================

function MeshPage() {
  const { 
    nodes, links, failedSet, selected, setSelected, 
    stormActive, triggerStorm, disableNode, stats 
  } = useConstellationSimulator();

  return (
    <div className="relative h-[calc(100vh-4rem)] lg:h-screen overflow-hidden bg-background">
      {/* Camada 3D do Globo */}
      <div className="absolute inset-0">
        <OrbitalGlobe
          nodes={nodes.map((n) => ({ ...n, failed: failedSet.has(n.id) }))}
          links={links}
          onSelectNode={setSelected}
          selectedId={selected?.id}
        />
      </div>

      {/* Overlay Superior: Título e HUD */}
      <div className="absolute top-0 inset-x-0 p-4 lg:p-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pointer-events-none z-10">
        <div className="pointer-events-auto">
          <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Camada 01 · 02</div>
          <h1 className="text-xl lg:text-3xl font-semibold tracking-tight text-glow leading-tight mt-1">Gêmeo Digital Atmosférico</h1>
          <p className="hidden lg:block text-sm text-muted-foreground mt-2 max-w-md">
            Malha óptica distribuída. Otimização de energia baseada em zonas de eclipse e orquestração de inferência de IA.
          </p>
        </div>

        <div className="pointer-events-auto flex gap-2 lg:gap-3 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0 scrollbar-hide">
          <HudStat icon={Radio} label="Lasers Ativos" value={String(stats.activeLasers)} tone="primary" />
          <HudStat icon={Sun} label="Nós ao Sol" value={String(stats.solarNodes)} tone="warning" />
          <HudStat icon={Moon} label="Nós em Eclipse" value={String(stats.totalNodes - stats.solarNodes)} tone="muted" />
          {stats.failedLasers > 0 && (
            <HudStat icon={AlertTriangle} label="Custódia DTN" value={String(stats.failedLasers)} tone="destructive" />
          )}
        </div>
      </div>

      {/* Botões de Ação (Com fuga responsiva) */}
      <div className={`absolute left-4 right-4 lg:left-8 lg:right-auto flex flex-col lg:flex-row gap-3 z-40 transition-all duration-500 ease-in-out ${
          selected ? "bottom-[80vh] lg:bottom-8" : "bottom-20 lg:bottom-8"
      }`}>
        <button
          onClick={triggerStorm}
          disabled={stormActive}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-xs lg:text-sm font-medium hover:bg-destructive/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-lg shadow-destructive/10"
        >
          <Waves className={`h-4 w-4 ${stormActive ? 'animate-pulse' : ''}`} />
          {stormActive ? "Ionosfera Instável..." : "Simular Tempestade Solar"}
        </button>
        <button
          onClick={disableNode}
          disabled={!selected}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-surface/80 border border-border text-xs lg:text-sm font-medium text-foreground hover:bg-surface-elevated transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-md shadow-lg"
        >
          <Cpu className="h-4 w-4" />
          Derrubar Nó Selecionado
        </button>
      </div>

      {/* Alerta Global de Tempestade */}
      <AnimatePresence>
        {stormActive && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-32 lg:top-28 left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 px-4 py-3 rounded-lg bg-destructive/20 border border-destructive text-xs lg:text-sm text-destructive font-medium flex items-center gap-3 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.2)] z-30"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 animate-blink" />
            <span>Alerta Severo: Ejeção de Massa Coronal. Protocolo DTN Ativado.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel Lateral do Satélite */}
      <AnimatePresence>
        {selected && (
          <NodeDrawer
            node={{ ...selected, failed: failedSet.has(selected.id) }}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Legenda Desktop */}
      <div className="hidden lg:block absolute bottom-8 right-8 p-4 rounded-xl bg-surface/60 border border-border backdrop-blur-md space-y-2.5 shadow-xl">
        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Status da Malha</div>
        <LegendDot color="bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" label="Link óptico estável (FSOC)" />
        <LegendDot color="bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" label="Falha de visada (DTN em uso)" />
        <LegendDot color="bg-muted-foreground" label="Fora do alcance visual (Eclipse)" />
      </div>
    </div>
  );
}

// ============================================================================
// 3. SUBCOMPONENTES VISUAIS
// ============================================================================

function HudStat({ icon: Icon, label, value, tone = "primary" }: { icon: any; label: string; value: string; tone?: "primary" | "warning" | "muted" | "destructive" }) {
  const toneClass = {
    primary: "text-primary border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    warning: "text-warning border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    muted: "text-muted-foreground border-border",
    destructive: "text-destructive border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  }[tone];

  return (
    <div className={`shrink-0 px-4 py-2.5 rounded-xl bg-surface/80 backdrop-blur-xl border flex flex-col justify-center min-w-[110px] ${toneClass}`}>
      <div className="flex items-center gap-2 text-[9px] lg:text-[10px] uppercase tracking-widest font-semibold opacity-90 mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="font-mono text-xl lg:text-2xl font-bold leading-none">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function NodeDrawer({ node, onClose }: { node: SatNode; onClose: () => void }) {
  // Simula pequenas flutuações na telemetria enquanto o painel está aberto
  const [liveWorkload, setLiveWorkload] = useState(node.workload);
  const [liveTemp, setLiveTemp] = useState(node.gpuTemp);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveWorkload(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setLiveTemp(prev => Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const status = node.failed
    ? { label: "Falha de Hardware · Aguardando Custódia DTN", tone: "destructive" }
    : node.inEclipse
      ? { label: "Modo Noturno · Otimizando Bateria", tone: "muted" }
      : { label: "Visada Direta ao Sol · Capacidade Total", tone: "primary" };

  return (
    <motion.aside
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="absolute lg:top-0 lg:right-0 lg:h-full lg:w-[420px] lg:rounded-none
        bottom-0 left-0 right-0 max-h-[75vh] lg:max-h-none rounded-t-3xl
        bg-surface/95 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-border p-6 lg:p-8 overflow-y-auto z-30 shadow-2xl"
    >
      <div className="lg:hidden h-1.5 w-12 rounded-full bg-border mx-auto mb-6" />

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] font-mono text-primary tracking-[0.3em] font-semibold mb-1">NÓ ORBITAL ATIVO</div>
          <div className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {node.id}
            {node.failed && <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1">{node.name}</div>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 grid place-items-center rounded-full bg-surface-elevated/50 hover:bg-surface-elevated text-muted-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={`px-4 py-3 rounded-lg mb-8 border text-xs font-medium flex items-center gap-2.5 ${
        status.tone === "primary"
          ? "bg-primary/10 border-primary/30 text-primary"
          : status.tone === "destructive"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-surface-elevated border-border text-muted-foreground"
      }`}>
        <span className="h-2 w-2 rounded-full bg-current animate-pulse shadow-[0_0_5px_currentColor]" />
        {status.label}
      </div>

      <div className="space-y-6">
        <Telemetry icon={Battery} label="Bateria (SoC)" value={node.battery} unit="%" color="primary" />
        <Telemetry icon={Thermometer} label="Temperatura GPU" value={liveTemp} unit="°C" color="warning" max={100} />
        <Telemetry icon={Zap} label="Uso da GPU (Workload AI)" value={liveWorkload} unit="%" color="accent" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:gap-4 text-xs">
        <Mini label="Latitude" value={`${node.lat.toFixed(3)}°`} />
        <Mini label="Longitude" value={`${node.lon.toFixed(3)}°`} />
        <Mini label="Altitude (LEO)" value={`${(550 + node.alt * 250).toFixed(0)} km`} />
        <Mini label="VRAM Ocupada" value={`${(8 + liveWorkload * 0.32).toFixed(1)} GB`} />
      </div>

      <div className="mt-8 p-4 rounded-xl bg-black/40 border border-border">
        <div className="flex items-center gap-2 text-[10px] font-mono text-accent tracking-widest font-semibold mb-3">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          ORQUESTRAÇÃO DE INFERÊNCIA
        </div>
        <div className="text-xs text-foreground/80 leading-relaxed">
          {node.inEclipse
            ? "Estado crítico de energia detectado. Migração de modelo iniciada via OCT-laser para SAT-018. A aguardar janela solar para retomar operações locais."
            : liveWorkload > 80
              ? "Aviso: Throttling térmico iminente. Orquestrador dividiu a inferência atual horizontalmente com 3 satélites vizinhos na mesma órbita."
              : "Operação Nominal. Capacidade computacional excedente disponível para aceitar novas tarefas da estação terrestre."}
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-black/40 border border-border">
        <div className="text-[10px] font-mono text-muted-foreground tracking-widest font-semibold mb-3">DETALHES DE REDE</div>
        <div className="space-y-2 text-[11px] font-mono text-muted-foreground">
          <div className="flex justify-between items-center border-b border-border/50 pb-2"><span>Link Óptico (FSOC)</span><span className="text-primary font-semibold">100 Gbps</span></div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2"><span>Protocolo</span><span className="text-foreground/90">Bundle Protocol v7</span></div>
          <div className="flex justify-between items-center border-b border-border/50 pb-2"><span>Correção de Erros</span><span className="text-foreground/90">0 SEU/24h</span></div>
          <div className="flex justify-between items-center pt-1"><span>Sistema Operativo</span><span className="text-foreground/90">RTEMS (Rust)</span></div>
        </div>
      </div>
    </motion.aside>
  );
}

function Telemetry({ icon: Icon, label, value, unit, color, max = 100 }: { icon: any; label: string; value: number; unit: string; color: "primary" | "warning" | "accent"; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const bg = { primary: "bg-primary", warning: "bg-warning", accent: "bg-accent" }[color];
  const text = { primary: "text-primary", warning: "text-warning", accent: "text-accent" }[color];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <span className={`text-sm font-mono font-bold ${text}`}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 bg-surface-elevated/50 rounded-full overflow-hidden border border-border/50">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.8 }}
          className={`h-full ${bg} shadow-[0_0_10px_currentColor]`}
          style={{ opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-elevated/30 border border-border">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}