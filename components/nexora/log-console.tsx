"use client"

import React, { useRef, useEffect, useState } from "react"
import { Terminal, Trash2, Download, Pause, Play, Filter } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LogEntry {
  id: string
  time: string
  type: "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS"
  message: string
  source?: string
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LogConsoleProps {
  logs: LogEntry[]
  onClearLogs: () => void
}

function getLogTypeStyles(type: LogEntry["type"]) {
  switch (type) {
    case "INFO":
      return "text-blue-400"
    case "WARN":
      return "text-yellow-400"
    case "ERROR":
      return "text-red-400"
    case "DEBUG":
      return "text-purple-400"
    case "SUCCESS":
      return "text-green-400"
    default:
      return "text-muted-foreground"
  }
}

function getLogTypeBadge(type: LogEntry["type"]) {
  switch (type) {
    case "INFO":
      return <Badge variant="outline" className="text-[9px] h-4 px-1 border-blue-500/50 text-blue-400">INFO</Badge>
    case "WARN":
      return <Badge variant="outline" className="text-[9px] h-4 px-1 border-yellow-500/50 text-yellow-400">WARN</Badge>
    case "ERROR":
      return <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-500/50 text-red-400">ERROR</Badge>
    case "DEBUG":
      return <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-500/50 text-purple-400">DEBUG</Badge>
    case "SUCCESS":
      return <Badge variant="outline" className="text-[9px] h-4 px-1 border-green-500/50 text-green-400">SUCCESS</Badge>
    default:
      return <Badge variant="outline" className="text-[9px] h-4 px-1">LOG</Badge>
  }
}

export function LogConsole({ logs, onClearLogs }: LogConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [filterTypes, setFilterTypes] = useState<LogEntry["type"][]>(["INFO", "WARN", "ERROR", "DEBUG", "SUCCESS"])

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isPaused])

  const filteredLogs = logs.filter(log => filterTypes.includes(log.type))

  const toggleFilter = (type: LogEntry["type"]) => {
    setFilterTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const downloadLogs = () => {
    const logText = logs.map(l => `[${l.time}] ${l.type}: ${l.message}`).join("\n")
    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nexora-logs-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--nexora-terminal))] border-t border-border">
      {/* Console Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-medium">REMOTE LOGCAT</span>
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
            {filteredLogs.length} logs
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Filter className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {(["INFO", "WARN", "ERROR", "DEBUG", "SUCCESS"] as const).map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filterTypes.includes(type)}
                  onCheckedChange={() => toggleFilter(type)}
                  className="text-xs"
                >
                  <span className={getLogTypeStyles(type)}>{type}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={downloadLogs}
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClearLogs}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Log Entries */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-2 font-mono text-[11px] nexora-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-2 py-0.5 px-1 rounded hover:bg-muted/20 transition-colors",
                log.type === "ERROR" && "bg-red-950/20"
              )}
            >
              <span className="text-muted-foreground/60 flex-shrink-0">[{log.time}]</span>
              {getLogTypeBadge(log.type)}
              {log.source && (
                <span className="text-cyan-400/70 flex-shrink-0">{log.source}:</span>
              )}
              <span className={cn("break-all", getLogTypeStyles(log.type))}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Console Footer */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border text-[10px] text-muted-foreground bg-muted/10">
        <span>Connected to nexora_updates channel</span>
        <div className="flex items-center gap-2">
          {isPaused && <span className="text-yellow-400">PAUSED</span>}
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </div>
  )
}
