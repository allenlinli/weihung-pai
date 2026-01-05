import { useQuery } from '@tanstack/react-query'
import { workspaceApi } from '@/lib/api'

export function useWorkspaceList(path: string = '') {
  return useQuery({
    queryKey: ['workspace', 'list', path],
    queryFn: () => workspaceApi.list(path),
  })
}

export function useWorkspaceFile(path: string) {
  return useQuery({
    queryKey: ['workspace', 'file', path],
    queryFn: () => workspaceApi.read(path),
    enabled: !!path,
  })
}
