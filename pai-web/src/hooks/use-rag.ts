import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ragApi } from '@/lib/api'

export function useRagStats() {
  return useQuery({
    queryKey: ['rag', 'stats'],
    queryFn: () => ragApi.stats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useRagQuery() {
  return useMutation({
    mutationFn: ({ question, maxRetries = 2 }: { question: string; maxRetries?: number }) =>
      ragApi.query(question, maxRetries),
  })
}

export function useRagSearch() {
  return useMutation({
    mutationFn: ({ query, topK = 5 }: { query: string; topK?: number }) =>
      ragApi.search(query, topK),
  })
}

export function useRagSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => ragApi.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'stats'] })
    },
  })
}
