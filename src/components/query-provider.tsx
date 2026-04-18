'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface QueryProviderProps {
    children: React.ReactNode;
}

export const QueryProviders = ({ children }: QueryProviderProps) => {
  const queryClient = getQueryClient()
 
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}