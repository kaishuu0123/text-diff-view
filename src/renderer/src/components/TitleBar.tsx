import { useEffect, useState } from 'react'
import appIcon from '../../../../resources/icon.png'
import { cn } from '../lib/utils'

const isMac = navigator.platform.includes('Mac')

export default function TitleBar(): React.JSX.Element | null {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized)
    window.api.onMaximizeChange(setIsMaximized)
  }, [])

  // macOS and browser mode (no Electron) use no custom title bar
  if (isMac || !window.electron) return null

  return (
    <div
      className="flex items-center h-8 bg-background border-b border-border shrink-0 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Hamburger menu button */}
      <button
        type="button"
        className={cn(
          'h-full px-4 flex items-center justify-center',
          'hover:bg-accent text-foreground transition-colors',
          'focus:outline-none'
        )}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={() => window.api.popupMenu()}
        title="Menu"
      >
        <span className="codicon codicon-menu text-sm" />
      </button>

      {/* App icon and title */}
      <img src={appIcon} alt="" className="h-4 w-4 ml-1 mr-2 pointer-events-none" />
      <span className="text-xs text-foreground/80 truncate">
        {document.title || 'Text Diff View'}
      </span>

      {/* Drag area (fills remaining space) */}
      <div className="flex-1" />

      {/* Window controls */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          type="button"
          className="h-full px-4 flex items-center justify-center hover:bg-accent text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.minimizeWindow()}
          title="Minimize"
        >
          <span className="codicon codicon-chrome-minimize text-sm" />
        </button>

        {/* Maximize / Restore */}
        <button
          type="button"
          className="h-full px-4 flex items-center justify-center hover:bg-accent text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.maximizeWindow()}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <span
            className={cn(
              'codicon text-sm',
              isMaximized ? 'codicon-chrome-restore' : 'codicon-chrome-maximize'
            )}
          />
        </button>

        {/* Close */}
        <button
          type="button"
          className="h-full px-4 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.closeWindow()}
          title="Close"
        >
          <span className="codicon codicon-chrome-close text-sm" />
        </button>
      </div>
    </div>
  )
}
