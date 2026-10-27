export type UpdateState = {
  status: 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloaded' | 'error'
  version?: string
  // 'dev' は開発環境(未パッケージ)で確認できないことを表す
  error?: string
}
