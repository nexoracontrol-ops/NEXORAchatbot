"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Moon, Sun, Settings, Bell, Github } from "lucide-react"
import { useTheme } from "next-themes"
import { TreeView, type FileNode } from "@/components/nexora/tree-view"
import { CodeEditor } from "@/components/nexora/code-editor"
import { LogConsole, type LogEntry } from "@/components/nexora/log-console"
import { InspectorPanel } from "@/components/nexora/inspector-panel"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const defaultFileTree: FileNode[] = [
  {
    id: "1",
    name: "nexora",
    type: "folder",
    path: "/nexora",
    children: [
      {
        id: "2",
        name: "agents",
        type: "folder",
        path: "/nexora/agents",
        children: [
          {
            id: "3",
            name: "MainAgent.kt",
            type: "file",
            path: "/nexora/agents/MainAgent.kt",
            language: "kotlin",
            content: `// NEXORA Main Agent
class MainAgent : Agent() {
    private val runtime = AgentRuntime()
    
    override fun onCreate() {
        super.onCreate()
        runtime.initialize()
        log("MainAgent initialized")
    }
    
    fun processCommand(cmd: String): Result {
        return when(cmd) {
            "status" -> getSystemStatus()
            "sync" -> syncWithCloud()
            else -> Result.Unknown
        }
    }
    
    private fun getSystemStatus(): Result {
        return Result.Success(
            mapOf(
                "cpu" to getCpuUsage(),
                "memory" to getMemoryUsage(),
                "agents" to getActiveAgents()
            )
        )
    }
}`
          },
          {
            id: "4",
            name: "SyncAgent.kt",
            type: "file",
            path: "/nexora/agents/SyncAgent.kt",
            language: "kotlin",
            content: `// NEXORA Sync Agent - Hot Reload Handler
class SyncAgent : Service() {
    private val redis = RedisClient.create()
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        subscribeToUpdates()
        return START_STICKY
    }
    
    private fun subscribeToUpdates() {
        redis.connectPubSub().apply {
            addListener(SyncListener())
            async().subscribe("nexora_updates")
        }
    }
    
    inner class SyncListener : RedisPubSubListener<String, String> {
        override fun message(channel: String?, message: String?) {
            message?.let { fileName ->
                val content = redis.connect().sync().get("agent:$fileName")
                saveToSandbox(fileName, content)
                notifyHotReload(fileName)
            }
        }
    }
}`
          }
        ]
      },
      {
        id: "5",
        name: "config",
        type: "folder",
        path: "/nexora/config",
        children: [
          {
            id: "6",
            name: "settings.json",
            type: "file",
            path: "/nexora/config/settings.json",
            language: "json",
            content: `{
  "nexora": {
    "version": "1.0.0",
    "environment": "development",
    "features": {
      "hotReload": true,
      "autoSync": true,
      "debugMode": true
    },
    "redis": {
      "host": "localhost",
      "port": 6379,
      "channel": "nexora_updates"
    },
    "ai": {
      "provider": "claude",
      "model": "claude-opus-4.6",
      "maxTokens": 4096
    }
  }
}`
          }
        ]
      },
      {
        id: "7",
        name: "ui",
        type: "folder",
        path: "/nexora/ui",
        children: [
          {
            id: "8",
            name: "Dashboard.tsx",
            type: "file",
            path: "/nexora/ui/Dashboard.tsx",
            language: "typescript",
            content: `// NEXORA Dashboard Component
import React from 'react';
import { TreeView } from './TreeView';
import { CodeEditor } from './CodeEditor';
import { LogConsole } from './LogConsole';

export function Dashboard() {
  return (
    <div className="flex h-screen">
      <TreeView />
      <CodeEditor />
      <LogConsole />
    </div>
  );
}`
          }
        ]
      }
    ]
  }
]

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

export default function NexoraDashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // File system state
  const [files] = useState<FileNode[]>(defaultFileTree)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [openFiles, setOpenFiles] = useState<FileNode[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Editor state
  const [isSaving, setIsSaving] = useState(false)
  
  // Log state
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: generateId(), time: "10:30:00", type: "INFO", message: "NEXORA Dashboard initialized", source: "System" },
    { id: generateId(), time: "10:30:01", type: "SUCCESS", message: "Connected to Redis pub/sub channel", source: "Redis" },
    { id: generateId(), time: "10:30:02", type: "INFO", message: "Hot-reload listener active", source: "Sync" },
  ])
  
  // System stats
  const [stats] = useState({
    cpu: 23,
    memory: 45,
    agents: 3,
    connected: true,
    lastSync: "2 min ago"
  })
  
  const componentTree = [
    "AppRoot",
    "AgentRuntime",
    "MainAgent",
    "SyncAgent",
    "UIBridge"
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate real-time logs
  useEffect(() => {
    const messages = [
      { type: "DEBUG" as const, message: "Checking file system integrity...", source: "FileWatcher" },
      { type: "INFO" as const, message: "Agent heartbeat received", source: "MainAgent" },
      { type: "DEBUG" as const, message: "Cache hit for settings.json", source: "Redis" },
      { type: "INFO" as const, message: "UI state synchronized", source: "UIBridge" },
      { type: "SUCCESS" as const, message: "Code changes detected and compiled", source: "HotReload" },
    ]
    
    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)]
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      
      setLogs(prev => [...prev.slice(-49), {
        id: generateId(),
        time,
        ...randomMsg
      }])
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSelectFile = useCallback((file: FileNode) => {
    if (file.type === "folder") return
    
    setSelectedFile(file)
    setActiveFileId(file.id)
    
    setOpenFiles(prev => {
      if (prev.find(f => f.id === file.id)) return prev
      return [...prev, file]
    })
    
    // Add log
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
    setLogs(prev => [...prev, {
      id: generateId(),
      time,
      type: "INFO",
      message: `Opened file: ${file.name}`,
      source: "Editor"
    }])
  }, [])

  const handleFileChange = useCallback((content: string) => {
    if (!selectedFile) return
    
    setSelectedFile(prev => prev ? { ...prev, content } : null)
    setOpenFiles(prev => prev.map(f => 
      f.id === selectedFile.id ? { ...f, content } : f
    ))
  }, [selectedFile])

  const handleTabSelect = useCallback((fileId: string) => {
    const file = openFiles.find(f => f.id === fileId)
    if (file) {
      setSelectedFile(file)
      setActiveFileId(fileId)
    }
  }, [openFiles])

  const handleTabClose = useCallback((fileId: string) => {
    setOpenFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      if (activeFileId === fileId) {
        const lastFile = newFiles[newFiles.length - 1]
        setSelectedFile(lastFile || null)
        setActiveFileId(lastFile?.id || null)
      }
      return newFiles
    })
  }, [activeFileId])

  const handleSave = useCallback(async () => {
    if (!selectedFile) return
    
    setIsSaving(true)
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
    
    try {
      const response = await fetch("/api/save-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          content: selectedFile.content,
          path: selectedFile.path
        })
      })
      
      if (response.ok) {
        setLogs(prev => [...prev, {
          id: generateId(),
          time,
          type: "SUCCESS",
          message: `Synced to Redis: ${selectedFile.name}`,
          source: "Sync"
        }])
      } else {
        throw new Error("Sync failed")
      }
    } catch {
      setLogs(prev => [...prev, {
        id: generateId(),
        time,
        type: "WARN",
        message: `Local save: ${selectedFile.name} (Redis unavailable)`,
        source: "Sync"
      }])
    } finally {
      setIsSaving(false)
    }
  }, [selectedFile])

  const handleClearLogs = useCallback(() => {
    setLogs([])
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
    setLogs([{
      id: generateId(),
      time,
      type: "INFO",
      message: "Log console cleared",
      source: "System"
    }])
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Top Header */}
        <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                N
              </div>
              NEXORA OS
            </div>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Github className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>GitHub</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar - Tree View */}
            <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
              <TreeView
                files={files}
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Main Editor Area */}
            <ResizablePanel defaultSize={60}>
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor */}
                <ResizablePanel defaultSize={70} minSize={30}>
                  <CodeEditor
                    file={selectedFile}
                    openFiles={openFiles}
                    activeFileId={activeFileId}
                    onFileChange={handleFileChange}
                    onTabSelect={handleTabSelect}
                    onTabClose={handleTabClose}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                {/* Log Console */}
                <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                  <LogConsole logs={logs} onClearLogs={handleClearLogs} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Right Sidebar - Inspector */}
            <ResizablePanel defaultSize={22} minSize={15} maxSize={30}>
              <InspectorPanel stats={stats} componentTree={componentTree} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  )
}
