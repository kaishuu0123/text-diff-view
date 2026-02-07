import { useState, useEffect, useMemo } from 'react'
import * as monaco from 'monaco-editor'
import hljs from 'highlight.js/lib/core'
import diff from 'highlight.js/lib/languages/diff'
import 'highlight.js/styles/atom-one-dark.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { generateUnifiedDiff } from '@renderer/lib/unifiedDiffGenerator'
import { cn } from '../lib/utils'

hljs.registerLanguage('diff', diff)

interface UnifiedDiffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diffEditor: monaco.editor.IStandaloneDiffEditor | null
  themeName: 'light' | 'dark'
}

export function UnifiedDiffDialog({
  open,
  onOpenChange,
  diffEditor,
  themeName
}: UnifiedDiffDialogProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const [unifiedDiffContent, setUnifiedDiffContent] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (open && diffEditor) {
      try {
        const unifiedDiff = generateUnifiedDiff(diffEditor, 'before')

        const isError = unifiedDiff.startsWith('[ERROR]') || unifiedDiff.startsWith('[INFO]')

        setUnifiedDiffContent(unifiedDiff)
        setHasError(isError)
        console.log('Unified diff generated successfully') // ログメッセージを変更
      } catch (error) {
        console.error('Error in UnifiedDiffDialog:', error)
        const errorMsg = `[ERROR] ${error instanceof Error ? error.message : String(error)}`
        setUnifiedDiffContent(errorMsg)
        setHasError(true)
      }
    }
  }, [open, diffEditor])

  // highlight.jsでdiffをハイライト
  const highlightedHtml = useMemo(() => {
    if (!unifiedDiffContent || hasError) return unifiedDiffContent
    try {
      return hljs.highlight(unifiedDiffContent, { language: 'diff' }).value
    } catch (error) {
      console.error('Highlight error:', error)
      return unifiedDiffContent
    }
  }, [unifiedDiffContent, hasError])

  const handleOpenChange = (isOpen: boolean): void => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setCopied(false)
      setHasError(false)
    }
  }

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(unifiedDiffContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* ダイアログの高さをコンテンツ依存にする */}
      <DialogContent
        className={cn(
          'max-w-[calc(100vw-4rem)] w-full max-h-[90vh] flex flex-col p-6',
          themeName === 'dark' && 'dark'
        )}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-foreground">Unified Diff</DialogTitle>
        </DialogHeader>

        <div className="relative border rounded-md max-h-[70vh] min-h-0 overflow-y-auto">
          {!hasError && (
            <Button
              size="sm"
              onClick={copyToClipboard}
              disabled={!unifiedDiffContent || hasError}
              className="absolute top-3 right-3 z-50"
            >
              {copied ? (
                <>
                  <i className="codicon codicon-check mr-2"></i>
                  Copied!
                </>
              ) : (
                <>
                  <i className="codicon codicon-copy mr-2"></i>
                  Copy
                </>
              )}
            </Button>
          )}

          <pre className="text-xs font-mono">
            <code className="hljs" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
