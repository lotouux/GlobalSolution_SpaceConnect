import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";

// ============================================================================
// COMPONENTES DE FEEDBACK VISUAL
// ============================================================================

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary text-glow">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground tracking-widest uppercase">Rota Inacessível</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A órbita solicitada não existe ou o nó foi desativado.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary/10 border border-primary/40 px-6 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 glow-primary"
          >
            Retornar ao Painel Principal
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Orion Error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center p-6 rounded-xl border border-destructive/30 bg-surface/50 backdrop-blur-md">
        <h1 className="text-xl font-semibold tracking-tight text-destructive">
          Falha Crítica de Telemetria
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro interno na interface. Nossos engenheiros foram notificados.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-destructive/15 border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/25"
          >
            Tentar Novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIGURAÇÃO DO ROOT ROUTER
// ============================================================================

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  // Consome o QueryClient injetado via contexto no main.tsx
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}