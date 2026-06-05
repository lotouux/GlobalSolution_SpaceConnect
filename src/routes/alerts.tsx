import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Wind, Droplets, CloudLightning, MapPin, Clock,
  Satellite, FileJson, ChevronRight, Activity
} from "lucide-react";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

// ============================================================================
// 1. TIPAGENS E CONSTANTES
// ============================================================================

export type AlertKind = "fire" | "gas" | "flood" | "storm";

export interface Alert {
  id: string;
  kind: AlertKind;
  title: string;
  region: string;
  lat: number;
  lon: number;
  confidence: number;
  ago: number; // segundos
  sat: string;
  embeddingDim: number;
  bytes: number;
}

const KIND_META: Record<AlertKind, { icon: any, label: string, color: string, bg: string, border: string }> = {
  fire: { icon: Flame, label: "Incêndio", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40" },
  gas: { icon: Wind, label: "Gás", color: "text-warning", bg: "bg-warning/15", border: "border-warning/40" },
  flood: { icon: Droplets, label: "Enchente", color: "text-accent", bg: "bg-accent/15", border: "border-accent/40" },
  storm: { icon: CloudLightning, label: "Tempestade", color: "text-primary", bg: "bg-primary/15", border: "border-primary/40" },
};

// ============================================================================
// 2. CAMADA DE SERVIÇO (abstrai a simulação de API)
// ============================================================================

function useAlertTelemetry() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "A-9241", kind: "fire", title: "Risco crítico de incêndio", region: "Mato Grosso · Quadrante N12", lat: -12.43, lon: -55.21, confidence: 99.2, ago: 12, sat: "ORION-34", embeddingDim: 768, bytes: 1840 },
    { id: "A-9240", kind: "gas", title: "Anomalia de gás metano", region: "Bacia de Campos · Plataforma 7", lat: -22.81, lon: -40.12, confidence: 94.7, ago: 48, sat: "ORION-12", embeddingDim: 512, bytes: 920 },
    { id: "A-9238", kind: "flood", title: "Enchente progressiva", region: "Rio Grande do Sul · Vale do Taquari", lat: -29.45, lon: -52.10, confidence: 88.3, ago: 124, sat: "ORION-21", embeddingDim: 768, bytes: 2110 },
  ]);

  // Atualiza o relógio interno dos alertas
  useEffect(() => {
    const clock = setInterval(() => {
      setAlerts((prev) => prev.map((a) => ({ ...a, ago: a.ago + 1 })));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Simula a chegada de novos payloads da rede Mesh
  useEffect(() => {
    const stream = setInterval(() => {
      const kinds: AlertKind[] = ["fire", "gas", "flood", "storm"];
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const titles = {
        fire: "Foco térmico emergente",
        gas: "Pluma de gás detectada",
        flood: "Saturação hídrica anômala",
        storm: "Cluster convectivo",
      };
      
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
      
      setAlerts((prev) => [newAlert, ...prev].slice(0, 12)); // Mantém apenas os 12 mais recentes
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

  // Garante que o componente selecionado está sempre atualizado com os dados da stream
  const selected = useMemo(
    () => alerts.find((a) => a.id === selectedAlertId) || alerts[0],
    [alerts, selectedAlertId]
  );

  const filteredAlerts = useMemo(
    () => (filter === "all" ? alerts : alerts.filter((a) => a.kind === filter)),
    [alerts, filter]
  );

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen overflow-y-auto lg:overflow-hidden flex flex-col bg-background">
      {/* Cabeçalho */}
      <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-3 lg:pb-4 shrink-0">
        <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em]">ENTREGA SEMÂNTICA · CAMADA 04</div>
        <h1 className="text-xl lg:text-3xl font-semibold tracking-tight text-glow leading-tight">Central de Alertas</h1>
        <p className="hidden lg:block text-sm text-muted-foreground mt-1">
          Anomalias detectadas em órbita · payloads vetoriais via protocolo DTN
        </p>
      </div>

      {/* Filtros */}
      <div className="px-4 lg:px-8 pb-3 flex gap-2 text-xs overflow-x-auto shrink-0 scrollbar-hide">
        {(["all", "fire", "gas", "flood", "storm"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 px-4 py-2 rounded-full border transition-all duration-200 font-medium ${
              filter === k
                ? "bg-primary/15 border-primary/50 text-primary shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                : "bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {k === "all" ? "Todos os Alertas" : KIND_META[k as AlertKind].label}
          </button>
        ))}
      </div>

      {/* Layout de Conteúdo */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 px-4 lg:px-8 pb-20 lg:pb-8 lg:min-h-0">
        
        {/* Lista de Alertas (Esquerda no Desktop, Embaixo no Mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-4 rounded-xl border border-border bg-surface/40 flex flex-col overflow-hidden h-[50vh] lg:h-full">
          <div className="p-3 border-b border-border bg-surface-elevated/30 shrink-0 flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Feed em Tempo Real</span>
            <Activity className="h-3 w-3 text-primary animate-pulse" />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredAlerts.map((a) => {
                const meta = KIND_META[a.kind];
                const active = selected?.id === a.id;
                
                return (
                  <motion.button
                    key={a.id}
                    layout="position"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedAlertId(a.id)}
                    className={`w-full text-left p-3 lg:p-4 border-b border-border flex gap-3 transition-colors ${
                      active ? "bg-surface-elevated/80 border-l-2 border-l-primary" : "hover:bg-surface-elevated/40 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center ${meta.bg} ${meta.color}`}>
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{a.id}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{formatTimeString(a.ago)}</span>
                        </div>
                      </div>
                      <div className={`text-sm font-medium mt-0.5 truncate ${active ? "text-foreground" : "text-foreground/80"}`}>{a.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.region}</div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Mapa e Detalhes (Direita no Desktop, Em Cima no Mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col gap-4 lg:gap-6 min-h-[50vh] lg:min-h-0">
          <div className="h-[250px] lg:h-auto lg:flex-1 shrink-0 rounded-xl overflow-hidden border border-border">
            {selected && <AnomalyMap alerts={alerts} selectedId={selected.id} onSelect={setSelectedAlertId} />}
          </div>
          <div className="shrink-0">
            {selected && <SemanticDetail alert={selected} />}
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 4. SUBCOMPONENTES E UTILITÁRIOS
// ============================================================================

function formatTimeString(seconds: number) {
  if (seconds < 60) return `${seconds}s atrás`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
  return `${Math.floor(seconds / 3600)}h atrás`;
}

function AnomalyMap({ alerts, selectedId, onSelect }: { alerts: Alert[]; selectedId: string; onSelect: (id: string) => void }) {
  // Projeção simples para a América do Sul
  const projectCoordinates = useCallback((lat: number, lon: number) => {
    const x = ((lon + 85) / 55) * 100;
    const y = ((10 - lat) / 45) * 100;
    return { x, y };
  }, []);

  return (
    <div className="relative w-full h-full bg-surface/40 grid-bg">
      <div className="absolute top-3 left-3 z-10 text-[10px] font-mono text-muted-foreground tracking-widest bg-background/50 px-2 py-1 rounded backdrop-blur-sm">
        LAT -35..10 · LON -85..-30
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        SAT SENSOR
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d="M 30,15 L 50,12 L 65,18 L 72,32 L 78,45 L 75,62 L 68,75 L 58,86 L 48,92 L 38,88 L 30,78 L 25,62 L 22,45 L 24,28 Z"
          fill="oklch(0.24 0.05 260 / 0.3)"
          stroke="oklch(0.42 0.06 235 / 0.4)"
          strokeWidth="0.4"
        />
      </svg>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-scan" />
      </div>

      {alerts.map((a) => {
        const { x, y } = projectCoordinates(a.lat, a.lon);
        const meta = KIND_META[a.kind];
        const isActive = a.id === selectedId;
        
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 group transition-transform ${isActive ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Ver detalhe do alerta ${a.id}`}
          >
            {isActive && <span className={`absolute inset-0 rounded-full ${meta.bg} animate-pulse-ring`} />}
            <span className={`relative block h-3 w-3 rounded-full ${meta.color.replace("text-", "bg-")} transition-all duration-300 ${isActive ? "ring-2 ring-background ring-offset-1 ring-offset-primary" : ""}`}
              style={{ boxShadow: isActive ? `0 0 15px currentColor` : 'none' }}
            />
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
    inference: {
      type: alert.kind,
      confidence_score: Number((alert.confidence / 100).toFixed(4)),
    },
    vector_embedding: {
      model: "vit-base-patch16-224",
      dtype: "int8",
      dimensions: alert.embeddingDim,
      size_bytes: alert.bytes,
    },
    routing: { protocol: "BPv7-DTN", hops_to_ground: 3 }
  }), [alert]);

  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden grid grid-cols-1 lg:grid-cols-5">
      <div className="lg:col-span-2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-border">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md ${meta.bg} ${meta.color} ${meta.border} border text-[11px] font-mono font-semibold tracking-wider`}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label.toUpperCase()}
        </div>
        
        <h2 className="mt-3 text-lg lg:text-xl font-semibold leading-tight text-foreground">{alert.title}</h2>
        <div className="mt-2 text-xs lg:text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{alert.region}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatBox label="Confiança IA" value={`${alert.confidence.toFixed(1)}%`} isPrimary />
          <StatBox label="Latência E2E" value={`${(0.4 + alert.ago / 240).toFixed(1)}s`} />
          <StatBox label="Nó Orbital" value={alert.sat} isMono />
          <StatBox label="Payload" value={`${alert.bytes} B`} isMono />
        </div>
      </div>

      <div className="lg:col-span-3 bg-[#090D1A] flex flex-col">
        <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          <FileJson className="h-3 w-3 text-primary" />
          Payload Decodificado (JSON)
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <pre className="text-[11px] font-mono leading-relaxed text-[#A3B8CC]">
            {JSON.stringify(payload, null, 2).replace(/"([^"]+)":/g, '<span class="text-[#64B5F6]">$1</span>:')}
          </pre>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, isPrimary, isMono }: { label: string; value: string; isPrimary?: boolean; isMono?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-surface-elevated/40 border border-border/50 flex flex-col justify-center">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className={`text-base font-medium ${isMono ? "font-mono tracking-tight" : ""} ${isPrimary ? "text-primary text-lg" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}