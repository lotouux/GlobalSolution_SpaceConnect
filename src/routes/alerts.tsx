import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Wind, Droplets, CloudLightning, MapPin, Clock,
  Satellite, FileJson, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Central de Alertas · ORION" },
      { name: "description", content: "Semantic anomaly alerts delivered from orbit." },
    ],
  }),
  component: AlertsPage,
});

interface Alert {
  id: string;
  kind: "fire" | "gas" | "flood" | "storm";
  title: string;
  region: string;
  lat: number;
  lon: number;
  confidence: number;
  ago: number; // seconds
  sat: string;
  embeddingDim: number;
  bytes: number;
}

const seed: Alert[] = [
  { id: "A-9241", kind: "fire", title: "Risco crítico de incêndio", region: "Mato Grosso · Quadrante N12", lat: -12.43, lon: -55.21, confidence: 99.2, ago: 12, sat: "ORION-34", embeddingDim: 768, bytes: 1840 },
  { id: "A-9240", kind: "gas", title: "Anomalia de gás metano", region: "Bacia de Campos · Plataforma 7", lat: -22.81, lon: -40.12, confidence: 94.7, ago: 48, sat: "ORION-12", embeddingDim: 512, bytes: 920 },
  { id: "A-9238", kind: "flood", title: "Enchente progressiva", region: "Rio Grande do Sul · Vale do Taquari", lat: -29.45, lon: -52.10, confidence: 88.3, ago: 124, sat: "ORION-21", embeddingDim: 768, bytes: 2110 },
  { id: "A-9237", kind: "storm", title: "Célula convectiva severa", region: "Atlântico Sul · Lat -28°", lat: -28.10, lon: -42.50, confidence: 96.1, ago: 218, sat: "ORION-08", embeddingDim: 512, bytes: 1450 },
  { id: "A-9235", kind: "fire", title: "Foco térmico emergente", region: "Pará · Tapajós-S04", lat: -4.91, lon: -54.74, confidence: 91.5, ago: 410, sat: "ORION-44", embeddingDim: 768, bytes: 1680 },
];

const KIND_META = {
  fire: { icon: Flame, label: "Incêndio", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40" },
  gas: { icon: Wind, label: "Gás", color: "text-warning", bg: "bg-warning/15", border: "border-warning/40" },
  flood: { icon: Droplets, label: "Enchente", color: "text-accent", bg: "bg-accent/15", border: "border-accent/40" },
  storm: { icon: CloudLightning, label: "Tempestade", color: "text-primary", bg: "bg-primary/15", border: "border-primary/40" },
} as const;

function AlertsPage() {
  const [alerts, setAlerts] = useState(seed);
  const [selected, setSelected] = useState<Alert>(seed[0]);
  const [filter, setFilter] = useState<"all" | Alert["kind"]>("all");

  useEffect(() => {
    const t = setInterval(() => {
      setAlerts((prev) => prev.map((a) => ({ ...a, ago: a.ago + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const kinds: Alert["kind"][] = ["fire", "gas", "flood", "storm"];
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const titles = {
        fire: "Foco térmico emergente",
        gas: "Pluma de gás detectada",
        flood: "Saturação hídrica anômala",
        storm: "Cluster convectivo",
      } as const;
      const newAlert: Alert = {
        id: "A-" + (9242 + Math.floor(Math.random() * 99)),
        kind: k,
        title: titles[k],
        region: ["Amazonas · AM-W07", "Goiás · GO-C03", "Bahia · BA-N09", "Pacífico-S Lat -36°"][Math.floor(Math.random() * 4)],
        lat: -30 + Math.random() * 25,
        lon: -65 + Math.random() * 30,
        confidence: 80 + Math.random() * 19,
        ago: 0,
        sat: "ORION-" + String(Math.floor(Math.random() * 99)).padStart(2, "0"),
        embeddingDim: Math.random() > 0.5 ? 768 : 512,
        bytes: 800 + Math.floor(Math.random() * 1500),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 12));
    }, 14000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? alerts : alerts.filter((a) => a.kind === filter)),
    [alerts, filter],
  );

  return (
    <div className="h-[calc(100vh-7.5rem)] lg:h-screen overflow-y-auto lg:overflow-hidden flex flex-col">
      <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-3 lg:pb-4">
        <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em]">ENTREGA SEMÂNTICA · CAMADA 04</div>
        <h1 className="text-xl lg:text-3xl font-semibold tracking-tight text-glow leading-tight">Central de Alertas</h1>
        <p className="hidden lg:block text-sm text-muted-foreground mt-1">
          Anomalias detectadas em órbita · payloads vetoriais via BPv7 fault-tolerant
        </p>
      </div>

      <div className="px-4 lg:px-8 pb-3 flex gap-2 text-xs overflow-x-auto">
        {(["all", "fire", "gas", "flood", "storm"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 px-3 py-1.5 rounded-full border transition-colors ${
              filter === k
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-surface/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {k === "all" ? "Todos" : KIND_META[k].label}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 px-4 lg:px-8 pb-4 lg:pb-8 lg:min-h-0">
        {/* Map first on mobile */}
        <div className="order-1 lg:order-2 lg:col-span-8 grid grid-rows-[200px_auto] lg:grid-rows-2 gap-4 lg:gap-6 lg:min-h-0">
          <AnomalyMap alerts={alerts} selected={selected} onSelect={setSelected} />
          <SemanticDetail alert={selected} />
        </div>

        {/* List */}
        <div className="order-2 lg:order-1 lg:col-span-4 rounded-xl border border-border bg-surface/40 lg:overflow-y-auto max-h-[60vh] lg:max-h-none overflow-y-auto">
          <AnimatePresence initial={false}>
            {filtered.map((a) => {
              const meta = KIND_META[a.kind];
              const Icon = meta.icon;
              const active = selected.id === a.id;
              return (
                <motion.button
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelected(a)}
                  className={`w-full text-left p-3 lg:p-4 border-b border-border flex gap-3 transition-colors ${
                    active ? "bg-surface-elevated" : "hover:bg-surface-elevated/50"
                  }`}
                >
                  <div className={`h-9 w-9 shrink-0 rounded-md grid place-items-center ${meta.bg} ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span>{a.id}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatAgo(a.ago)}</span>
                    </div>
                    <div className="text-sm font-medium mt-0.5 truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.region}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 self-center text-muted-foreground ${active ? "text-primary" : ""}`} />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function formatAgo(s: number) {
  if (s < 60) return `há ${s}s`;
  if (s < 3600) return `há ${Math.floor(s / 60)}m`;
  return `há ${Math.floor(s / 3600)}h`;
}

function AnomalyMap({ alerts, selected, onSelect }: { alerts: Alert[]; selected: Alert; onSelect: (a: Alert) => void }) {
  // map approx: lon -85..-30, lat -35..10
  const toXY = (lat: number, lon: number) => {
    const x = ((lon + 85) / 55) * 100;
    const y = ((10 - lat) / 45) * 100;
    return { x, y };
  };

  return (
    <div className="relative rounded-xl border border-border bg-surface/40 overflow-hidden grid-bg">
      <div className="absolute top-3 left-3 z-10 text-[10px] font-mono text-muted-foreground tracking-widest">
        AMÉRICA DO SUL · SVG TILES · LIVE FEED
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px] font-mono text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        STREAM ATIVO
      </div>

      {/* abstract south america silhouette */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path
          d="M 30,15 L 50,12 L 65,18 L 72,32 L 78,45 L 75,62 L 68,75 L 58,86 L 48,92 L 38,88 L 30,78 L 25,62 L 22,45 L 24,28 Z"
          fill="oklch(0.24 0.05 260 / 0.6)"
          stroke="oklch(0.42 0.06 235 / 0.6)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan" />
      </div>

      {/* Alerts */}
      {alerts.map((a) => {
        const { x, y } = toXY(a.lat, a.lon);
        const meta = KIND_META[a.kind];
        const active = a.id === selected.id;
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className={`absolute inset-0 rounded-full ${meta.bg} animate-pulse-ring`} />
            <span className={`relative block h-3 w-3 rounded-full ${meta.color.replace("text-", "bg-")} ${active ? "ring-2 ring-foreground" : ""}`}
              style={{ boxShadow: "0 0 12px currentColor" }}
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
    alert_id: alert.id,
    detected_by: alert.sat,
    timestamp_utc: new Date(Date.now() - alert.ago * 1000).toISOString(),
    coordinates: { lat: alert.lat, lon: alert.lon },
    classification: alert.kind,
    confidence: alert.confidence / 100,
    semantic_embedding: {
      dim: alert.embeddingDim,
      dtype: "int8",
      bytes: alert.bytes,
      preview: Array.from({ length: 6 }, (_, i) =>
        Number((Math.sin(i + alert.confidence) * 0.42).toFixed(4))
      ),
    },
    onboard_pipeline: ["radiometric_calibration", "tensorrt_vit_inference", "int8_quantization", "flatbuffer_serialize"],
    delivery: { protocol: "BPv7", hops: 4, downlink_kbps: 12 },
  }), [alert]);

  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden grid grid-cols-1 lg:grid-cols-5">
      <div className="lg:col-span-2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-border">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border text-[11px] font-mono`}>
          <Icon className="h-3 w-3" />
          {meta.label.toUpperCase()}
        </div>
        <h2 className="mt-3 text-base lg:text-xl font-semibold leading-tight">{alert.title}</h2>
        <div className="mt-2 text-xs lg:text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{alert.region}</span>
        </div>

        <div className="mt-4 lg:mt-5 grid grid-cols-2 gap-2 lg:gap-3">
          <Stat label="Confiança IA" value={`${alert.confidence.toFixed(1)}%`} accent />
          <Stat label="Latência E2E" value={`${(0.4 + alert.ago / 240).toFixed(1)}s`} />
          <Stat label="Satélite" value={alert.sat} mono />
          <Stat label="Payload" value={`${alert.bytes} B`} mono />
        </div>

        <div className="mt-4 lg:mt-5 flex items-start gap-1.5 text-[10px] font-mono text-muted-foreground">
          <Satellite className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <span>Embedding INT8 · 99% menor que raw hyperspectral</span>
        </div>
      </div>

      <div className="lg:col-span-3 bg-background/50 flex flex-col max-h-[280px] lg:max-h-none">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest">
          <FileJson className="h-3 w-3" />
          PAYLOAD · FlatBuffers → JSON
        </div>
        <pre className="flex-1 overflow-auto p-3 lg:p-4 text-[10px] lg:text-[11px] font-mono leading-relaxed text-foreground/90">
{JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="p-3 rounded-md bg-background/50 border border-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} ${accent ? "text-primary text-lg" : "text-base"}`}>{value}</div>
    </div>
  );
}
