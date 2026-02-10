import * as monaco from 'monaco-editor'

/**
 * Generate a unified diff patch from Monaco Editor's diff computation
 * This provides accurate diff matching Monaco's visual representation
 */
export function generateUnifiedDiff(
  editor: monaco.editor.IStandaloneDiffEditor,
  filename = 'before'
): string {
  try {
    const originalModel = editor.getOriginalEditor().getModel()
    const modifiedModel = editor.getModifiedEditor().getModel()

    if (!originalModel || !modifiedModel) {
      return '[ERROR] No content to compare'
    }

    const originalText = originalModel.getValue()
    const modifiedText = modifiedModel.getValue()

    // Handle empty content
    if (!originalText && !modifiedText) {
      return '[INFO] Both files are empty'
    }

    const originalLines = originalText.split('\n')
    const modifiedLines = modifiedText.split('\n')

    // Get line changes from the diff editor
    const lineChanges = editor.getLineChanges()

    if (!lineChanges || lineChanges.length === 0) {
      return '[INFO] No differences found'
    }

    const context = 3

    // Group overlapping/adjacent changes into hunks (same as linux diff command)
    const hunks: Array<{
      changes: typeof lineChanges
      origStart: number
      origEnd: number
      modStart: number
      modEnd: number
    }> = []

    for (const change of lineChanges) {
      const origStart = Math.max(1, change.originalStartLineNumber - context)
      const origEnd = Math.min(
        originalLines.length,
        (change.originalEndLineNumber > 0
          ? change.originalEndLineNumber
          : change.originalStartLineNumber) + context
      )
      const modStart = Math.max(1, change.modifiedStartLineNumber - context)
      const modEnd = Math.min(
        modifiedLines.length,
        (change.modifiedEndLineNumber > 0
          ? change.modifiedEndLineNumber
          : change.modifiedStartLineNumber) + context
      )

      const lastHunk = hunks[hunks.length - 1]

      if (lastHunk && origStart <= lastHunk.origEnd) {
        // Merge into previous hunk
        lastHunk.changes.push(change)
        lastHunk.origEnd = Math.max(lastHunk.origEnd, origEnd)
        lastHunk.modEnd = Math.max(lastHunk.modEnd, modEnd)
      } else {
        // Start new hunk
        hunks.push({
          changes: [change],
          origStart,
          origEnd,
          modStart,
          modEnd
        })
      }
    }

    let patch = `--- a/${filename}\n`
    patch += `+++ b/after\n`

    for (const hunk of hunks) {
      // Build the hunk content first to count lines accurately
      let hunkContent = ''
      let origCount = 0
      let modCount = 0

      // Walk through the original line range, emitting context/removed/added lines
      let origLine = hunk.origStart
      let modLine = hunk.modStart

      for (const change of hunk.changes) {
        // Context lines before this change
        while (origLine < change.originalStartLineNumber) {
          hunkContent += ` ${originalLines[origLine - 1]}\n`
          origCount++
          modCount++
          origLine++
          modLine++
        }

        // Removed lines (pure deletion or modification)
        if (change.originalEndLineNumber > 0) {
          for (let i = change.originalStartLineNumber; i <= change.originalEndLineNumber; i++) {
            hunkContent += `-${originalLines[i - 1]}\n`
            origCount++
            origLine++
          }
        }

        // Added lines (pure addition or modification)
        if (change.modifiedEndLineNumber > 0) {
          for (let i = change.modifiedStartLineNumber; i <= change.modifiedEndLineNumber; i++) {
            hunkContent += `+${modifiedLines[i - 1]}\n`
            modCount++
            modLine++
          }
        } else {
          // Pure deletion: advance modLine to keep in sync
          modLine = change.modifiedStartLineNumber + 1
        }
      }

      // Context lines after the last change
      while (origLine <= hunk.origEnd) {
        hunkContent += ` ${originalLines[origLine - 1]}\n`
        origCount++
        modCount++
        origLine++
        modLine++
      }

      patch += `@@ -${hunk.origStart},${origCount} +${hunk.modStart},${modCount} @@\n`
      patch += hunkContent
    }

    return patch
  } catch (error) {
    console.error('Error generating unified diff:', error)
    return `[ERROR] Failed to generate unified diff\n${error instanceof Error ? error.message : String(error)}`
  }
}
