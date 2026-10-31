import { useEffect, useState } from 'react'
import appIcon from '../../../../resources/icon.png'
import type { UpdateState } from '../../../shared/updateState'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  themeName: 'light' | 'dark'
  updateState: UpdateState
}

const isElectron = !!window.api && !!window.electron

export function AboutDialog({
  open,
  onOpenChange,
  themeName,
  updateState
}: AboutDialogProps): React.JSX.Element {
  const [version] = useState(() => (isElectron ? window.api.getAppVersion() : ''))
  const [copied, setCopied] = useState(false)

  // 開くたびに確認する(確認中・DL中・DL済みなら main 側で何もしない)
  useEffect(() => {
    if (open && isElectron) window.api.checkForUpdates()
  }, [open])

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(updateState.error ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const checkAgainButton = (
    <button
      type="button"
      onClick={() => window.api.checkForUpdates()}
      title="Check for updates"
      className="cursor-pointer text-muted-foreground hover:text-foreground"
    >
      <span aria-hidden="true" className="codicon codicon-refresh" />
    </button>
  )

  const renderUpdateStatus = () => {
    switch (updateState.status) {
      case 'idle':
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Checking for updates...</span>
          </div>
        )
      case 'up-to-date':
        return (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600">✓ Up to date</p>
            {checkAgainButton}
          </div>
        )
      case 'available':
        return (
          <p className="text-sm text-blue-500">
            ↑ v{updateState.version} available (downloading...)
          </p>
        )
      case 'downloaded':
        return (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600">✓ v{updateState.version} ready to install</p>
            <Button size="sm" onClick={() => window.api.installUpdate()}>
              Restart and update
            </Button>
          </div>
        )
      case 'error':
        if (updateState.error === 'dev') {
          return <p className="text-sm text-muted-foreground">— Not available in development</p>
        }
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyError}
              title={`${updateState.error}\n\nClick to copy error details`}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>✗ Failed to check for updates</span>
              <span
                aria-hidden="true"
                className={`codicon ${copied ? 'codicon-check text-green-600' : 'codicon-copy'}`}
              />
              {copied && <span className="text-green-600">Copied</span>}
            </button>
            {checkAgainButton}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-sm sm:max-w-sm bg-background text-foreground', themeName === 'dark' && 'dark')}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <img src={appIcon} className="w-20 h-20 rounded-2xl" alt="Text Diff View" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Text Diff View</h2>
            <p className="text-sm text-muted-foreground mt-1">Version {version}</p>
          </div>
          <div>{renderUpdateStatus()}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
