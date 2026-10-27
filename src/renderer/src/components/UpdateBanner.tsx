import { useState } from 'react'
import type { UpdateState } from '../../../shared/updateState'
import { Button } from './ui/button'

interface UpdateBannerProps {
  state: UpdateState
}

export function UpdateBanner({ state }: UpdateBannerProps): JSX.Element | null {
  const [dismissedVersion, setDismissedVersion] = useState<string | undefined>()

  if (state.status !== 'downloaded' || state.version === dismissedVersion) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border text-foreground p-3 rounded-lg shadow-md flex gap-3 items-center">
      <span className="text-sm">Update v{state.version} is ready to install</span>
      <Button size="sm" variant="default" onClick={() => window.api.installUpdate()}>
        Restart and update
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDismissedVersion(state.version)}>
        Later
      </Button>
    </div>
  )
}
