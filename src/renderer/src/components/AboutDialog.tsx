import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import appIcon from '../../../../resources/icon.png'

type UpdateStatus = 'checking' | 'up-to-date' | 'available' | 'downloaded' | 'error'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  themeName: 'light' | 'dark'
}

const isElectron = !!window.api && !!window.electron

export function AboutDialog({ open, onOpenChange, themeName }: AboutDialogProps): JSX.Element {
  const [version] = useState(() => (isElectron ? window.api.getAppVersion() : ''))
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')
  const [latestVersion, setLatestVersion] = useState('')
  const [isDevError, setIsDevError] = useState(false)

  useEffect(() => {
    if (!open || !isElectron) return

    setUpdateStatus('checking')
    setIsDevError(false)
    window.api.checkForUpdates()

    const onChecking = () => setUpdateStatus('checking')
    const onNotAvailable = () => setUpdateStatus('up-to-date')
    const onAvailable = (_e, info: { version: string }) => {
      setUpdateStatus('available')
      setLatestVersion(info.version)
    }
    const onDownloaded = (_e, info: { version: string }) => {
      setUpdateStatus('downloaded')
      setLatestVersion(info.version)
    }
    const onError = (_e, msg: string) => {
      setIsDevError(msg === 'dev')
      setUpdateStatus('error')
    }

    window.electron.ipcRenderer.on('update-checking', onChecking)
    window.electron.ipcRenderer.on('update-not-available', onNotAvailable)
    window.electron.ipcRenderer.on('update-available', onAvailable)
    window.electron.ipcRenderer.on('update-downloaded', onDownloaded)
    window.electron.ipcRenderer.on('update-error', onError)

    return () => {
      window.electron.ipcRenderer.removeListener('update-checking', onChecking)
      window.electron.ipcRenderer.removeListener('update-not-available', onNotAvailable)
      window.electron.ipcRenderer.removeListener('update-available', onAvailable)
      window.electron.ipcRenderer.removeListener('update-downloaded', onDownloaded)
      window.electron.ipcRenderer.removeListener('update-error', onError)
    }
  }, [open])

  const renderUpdateStatus = () => {
    switch (updateStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
        return <p className="text-sm text-green-600">✓ Up to date</p>
      case 'available':
        return (
          <p className="text-sm text-blue-500">↑ v{latestVersion} available (downloading...)</p>
        )
      case 'downloaded':
        return (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600">✓ v{latestVersion} ready to install</p>
            <Button size="sm" onClick={() => window.api.installUpdate()}>
              Restart and update
            </Button>
          </div>
        )
      case 'error':
        return (
          <p className="text-sm text-muted-foreground">
            {isDevError ? '— Not available in development' : '✗ Failed to check for updates'}
          </p>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-sm bg-background text-foreground', themeName === 'dark' && 'dark')}
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
