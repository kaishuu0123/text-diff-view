import { useState } from 'react'
import { monaco, MonacoDiffEditor } from 'react-monaco-editor'

type ThemeColor = {
  textColor: string
  backgroundColor: string
  monacoThemeName: 'vs' | 'vs-dark'
}

const getThemeColorByThemeName = (themeName: 'light' | 'dark'): ThemeColor => {
  switch (themeName) {
    case 'light':
      return {
        textColor: '#000000',
        backgroundColor: '#f9fafa',
        monacoThemeName: 'vs'
      }
    case 'dark':
      return {
        textColor: '#d4d4d4',
        backgroundColor: '#1f1f1f',
        monacoThemeName: 'vs-dark'
      }
  }
}

function App(): JSX.Element {
  const [leftValue, setLeftValue] = useState('')
  const [rightValue, setRightValue] = useState('')
  const [currentEditor, setCurrentEditor] = useState<monaco.editor.IDiffEditor | null>(null)
  const [monacoThemeName, setMonacoThemeName] = useState<'vs' | 'vs-dark'>('vs')

  const options: monaco.editor.IDiffEditorOptions = {
    fontSize: 14,
    renderSideBySide: true,
    originalEditable: true,
    automaticLayout: true
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
    setCurrentEditor(editor)

    const originalEditor = editor.getOriginalEditor()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalEditor.onDidChangeModelContent((_event) => {
      leftEditorChange(originalEditor)
    })
    originalEditor.updateOptions({ ...options, ...{ placeholder: 'HELLO' } })

    const modifiedEditor = editor.getModifiedEditor()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    modifiedEditor.onDidChangeModelContent((_event) => {
      rightEditorChange(modifiedEditor)
    })
  }

  const handleChangeTheme = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const themeName = event.target.value
    if (themeName !== 'light' && themeName !== 'dark') {
      return
    }

    const themeColor = getThemeColorByThemeName(themeName)
    document.documentElement.style.setProperty('--text-color', themeColor.textColor)
    document.documentElement.style.setProperty('--background-color', themeColor.backgroundColor)

    setMonacoThemeName(themeColor.monacoThemeName)
  }

  return (
    <div id="app" className="bg-white">
      <div className="navbar">
        <div className="title">
          <h1>Text Diff View</h1>
          <div className="theme">
            <label htmlFor="theme">Theme</label>
            <select name="theme" onChange={handleChangeTheme}>
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
                currentEditor?.goToDiff('previous')
                currentEditor?.layout()
              }}
            >
              <i className="codicon codicon-arrow-up"></i>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                currentEditor?.goToDiff('next')
              }}
            >
              <i className="codicon codicon-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>

      <MonacoDiffEditor
        className="border-1"
        language="text"
        theme={monacoThemeName}
        original={leftValue}
        value={rightValue}
        options={options}
        editorDidMount={onEditorDidMount}
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
