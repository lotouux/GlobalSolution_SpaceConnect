import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Globe2, BarChart3, Bell, Satellite, Activity } from "lucide-react";
import { motion } from "framer-motion";

// ============================================================================
// 1. CONFIGURAÇÕES E DADOS
// ============================================================================

const NAVIGATION_ITEMS = [
  { to: "/", label: "Mesh", longLabel: "Orbital Mesh", icon: Globe2, code: "L1·L2" },
  { to: "/optimization", label: "Cache", longLabel: "Cache & Otimização", icon: BarChart3, code: "L3" },
  { to: "/alerts", label: "Alertas", longLabel: "Central de Alertas", icon: Bell, code: "L4" },
];

// Mock da telemetria da constelação
const TELEMETRY_MOCK = {
  totalNodes: 124,
  solarNodes: 42,
  eclipseNodes: 82,
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      <MobileHeader />
      <DesktopSidebar pathname={pathname} />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 min-w-0 relative pb-16 lg:pb-0" role="main">
        <Outlet />
      </main>

      <MobileBottomNav pathname={pathname} />
    </div>
  );
}

// ============================================================================
// 3. SUBCOMPONENTES DE INTERFACE (Responsividade)
// ============================================================================

function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-surface/80 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
          <Satellite className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wider text-glow leading-none">ORION</h1>
          <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase mt-0.5">Space Connect</p>
        </div>
      </div>
      
      {/* Mini Telemetria Mobile */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground" aria-label="Status da Constelação">
        <Activity className="h-3 w-3 text-primary animate-pulse" />
        <span className="text-primary" title="Nós Ativos">{TELEMETRY_MOCK.totalNodes}</span>
        <span className="opacity-50">/</span>
        <span className="text-warning" title="Modo Solar">{TELEMETRY_MOCK.solarNodes}</span>
        <span className="opacity-50">/</span>
        <span title="Modo Eclipse">{TELEMETRY_MOCK.eclipseNodes}</span>
      </div>
    </header>
  );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-surface/40 backdrop-blur-xl flex-col z-30">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center glow-primary">
            <Satellite className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-wider text-glow leading-tight">ORION</h2>
            <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Space Connect</p>
          </div>
        </div>
      </div>

      {/* Navegação Desktop */}
      <nav className="flex-1 p-4 space-y-1.5" aria-label="Menu Principal">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/80"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="desktopNavIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full glow-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"}`} />
              <span className="flex-1">{item.longLabel}</span>
              <span className="text-[10px] font-mono opacity-50 bg-background/50 px-1.5 py-0.5 rounded">{item.code}</span>
            </Link>
          );
        })}
      </nav>

      {/* Painel de Telemetria Lateral */}
      <div className="p-4 m-4 rounded-xl bg-surface-elevated/50 border border-border shadow-inner">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground mb-3 tracking-widest uppercase">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          Constelação Ativa
        </div>
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-border/50">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-mono text-primary">{TELEMETRY_MOCK.totalNodes}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Nós</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-mono text-warning">{TELEMETRY_MOCK.solarNodes}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Solar</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-mono text-muted-foreground">{TELEMETRY_MOCK.eclipseNodes}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Eclipse</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 border-t border-border bg-surface/90 backdrop-blur-xl flex shadow-[0_-10px_40px_rgba(0,0,0,0.2)]" aria-label="Menu Mobile">
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = pathname === item.to;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="mobileNavIndicator"
                className="absolute top-0 h-0.5 w-12 bg-primary rounded-full glow-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="h-5 w-5 mb-0.5" />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}