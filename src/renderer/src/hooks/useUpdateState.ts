import { useEffect, useState } from 'react'
import type { UpdateState } from '../../../shared/updateState'

// main プロセスが保持する更新状態を取得し、変更を購読する
export function useUpdateState(): UpdateState {
  const [state, setState] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    if (!window.electron) return

    // 取得完了前にイベントが届いていたら、そちらが新しいので上書きしない
    let received = false
    const remove = window.electron.ipcRenderer.on('update-state', (_event, next: UpdateState) => {
      received = true
      setState(next)
    })
    window.api.getUpdateState().then((current) => {
      if (!received) setState(current)
    })

    return remove
  }, [])

  return state
}
