import { useState } from 'react'
import { useWorkspaceList, useWorkspaceFile } from '@/hooks/use-workspace'
import type { WorkspaceEntry } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Folder,
  File,
  FileText,
  FileCode,
  FileJson,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 根據檔案類型選擇圖示
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json':
      return FileJson
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'py':
    case 'sh':
    case 'yml':
    case 'yaml':
      return FileCode
    case 'md':
    case 'txt':
    case 'log':
      return FileText
    default:
      return File
  }
}

// 格式化檔案大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function WorkspaceView() {
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const { data: listData, isLoading: isListLoading } = useWorkspaceList(currentPath)
  const { data: fileData, isLoading: isFileLoading } = useWorkspaceFile(selectedFile || '')

  // 麵包屑導航
  const pathParts = currentPath.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'workspace', path: '' },
    ...pathParts.map((part, i) => ({
      name: part,
      path: pathParts.slice(0, i + 1).join('/'),
    })),
  ]

  const handleEntryClick = (entry: WorkspaceEntry) => {
    if (entry.isDirectory) {
      setCurrentPath(entry.path)
      setSelectedFile(null)
    } else {
      setSelectedFile(entry.path)
    }
  }

  const handleBack = () => {
    if (selectedFile) {
      setSelectedFile(null)
    } else if (currentPath) {
      const parts = currentPath.split('/')
      parts.pop()
      setCurrentPath(parts.join('/'))
    }
  }

  // 檔案內容檢視
  if (selectedFile && fileData) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 sm:p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {(() => {
              const Icon = getFileIcon(selectedFile)
              return <Icon className="h-4 w-4 shrink-0" />
            })()}
            <span className="text-sm font-medium truncate">{selectedFile}</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatSize(fileData.size)}
          </span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {isFileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto">
                {fileData.content}
              </pre>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // 目錄列表檢視
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Navigation */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.path} className="flex items-center shrink-0">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              <Button
                variant={i === breadcrumbs.length - 1 ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCurrentPath(crumb.path)
                  setSelectedFile(null)
                }}
                className="text-xs"
              >
                {i === 0 ? <Home className="h-3 w-3 mr-1" /> : null}
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {isListLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : listData?.items && listData.items.length > 0 ? (
            <div className="space-y-1">
              {listData.items.map((entry) => {
                const Icon = entry.isDirectory ? Folder : getFileIcon(entry.name)
                return (
                  <Card
                    key={entry.path}
                    className={cn(
                      'hover:bg-muted/50 transition-colors cursor-pointer',
                      entry.isDirectory && 'border-primary/20'
                    )}
                    onClick={() => handleEntryClick(entry)}
                  >
                    <CardContent className="py-2 px-3 flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          entry.isDirectory ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="flex-1 text-sm truncate">{entry.name}</span>
                      {!entry.isDirectory && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatSize(entry.size)}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Empty directory</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
