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

    let patch = `--- a/${filename}\n`
    patch += `+++ b/after\n`

    const context = 3
    const processedRanges: Array<{ start: number; end: number }> = []

    for (const change of lineChanges) {
      const originalStart = change.originalStartLineNumber
      const originalEnd = change.originalEndLineNumber
      const modifiedStart = change.modifiedStartLineNumber
      const modifiedEnd = change.modifiedEndLineNumber

      // Calculate hunk boundaries with context
      const hunkOriginalStart = Math.max(1, originalStart - context)
      const hunkOriginalEnd = Math.min(originalLines.length, originalEnd + context)
      const hunkModifiedStart = Math.max(1, modifiedStart - context)
      // @ts-expect-error: TS6133 'declared but never read' - required for specific logic flow
      const _hunkModifiedEnd = Math.min(modifiedLines.length, modifiedEnd + context)

      // Check for overlap with previously processed ranges
      const overlaps = processedRanges.some(
        (range) => hunkOriginalStart <= range.end && hunkOriginalEnd >= range.start
      )
      if (overlaps) continue

      processedRanges.push({ start: hunkOriginalStart, end: hunkOriginalEnd })

      // Calculate actual line counts for the hunk
      let originalCount = 0
      let modifiedCount = 0

      // Count original lines (context + removed)
      for (let i = hunkOriginalStart; i <= hunkOriginalEnd; i++) {
        if (i - 1 < originalLines.length) {
          originalCount++
        }
      }

      // Count modified lines (context + added)
      const modifiedStartLine = Math.max(1, modifiedStart - context)
      const modifiedEndLine = Math.min(modifiedLines.length, modifiedEnd + context)
      for (let i = modifiedStartLine; i <= modifiedEndLine; i++) {
        if (i - 1 < modifiedLines.length) {
          modifiedCount++
        }
      }

      patch += `@@ -${hunkOriginalStart},${originalCount} +${hunkModifiedStart},${modifiedCount} @@\n`

      // Add context before change
      for (let i = hunkOriginalStart; i < originalStart; i++) {
        const lineIndex = i - 1
        if (lineIndex >= 0 && lineIndex < originalLines.length) {
          patch += ` ${originalLines[lineIndex]}\n`
        }
      }

      // Add removed/changed lines
      if (originalEnd > 0) {
        for (let i = originalStart; i <= originalEnd; i++) {
          const lineIndex = i - 1
          if (lineIndex >= 0 && lineIndex < originalLines.length) {
            patch += `-${originalLines[lineIndex]}\n`
          }
        }
      }

      // Add new/modified lines
      if (modifiedEnd > 0) {
        for (let i = modifiedStart; i <= modifiedEnd; i++) {
          const lineIndex = i - 1
          if (lineIndex >= 0 && lineIndex < modifiedLines.length) {
            patch += `+${modifiedLines[lineIndex]}\n`
          }
        }
      }

      // Add context after change
      const contextAfterStart = Math.max(originalEnd + 1, originalStart)
      for (let i = contextAfterStart; i <= hunkOriginalEnd; i++) {
        const lineIndex = i - 1
        if (lineIndex >= 0 && lineIndex < originalLines.length) {
          patch += ` ${originalLines[lineIndex]}\n`
        }
      }
    }

    return patch
  } catch (error) {
    console.error('Error generating unified diff:', error)
    return `[ERROR] Failed to generate unified diff\n${error instanceof Error ? error.message : String(error)}`
  }
}
