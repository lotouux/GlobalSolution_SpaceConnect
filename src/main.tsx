import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import './styles.css'

// 1. Cria a instância do QueryClient
const queryClient = new QueryClient()

// 2. Instancia o roteador passando o queryClient para o contexto
const router = createRouter({ 
  routeTree,
  context: {
    queryClient,
  }
})

// 3. Renderiza a aplicação envolvendo com o Provider do QueryClient
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}