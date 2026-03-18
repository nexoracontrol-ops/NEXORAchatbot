"use client"

import React, { useRef, useEffect, useState } from "react"
import { Save, X, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileNode } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface CodeEditorProps {
  file: FileNode | null
  openFiles: FileNode[]
  activeFileId: string | null
  onFileChange: (content: string) => void
  onTabSelect: (fileId: string) => void
  onTabClose: (fileId: string) => void
  onSave: () => void
  isSaving: boolean
}

function getLanguageLabel(language?: string) {
  const labels: Record<string, string> = {
    kotlin: "Kotlin",
    typescript: "TypeScript",
    javascript: "JavaScript",
    json: "JSON",
    python: "Python",
  }
  return labels[language || ""] || "Plain Text"
}

function getSyntaxClass(language?: string): string {
  switch (language) {
    case "kotlin":
    case "java":
      return "text-orange-300"
    case "typescript":
    case "javascript":
      return "text-blue-300"
    case "json":
      return "text-yellow-300"
    default:
      return "text-foreground"
  }
}

export function CodeEditor({
  file,
  openFiles,
  activeFileId,
  onFileChange,
  onTabSelect,
  onTabClose,
  onSave,
  isSaving
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  const content = file?.content || "// Select a file to edit"
  const lines = content.split("\n")

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [content])

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleCursorChange = () => {
    if (textareaRef.current) {
      const text = textareaRef.current.value
      const cursorPos = textareaRef.current.selectionStart
      const textBeforeCursor = text.substring(0, cursorPos)
      const linesBeforeCursor = textBeforeCursor.split("\n")
      const line = linesBeforeCursor.length
      const column = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1
      setCursorPosition({ line, column })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSave()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + "  " + content.substring(end)
        onFileChange(newContent)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center overflow-x-auto">
          {openFiles.length > 0 ? (
            openFiles.map(f => (
              <div
                key={f.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer",
                  "hover:bg-accent/50 transition-colors",
                  activeFileId === f.id && "bg-card border-b-2 border-b-primary"
                )}
                onClick={() => onTabSelect(f.id)}
              >
                <span className={cn(
                  "truncate max-w-[120px]",
                  activeFileId === f.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {f.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(f.id)
                  }}
                  className="hover:bg-destructive/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">No files open</div>
          )}
        </div>
        
        <div className="flex items-center gap-2 px-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            disabled={!file || isSaving}
            className="h-7 text-xs"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1" />
            )}
            Sync to Redis
          </Button>
        </div>
      </div>

      {/* File Path Bar */}
      {file && (
        <div className="flex items-center justify-between px-4 py-1.5 text-xs border-b border-border bg-muted/20">
          <span className="text-muted-foreground font-mono">{file.path}</span>
          <span className="text-muted-foreground">{getLanguageLabel(file.language)}</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-muted/30 text-muted-foreground text-right py-4 pr-3 font-mono text-xs select-none overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i} className={cn(
              "leading-6",
              cursorPosition.line === i + 1 && "text-primary font-medium"
            )}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          className={cn(
            "flex-1 bg-transparent p-4 font-mono text-sm leading-6 outline-none resize-none",
            "nexora-scrollbar",
            getSyntaxClass(file?.language)
          )}
          value={content}
          onChange={(e) => onFileChange(e.target.value)}
          onScroll={handleScroll}
          onKeyUp={handleCursorChange}
          onClick={handleCursorChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          disabled={!file}
          placeholder="Select a file from the tree to start editing..."
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs border-t border-border bg-muted/30 text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Hot-Reload Ready
          </span>
        </div>
      </div>
    </div>
  )
}
