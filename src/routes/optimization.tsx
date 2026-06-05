import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Database, Gauge, Zap, Sliders,
  CheckCircle2, XCircle, DollarSign, ArrowUpRight, Play, Pause,
} from "lucide-react";

export const Route = createFileRoute("/optimization")({
  component: OptimizationPage,
});

// ============================================================================
// 1. TIPAGENS E CONSTANTES
// ============================================================================

interface CacheLog {
  id: number;
  name: string;
  sim: number;
  hit: boolean;
  ms: number;
  mb: number;
}

const INITIAL_LOG: CacheLog[] = [
  { id: 1, name: "Mapeamento Queimada · MT-N12", sim: 96.4, hit: true, ms: 38, mb: 1840 },
  { id: 2, name: "NDVI Soja · Cerrado-09", sim: 91.2, hit: true, ms: 52, mb: 1240 },
  { id: 3, name: "Pluma Térmica · Refinaria-RJ", sim: 88.1, hit: false, ms: 612, mb: 1980 },
  { id: 4, name: "Cobertura Nuvens · Pacífico-S", sim: 99.1, hit: true, ms: 31, mb: 2100 },
  { id: 5, name: "Anomalia Gás · Bacia-Campos", sim: 79.5, hit: false, ms: 740, mb: 1620 },
];

// ============================================================================
// 2. CAMADA DE LÓGICA
// ============================================================================

function useSemanticCache() {
  const [threshold, setThreshold] = useState(92);
  const [log, setLog] = useState<CacheLog[]>(INITIAL_LOG);
  const [counter, setCounter] = useState(100);
  const [paused, setPaused] = useState(false);

  const generateRequest = useCallback((id: number, currentThreshold: number): CacheLog => {
    const presets = [
      "Mapeamento Queimada · ", "NDVI Soja · ", "Pluma Térmica · ", "Cobertura Nuvens · ",
      "Anomalia Gás · ", "Embargo Florestal · ", "Derretimento Glacial · ", "Tempestade Convectiva · ",
    ];
    const regions = ["MT-N12", "PA-S04", "AM-W07", "Cerrado-09", "Pacífico-S", "Atlântico-N", "BR-NE03", "Andes-22"];
    
    // Simula cálculo de similaridade por cosseno do modelo de IA
    const sim = 70 + Math.random() * 30;
    const hit = sim >= currentThreshold;
    
    return {
      id,
      name: presets[Math.floor(Math.random() * presets.length)] + regions[Math.floor(Math.random() * regions.length)],
      sim: Number(sim.toFixed(1)),
      hit,
      ms: hit ? 25 + Math.floor(Math.random() * 60) : 400 + Math.floor(Math.random() * 500),
      mb: 800 + Math.floor(Math.random() * 1500),
    };
  }, []);

  // Motor de simulação
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setCounter((c) => c + 1);
      setLog((prev) => {
        const newReq = generateRequest(counter, threshold);
        return [newReq, ...prev].slice(0, 15); // Mantém os últimos 15 eventos
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [counter, threshold, paused, generateRequest]);

  // Cálculos de Performance Derivados (Memoizados para não re-renderizar à toa)
  const stats = useMemo(() => {
    const totalRequests = Math.max(log.length, 1); // Evita divisão por zero
    const hits = log.filter((l) => l.hit).length;
    const hitRate = (hits / totalRequests) * 100;
    const savedMB = log.filter((l) => l.hit).reduce((s, l) => s + l.mb, 0);
    const avgMs = Math.round(log.reduce((s, l) => s + l.ms, 0) / totalRequests);
    
    // Projeções mensais ilustrativas para o Pitch
    const savedTB = 42 + savedMB / 1024 / 1024;
    const savedDollars = savedTB * 60000; // Custo estimado de downlink + GPU

    return { 
      hitRate, 
      savedMB, 
      avgMs, 
      hits, 
      misses: log.length - hits,
      savedTB,
      savedDollars
    };
  }, [log]);

  return {
    threshold,
    setThreshold,
    log,
    paused,
    setPaused,
    stats
  };
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL (Interface Gráfica)
// ============================================================================

function OptimizationPage() {
  const { threshold, setThreshold, log, paused, setPaused, stats } = useSemanticCache();

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen overflow-y-auto bg-background pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
          <div className="min-w-0">
            <div className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Métrica de Eficiência · Camada 03</div>
            <h1 className="text-xl lg:text-3xl font-semibold tracking-tight text-glow leading-tight mt-1">Cache Semântico em Órbita</h1>
            <p className="hidden lg:block text-sm text-muted-foreground mt-2 max-w-2xl">
              Monitorização da deduplicação de inferências via similaridade de cosseno. Otimiza o uso do link óptico e poupa poder de processamento da malha.
            </p>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Retomar monitorização" : "Pausar monitorização"}
            className={`shrink-0 flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg border transition-all ${
              paused 
                ? "bg-primary/10 border-primary/50 text-primary glow-primary" 
                : "bg-surface/60 border-border text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span className="hidden sm:inline text-xs font-medium">{paused ? "Retomar Feed" : "Pausar Feed"}</span>
          </button>
        </header>

        {/* Hero KPI (Destaque Financeiro/Dados) */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface/40 to-transparent p-6 lg:p-8 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Economia Estimada Projetada (30 dias)
            </div>
            <div className="flex items-baseline gap-2 lg:gap-3">
              <motion.div
                key={Math.floor(stats.savedTB)}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl lg:text-7xl font-bold font-mono text-primary text-glow tracking-tighter"
              >
                {stats.savedTB.toFixed(2)}
              </motion.div>
              <div className="text-2xl lg:text-3xl font-mono text-muted-foreground font-light">TB</div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs lg:text-sm flex-wrap bg-background/40 inline-flex px-3 py-1.5 rounded-lg border border-border/50">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-foreground text-base lg:text-lg">
                ${(stats.savedDollars / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-muted-foreground">poupados em downlink + processamento de GPU</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-primary ml-1" />
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              <KpiCard icon={Gauge} label="Hit Rate Médio" value={`${stats.hitRate.toFixed(1)}%`} delta="+3.2%" positive />
              <KpiCard icon={Zap} label="Latência Média" value={`${stats.avgMs}ms`} delta="-18ms" positive />
              <KpiCard icon={Database} label="Objetos em Custódia" value="142" delta="+12" positive={false} />
            </div>
          </div>
        </section>

        {/* Configurações e Gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          
          {/* Gráfico Donut */}
          <div className="lg:col-span-1 rounded-2xl border border-border bg-surface/40 backdrop-blur-sm p-6 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Resolução de Requisições
              </h3>
              <p className="text-[10px] text-muted-foreground/70 mb-6">Proporção de Hits vs Misses na malha.</p>
            </div>
            <DonutChart hits={stats.hits} misses={stats.misses} />
            <div className="mt-6 space-y-3 text-xs bg-background/50 p-4 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-foreground font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Resolvido em Órbita (Cache Hit)
                </span>
                <span className="font-mono text-primary font-bold">{stats.hits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-elevated border border-border" />
                  Novo Processamento (Miss)
                </span>
                <span className="font-mono">{stats.misses}</span>
              </div>
            </div>
          </div>

          {/* Slider de Controle */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/40 backdrop-blur-sm p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              <Sliders className="h-4 w-4 text-foreground" />
              Agressividade do Motor Semântico
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-8">
              Ajuste o limiar mínimo de similaridade de cosseno necessário para um pacote de dados ser considerado um <strong>Cache Hit</strong>.
            </p>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-end gap-3 mb-6">
                <div className="text-5xl lg:text-6xl font-mono font-bold text-primary tracking-tighter">{threshold}<span className="text-3xl text-primary/50">%</span></div>
                <div className="text-xs font-medium px-3 py-1 rounded-full bg-surface-elevated border border-border text-muted-foreground mb-2">
                  {threshold < 85 ? "MODO AGRESSIVO (Maior Economia)" : threshold < 95 ? "MODO BALANCEADO" : "MODO CONSERVADOR (Maior Precisão)"}
                </div>
              </div>

              <div className="relative pt-2 pb-6">
                <input
                  type="range"
                  min={70}
                  max={100}
                  step={0.5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  aria-label="Ajustar limiar de similaridade"
                  className="w-full h-3 appearance-none bg-surface-elevated rounded-full cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background
                    [&::-webkit-slider-thumb]:shadow-[0_0_20px_oklch(0.72_0.18_158/0.8)]
                    [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((threshold - 70) / 30) * 100}%, var(--surface-elevated) ${((threshold - 70) / 30) * 100}%, var(--surface-elevated) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-4 text-[10px] font-mono font-medium text-muted-foreground/80 px-1">
                  <span>70% (Baixa Prec.)</span>
                  <span>85%</span>
                  <span className="text-foreground">92% (Default)</span>
                  <span>100% (Match Exato)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-auto">
                <ThresholdPreset label="Fenómenos Climáticos" value={90} active={threshold === 90} onClick={() => setThreshold(90)} />
                <ThresholdPreset label="Desmatamento Florestal" value={94} active={threshold === 94} onClick={() => setThreshold(94)} />
                <ThresholdPreset label="Focos de Incêndio" value={99} active={threshold === 99} onClick={() => setThreshold(99)} />
              </div>
            </div>
          </div>
        </section>

        {/* Tabela de Logs */}
        <section className="rounded-2xl border border-border bg-surface/40 backdrop-blur-sm overflow-hidden shadow-lg mb-8">
          <div className="px-5 lg:px-6 py-4 border-b border-border bg-surface-elevated/20 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Log de Auditoria da Malha
              </h3>
              <div className="text-xs font-mono text-foreground mt-1 flex items-center gap-2">
                <span>Total de eventos registados: {log.length}</span>
                <span className={`h-2 w-2 rounded-full ${paused ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Threshold Atual</span>
              <div className="text-lg font-mono font-bold text-primary">{threshold}%</div>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground border-b border-border bg-background/40">
            <div className="col-span-5">Requisição Gerada</div>
            <div className="col-span-2">Similaridade Cosseno</div>
            <div className="col-span-2">Latência (E2E)</div>
            <div className="col-span-2">Volume Mitigado</div>
            <div className="col-span-1 text-right">Resultado</div>
          </div>

          <div className="divide-y divide-border/50 max-h-[450px] overflow-y-auto custom-scrollbar">
            <AnimatePresence initial={false}>
              {log.map((row) => (
                <motion.div
                  key={row.id}
                  layout="position"
                  initial={{ opacity: 0, y: -20, backgroundColor: "rgba(16,185,129,0.15)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="px-5 lg:px-6 py-3.5 text-sm lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center hover:bg-surface-elevated/30 transition-colors"
                >
                  {/* Layout Mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-medium truncate flex-1">{row.name}</div>
                      <StatusBadge hit={row.hit} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {row.sim}%</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {row.ms}ms</span>
                      <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {(row.mb / 1024).toFixed(2)} GB</span>
                    </div>
                  </div>

                  {/* Layout Desktop */}
                  <div className="hidden lg:block col-span-5 font-medium truncate pr-4 text-foreground/90">{row.name}</div>
                  <div className="hidden lg:flex col-span-2 items-center gap-2 font-mono text-foreground/80">
                    <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div className={`h-full ${row.sim >= threshold ? 'bg-primary' : 'bg-muted-foreground'}`} style={{ width: `${row.sim}%` }} />
                    </div>
                    {row.sim}%
                  </div>
                  <div className="hidden lg:block col-span-2 font-mono text-muted-foreground">{row.ms}ms</div>
                  <div className="hidden lg:block col-span-2 font-mono text-muted-foreground">{(row.mb / 1024).toFixed(2)} GB</div>
                  <div className="hidden lg:flex col-span-1 justify-end">
                    <StatusBadge hit={row.hit} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// 4. COMPONENTES VISUAIS DE SUPORTE
// ============================================================================

function StatusBadge({ hit }: { hit: boolean }) {
  return hit ? (
    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
      <CheckCircle2 className="h-3.5 w-3.5" /> CACHE HIT
    </span>
  ) : (
    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-muted-foreground text-[10px] font-mono font-bold tracking-widest">
      <XCircle className="h-3.5 w-3.5" /> MISS
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, delta, positive }: { icon: any; label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div className="rounded-xl bg-surface/50 border border-border p-4 lg:p-5 backdrop-blur-sm transition-all hover:bg-surface-elevated/50">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5 text-foreground" />
        {label}
      </div>
      <div className="text-2xl lg:text-3xl font-mono font-bold text-foreground">{value}</div>
      <div className={`text-xs font-medium flex items-center gap-1 mt-2 px-2 py-1 rounded-md inline-flex ${positive ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {delta} vs Ontem
      </div>
    </div>
  );
}

function DonutChart({ hits, misses }: { hits: number; misses: number }) {
  const total = hits + misses || 1;
  const pct = hits / total;
  const C = 2 * Math.PI * 64; // Aumentado um pouco o raio

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
      <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
        {/* Círculo Fundo (Misses) */}
        <circle cx="90" cy="90" r="64" fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="16" />
        
        {/* Círculo Progresso (Hits) */}
        <motion.circle
          cx="90" cy="90" r="64" fill="none"
          stroke="var(--primary)" strokeWidth="16"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - C * pct }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 12px oklch(0.72 0.18 158 / 0.8))" }}
        />
      </svg>
      <div className="absolute text-center flex flex-col items-center">
        <span className="text-4xl font-mono font-bold text-primary text-glow">{(pct * 100).toFixed(0)}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">Eficiência</span>
      </div>
    </div>
  );
}

function ThresholdPreset({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-all duration-200 ${
        active 
          ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-primary/20" 
          : "bg-surface/40 border-border text-muted-foreground hover:bg-surface-elevated hover:border-muted-foreground/50"
      }`}
    >
      <div className="font-mono text-lg font-bold mb-1">{value}%</div>
      <div className="text-[10px] font-medium tracking-wide uppercase leading-tight">{label}</div>
    </button>
  );
}