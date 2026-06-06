// PÁGINA DE ALERTAS - MONITORAMENTO EM TEMPO REAL (VERSÃO INTEGRAL)

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Wind, Droplets, CloudLightning, MapPin, Clock,
  FileJson, X, Activity, Gauge, Zap, Database, ArrowRightLeft, Cpu, Waves
} from "lucide-react";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

// ============================================================================
// 1. TIPAGENS E CONSTANTES
// ============================================================================

export type AlertKind = "fire" | "gas" | "flood" | "storm";

export interface Alert {
  id: string; kind: AlertKind; title: string; region: string; lat: number; lon: number; 
  confidence: number; ago: number; sat: string; embeddingDim: number; bytes: number;
}

const KIND_META: Record<AlertKind, { icon: any, label: string, color: string, bg: string, border: string }> = {
  fire: { icon: Flame, label: "Incêndio", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40" },
  gas: { icon: Wind, label: "Gás", color: "text-warning", bg: "bg-warning/15", border: "border-warning/40" },
  flood: { icon: Droplets, label: "Enchente", color: "text-accent", bg: "bg-accent/15", border: "border-accent/40" },
  storm: { icon: CloudLightning, label: "Tempestade", color: "text-primary", bg: "bg-primary/15", border: "border-primary/40" },
};

// ============================================================================
// 2. CAMADA DE LÓGICA
// ============================================================================

function useAlertTelemetry() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "A-9241", kind: "fire", title: "Risco crítico de incêndio", region: "Mato Grosso · Quadrante N12", lat: -12.43, lon: -55.21, confidence: 99.2, ago: 12, sat: "ORION-34", embeddingDim: 768, bytes: 1840 },
    { id: "A-9240", kind: "gas", title: "Anomalia de gás metano", region: "Bacia de Campos · Plataforma 7", lat: -22.81, lon: -40.12, confidence: 94.7, ago: 48, sat: "ORION-12", embeddingDim: 512, bytes: 920 },
    { id: "A-9238", kind: "flood", title: "Enchente progressiva", region: "Rio Grande do Sul · Vale do Taquari", lat: -29.45, lon: -52.10, confidence: 88.3, ago: 124, sat: "ORION-21", embeddingDim: 768, bytes: 2110 },
  ]);

  useEffect(() => {
    const clock = setInterval(() => setAlerts((prev) => prev.map((a) => ({ ...a, ago: a.ago + 1 }))), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const stream = setInterval(() => {
      const kinds: AlertKind[] = ["fire", "gas", "flood", "storm"];
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const titles = { fire: "Foco térmico emergente", gas: "Pluma de gás detectada", flood: "Saturação hídrica anômala", storm: "Cluster convectivo" };
      
      const newAlert: Alert = {
        id: `A-${Math.floor(9000 + Math.random() * 999)}`,
        kind: k,
        title: titles[k],
        region: ["Amazonas · AM-W07", "Goiás · GO-C03", "Bahia · BA-N09", "Pacífico-S Lat -36°"][Math.floor(Math.random() * 4)],
        lat: -30 + Math.random() * 25,
        lon: -65 + Math.random() * 30,
        confidence: 80 + Math.random() * 19,
        ago: 0,
        sat: `ORION-${String(Math.floor(Math.random() * 99)).padStart(2, "0")}`,
        embeddingDim: Math.random() > 0.5 ? 768 : 512,
        bytes: 800 + Math.floor(Math.random() * 1500),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 12));
    }, 14000);
    return () => clearInterval(stream);
  }, []);

  return { alerts };
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

function AlertsPage() {
  const { alerts } = useAlertTelemetry();
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id);
  const [filter, setFilter] = useState<"all" | AlertKind>("all");

  const selected = useMemo(() => alerts.find((a) => a.id === selectedAlertId) || alerts[0], [alerts, selectedAlertId]);
  const filteredAlerts = useMemo(() => (filter === "all" ? alerts : alerts.filter((a) => a.kind === filter)), [alerts, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-3 shrink-0">
        <div className="text-[9px] font-mono text-muted-foreground tracking-[0.3em]">ENTREGA SEMÂNTICA · CAMADA 04</div>
        <h1 className="text-xl lg:text-3xl font-semibold text-glow">Central de Alertas</h1>
      </div>

      <div className="px-4 lg:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
        {(["all", "fire", "gas", "flood", "storm"] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 px-4 py-2 rounded-full border text-xs font-medium transition-all ${filter === k ? "bg-primary/15 border-primary/50 text-primary" : "bg-surface/40 border-border text-muted-foreground"}`}>
            {k === "all" ? "Todos os Alertas" : KIND_META[k as AlertKind].label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 px-4 lg:px-8 pb-4 lg:pb-8 min-h-0 overflow-hidden">
        {/* Lista de Alertas */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-surface/40 flex flex-col overflow-hidden h-[40vh] lg:h-full">
          <div className="p-3 border-b border-border bg-surface-elevated/30 shrink-0 flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Feed em Tempo Real</span>
            <Activity className="h-3 w-3 text-primary animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence initial={false}>
              {filteredAlerts.map((a) => {
                const meta = KIND_META[a.kind];
                const active = selected?.id === a.id;
                return (
                  <motion.button key={a.id} layout="position" onClick={() => setSelectedAlertId(a.id)} className={`w-full text-left p-4 border-b border-border transition-colors ${active ? "bg-surface-elevated/80 border-l-2 border-l-primary" : "hover:bg-surface-elevated/40"}`}>
                    <div className="flex gap-3">
                      <div className={`h-8 w-8 rounded-lg grid place-items-center ${meta.bg} ${meta.color}`}><meta.icon className="h-4 w-4" /></div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{a.title}</div>
                        <div className="text-[10px] text-muted-foreground">{a.region}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Mapa e Detalhes */}
        <div className="flex-1 lg:col-span-8 flex flex-col gap-4 lg:gap-6 min-h-0">

          {/* MOBILE*/}
          <div className="h-[280px] lg:h-[60vh] rounded-xl overflow-hidden border border-border">
            {selected && (
              <AnomalyMap
                alerts={alerts}
                selectedId={selected.id}
                onSelect={setSelectedAlertId}
              />
            )}
          </div>

          <div className="overflow-y-auto scrollbar-hide">
            {selected && <SemanticDetail alert={selected} />}
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. SUBCOMPONENTES
// ============================================================================

function AnomalyMap({ alerts, selectedId, onSelect }: { alerts: Alert[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative w-full h-full bg-surface/40 grid-bg overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <path d="M 30,15 L 50,12 L 65,18 L 72,32 L 78,45 L 75,62 L 68,75 L 58,86 L 48,92 L 38,88 L 30,78 L 25,62 L 22,45 L 24,28 Z" fill="oklch(0.24 0.05 260 / 0.3)" stroke="oklch(0.42 0.06 235 / 0.4)" strokeWidth="0.4" />
      </svg>
      {alerts.map((a) => {
        const isActive = a.id === selectedId;
        const colorClass = KIND_META[a.kind].color.replace("text-", "bg-");
        return (
          <button key={a.id} onClick={() => onSelect(a.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 transition-transform ${isActive ? "scale-125 z-20" : "z-10"}`}
            style={{ left: `${Math.max(5, Math.min(95, ((a.lon + 85) / 55) * 100))}%`, top: `${Math.max(5, Math.min(95, ((10 - a.lat) / 45) * 100))}%` }}
          >
            <span className={`block h-3 w-3 rounded-full ${colorClass}`} />
          </button>
        );
      })}
    </div>
  );
}

function SemanticDetail({ alert }: { alert: Alert }) {
  const meta = KIND_META[alert.kind];
  const Icon = meta.icon;

  const payload = useMemo(() => ({
    event_uuid: alert.id,
    sensor_node: alert.sat,
    timestamp: new Date(Date.now() - alert.ago * 1000).toISOString(),
    geospatial: { lat: alert.lat, lon: alert.lon },
    inference: { type: alert.kind, confidence_score: Number((alert.confidence / 100).toFixed(4)) },
    vector_embedding: { model: "vit-base-patch16-224", dtype: "int8", dimensions: alert.embeddingDim, size_bytes: alert.bytes },
    routing: { protocol: "BPv7-DTN", hops_to_ground: 3 }
  }), [alert]);

  return (
    <div className="rounded-xl border border-border bg-surface/40 flex flex-col h-full">
      {/* Cabeçalho do Card (tamanho fixo) */}
      <div className="p-4 border-b border-border shrink-0">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md ${meta.bg} ${meta.color} ${meta.border} border text-[10px] font-mono font-bold tracking-wider`}>
          <Icon className="h-3 w-3" /> {meta.label.toUpperCase()}
        </div>
        <h2 className="mt-3 text-lg font-semibold text-foreground truncate">{alert.title}</h2>
        
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatBox label="Confiança" value={`${alert.confidence.toFixed(1)}%`} isPrimary />
          <StatBox label="Latência" value={`${(0.4 + alert.ago / 240).toFixed(1)}s`} />
          <StatBox label="Nó" value={alert.sat} isMono />
          <StatBox label="Payload" value={`${alert.bytes} B`} isMono />
        </div>
      </div>
      
      {/* Área do JSON*/}
      <div className="bg-[#090D1A] p-3 text-[10px] font-mono text-[#A3B8CC] flex-1 overflow-y-auto scrollbar-hide">
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}

function StatBox({ label, value, isPrimary, isMono }: { label: string; value: string; isPrimary?: boolean; isMono?: boolean }) {
  return (
    <div className="p-2 rounded-lg bg-surface-elevated/40 border border-border/50 text-center">
      <div className="text-[8px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-xs font-bold ${isMono ? "font-mono" : ""} ${isPrimary ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}