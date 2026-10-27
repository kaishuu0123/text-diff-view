import { DiffEditor, loader, type MonacoDiffEditor } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
import { useEffect, useRef, useState } from 'react'
import { AboutDialog } from './components/AboutDialog'
import { UnifiedDiffDialog } from './components/UnifiedDiffDialog'
import { UpdateBanner } from './components/UpdateBanner'
import { Button } from './components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select'
import { Separator } from './components/ui/separator'
import { useUpdateState } from './hooks/useUpdateState'
import { cn } from './lib/utils'

type ThemeNameType = 'light' | 'dark'

type ThemeColorSetType = {
  name: ThemeNameType
  monacoThemeName: 'vs' | 'vs-dark'
}

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker()
}

loader.config({ monaco })

const getThemeColorByThemeName = (themeName: ThemeNameType): ThemeColorSetType => {
  switch (themeName) {
    case 'light':
      return {
        name: 'light',
        monacoThemeName: 'vs'
      }
    case 'dark':
      return {
        name: 'dark',
        monacoThemeName: 'vs-dark'
      }
  }
}

function App(): JSX.Element {
  const [_leftValue, setLeftValue] = useState('')
  const [_rightValue, setRightValue] = useState('')
  const currentEditor = useRef<MonacoDiffEditor | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<ThemeColorSetType>(
    getThemeColorByThemeName('light')
  )
  const [unifiedDiffDialogOpen, setUnifiedDiffDialogOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const updateState = useUpdateState()

  const options: monaco.editor.IDiffEditorOptions = {
    fontSize: 14,
    fontLigatures: false,
    renderSideBySide: true,
    originalEditable: true,
    automaticLayout: true,
    ignoreTrimWhitespace: false,
    quickSuggestions: false,
    renderWhitespace: 'all',
    renderSideBySideInlineBreakpoint: 300
  }

  const leftEditorChange = (editor: monaco.editor.ICodeEditor): void => {
    const value = editor.getValue()
    setLeftValue(value)
  }

  const rightEditorChange = (editor: monaco.editor.ICodeEditor): void => {
    const value = editor.getValue()
    setRightValue(value)
  }

  const onEditorDidMount = (editor: monaco.editor.IStandaloneDiffEditor): void => {
    currentEditor.current = editor

    const originalEditor = editor.getOriginalEditor()
    originalEditor.onDidChangeModelContent((_event) => {
      leftEditorChange(originalEditor)
    })

    const modifiedEditor = editor.getModifiedEditor()
    modifiedEditor.onDidChangeModelContent((_event) => {
      rightEditorChange(modifiedEditor)
    })
  }

  const setTheme = (themeName: ThemeNameType): void => {
    const themeColor = getThemeColorByThemeName(themeName)
    setSelectedTheme(themeColor)
    window.api?.SetThemeName(themeName)
  }

  const handleChangeTheme = (value: string): void => {
    const themeName = value
    if (themeName !== 'light' && themeName !== 'dark') {
      return
    }
    setTheme(themeName)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: setTheme is recreated every render; deps intentionally left empty so this runs only once on mount (not changed to preserve existing behavior)
  useEffect(() => {
    if (!window.api) return
    ;(async (): Promise<void> => {
      const themeName = await window.api.GetThemeName()
      if (themeName != null && (themeName === 'light' || themeName === 'dark')) {
        await setTheme(themeName)
      }
    })()
  }, [])

  // Application menu (macOS) -> About / Check for Updates
  useEffect(() => {
    if (!window.electron) return
    const removeAbout = window.electron.ipcRenderer.on('menu-about', () => setAboutOpen(true))
    const removeCheckForUpdates = window.electron.ipcRenderer.on('menu-check-for-updates', () =>
      setAboutOpen(true)
    )
    return () => {
      removeAbout()
      removeCheckForUpdates()
    }
  }, [])

  return (
    <div
      id="app"
      className={cn('bg-background text-foreground', selectedTheme.name === 'dark' && 'dark')}
    >
      <div className="flex flex-col h-screen p-2 space-y-2">
        <div className="flex items-center justify-center">
          <div className="theme grow flex items-center space-x-2">
            <label htmlFor="theme">Theme</label>
            <Select name="theme" onValueChange={handleChangeTheme} value={selectedTheme.name}>
              <SelectTrigger className="max-w-32 h-8">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 items-center">
            <Button className="h-8 rounded-sm" onClick={() => setUnifiedDiffDialogOpen(true)}>
              <span className="flex items-center space-x-2">
                <i className="codicon codicon-file-code"></i>
                <span>Show Unified Diff</span>
              </span>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              size="icon"
              className="w-8 h-8 rounded-sm"
              onClick={() => {
                currentEditor?.current?.goToDiff('previous')
              }}
            >
              <i className="codicon codicon-arrow-up"></i>
            </Button>
            <Button
              size="icon"
              className="w-8 h-8 rounded-sm"
              onClick={() => {
                currentEditor?.current?.goToDiff('next')
              }}
            >
              <i className="codicon codicon-arrow-down"></i>
            </Button>
          </div>
        </div>

        <div className="grow border">
          <DiffEditor
            className="border-1"
            language="text"
            theme={selectedTheme.monacoThemeName}
            options={options}
            onMount={onEditorDidMount}
          />
        </div>

        <div id="footer" className="flex justify-end space-x-3 items-center">
          <div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => setAboutOpen(true)}
            >
              Text Diff View
            </button>
          </div>
          <Separator orientation="vertical" className="h-full" />
          <div>
            <span className="text-xs text-muted-foreground">Powered by Monaco Editor.</span>
          </div>
        </div>
      </div>

      <UnifiedDiffDialog
        open={unifiedDiffDialogOpen}
        onOpenChange={setUnifiedDiffDialogOpen}
        diffEditor={currentEditor.current}
        themeName={selectedTheme.name}
      />

      <AboutDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        themeName={selectedTheme.name}
        updateState={updateState}
      />

      <UpdateBanner state={updateState} />
    </div>
  )
}

export default App
