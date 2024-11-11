import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import { DiffEditor, loader, MonacoDiffEditor } from '@monaco-editor/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select'
import { Button } from './components/ui/button'
import { Separator } from './components/ui/separator'
import { cn } from './lib/utils'

type ThemeNameType = 'light' | 'dark'

type ThemeColorSetType = {
  name: ThemeNameType
  textColor: string
  backgroundColor: string
  monacoThemeName: 'vs' | 'vs-dark'
}

loader.config({ monaco })

const getThemeColorByThemeName = (themeName: ThemeNameType): ThemeColorSetType => {
  switch (themeName) {
    case 'light':
      return {
        name: 'light',
        textColor: '#000000',
        backgroundColor: '#f9fafa',
        monacoThemeName: 'vs'
      }
    case 'dark':
      return {
        name: 'dark',
        textColor: '#d4d4d4',
        backgroundColor: '#1f1f1f',
        monacoThemeName: 'vs-dark'
      }
  }
}

function App(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_leftValue, setLeftValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_rightValue, setRightValue] = useState('')
  const currentEditor = useRef<MonacoDiffEditor | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<ThemeColorSetType>(
    getThemeColorByThemeName('light')
  )

  const options: monaco.editor.IDiffEditorOptions = {
    fontSize: 14,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalEditor.onDidChangeModelContent((_event) => {
      leftEditorChange(originalEditor)
    })

    const modifiedEditor = editor.getModifiedEditor()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    modifiedEditor.onDidChangeModelContent((_event) => {
      rightEditorChange(modifiedEditor)
    })
  }

  const setTheme = (themeName: ThemeNameType): void => {
    const themeColor = getThemeColorByThemeName(themeName)
    setSelectedTheme(themeColor)
    window.api.SetThemeName(themeName)
  }

  const handleChangeTheme = (value: string): void => {
    const themeName = value
    if (themeName !== 'light' && themeName !== 'dark') {
      return
    }
    setTheme(themeName)
  }

  useEffect(() => {
    ;(async (): Promise<void> => {
      const themeName = await window.api.GetThemeName()
      if (themeName != null && (themeName == 'light' || themeName == 'dark')) {
        await setTheme(themeName)
      }
    })()
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

          <div className="flex space-x-2">
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

        <div id="footer" className="flex items-center justify-end space-x-3">
          <div>
            <span className="text-xs text-muted-foreground">Text Diff View</span>
          </div>
          <Separator orientation="vertical" />
          <div>
            <a
              href="https://github.com/kaishuu0123/text-diff-view"
              className="text-xs text-muted-foreground align-middle"
            >
              <span className="codicon codicon-github"></span> kaishuu0123/text-diff-view
            </a>
          </div>
          <Separator orientation="vertical" />
          <div>
            <span className="text-xs text-muted-foreground">Powered by Monaco Editor.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
