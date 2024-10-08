import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import { DiffEditor, loader, MonacoDiffEditor } from '@monaco-editor/react'

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
    renderWhitespace: 'all'
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
    document.documentElement.style.setProperty('--text-color', themeColor.textColor)
    document.documentElement.style.setProperty('--background-color', themeColor.backgroundColor)
    setSelectedTheme(themeColor)
    window.api.SetThemeName(themeName)
  }

  const handleChangeTheme = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const themeName = event.target.value
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
    <div id="app" className="bg-white">
      <div className="navbar">
        <div className="title">
          <h1>Text Diff View</h1>
          <div className="theme">
            <label htmlFor="theme">Theme</label>
            <select name="theme" onChange={handleChangeTheme} value={selectedTheme.name}>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </div>
        </div>

        <div className="toolbar">
          <div className="goto">
            <button
              type="button"
              className="btn"
              onClick={() => {
                currentEditor?.current?.goToDiff('previous')
              }}
            >
              <i className="codicon codicon-arrow-up"></i>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                currentEditor?.current?.goToDiff('next')
              }}
            >
              <i className="codicon codicon-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>

      <DiffEditor
        className="border-1"
        language="text"
        theme={selectedTheme.monacoThemeName}
        options={options}
        onMount={onEditorDidMount}
      />

      <div id="footer">
        Powered by Monaco Editor.
        <a href="https://github.com/kaishuu0123/text-diff-view">
          <i className="codicon  codicon-github" /> kaishuu0123/text-diff-view
        </a>
      </div>
    </div>
  )
}

export default App
