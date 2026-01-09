import { useState } from 'react'
import { useRagStats, useRagQuery, useRagSearch, useRagSync } from '@/hooks/use-rag'
import type { RagDocument, RagQueryResult } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Search, RefreshCw, FileText, Bot, Loader2, Sparkles } from 'lucide-react'

export function RagView() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'agent' | 'search'>('agent')
  const [result, setResult] = useState<RagQueryResult | null>(null)
  const [searchResults, setSearchResults] = useState<RagDocument[]>([])

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useRagStats()
  const ragQuery = useRagQuery()
  const ragSearch = useRagSearch()
  const ragSync = useRagSync()

  const isQuerying = ragQuery.isPending || ragSearch.isPending
  const isSyncing = ragSync.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isQuerying) return

    if (mode === 'agent') {
      const res = await ragQuery.mutateAsync({ question: query })
      setResult(res)
      setSearchResults([])
    } else {
      const res = await ragSearch.mutateAsync({ query })
      setSearchResults(res.results)
      setResult(null)
    }
  }

  const handleSync = async () => {
    await ragSync.mutateAsync()
    refetchStats()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats Header */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-medium">Vector DB</span>
            </div>
            {isStatsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : stats ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.total_files} files</Badge>
                <Badge variant="secondary">{stats.total_chunks} chunks</Badge>
                <Badge variant="outline" className="text-xs">{stats.embedding}</Badge>
              </div>
            ) : (
              <Badge variant="destructive">Not connected</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>
        </div>

        {ragSync.isSuccess && ragSync.data && (
          <div className="mt-2 text-sm text-muted-foreground">
            Last sync: +{ragSync.data.added} added, ~{ragSync.data.updated} updated, -{ragSync.data.deleted} deleted
          </div>
        )}
      </div>

      {/* Query Section */}
      <div className="p-3 sm:p-4 border-b space-y-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'agent' | 'search')}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="h-4 w-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={mode === 'agent' ? 'Ask a question...' : 'Search documents...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isQuerying || !query.trim()}>
            {isQuerying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-4">
          {/* Agent Query Result */}
          {result && (
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Answer
                  </CardTitle>
                  {result.retry_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {result.retry_count} retries
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
                {result.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <CardDescription className="text-xs mb-2">References</CardDescription>
                    <div className="space-y-1">
                      {result.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">{doc.file_path}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {(1 - doc.distance).toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((doc, i) => (
                <Card key={i} className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{doc.file_path}</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {(1 - doc.distance).toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  {doc.chunk && (
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground line-clamp-4">{doc.chunk}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!result && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">
                {mode === 'agent'
                  ? 'Ask a question to query your knowledge base'
                  : 'Search for documents in your vault'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
