"use client"

import React from "react"
import { Cpu, MemoryStick, Activity, Wifi, Clock, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface SystemStats {
  cpu: number
  memory: number
  agents: number
  connected: boolean
  lastSync: string
}

interface InspectorPanelProps {
  stats: SystemStats
  componentTree: string[]
}

export function InspectorPanel({ stats, componentTree }: InspectorPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card p-4 text-xs">
      {/* System Status */}
      <div className="mb-6">
        <h3 className="uppercase text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          System Status
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="h-3 w-3" /> CPU
              </span>
              <span className={cn(
                stats.cpu > 80 ? "text-red-400" : stats.cpu > 50 ? "text-yellow-400" : "text-green-400"
              )}>
                {stats.cpu}%
              </span>
            </div>
            <Progress value={stats.cpu} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MemoryStick className="h-3 w-3" /> Memory
              </span>
              <span className={cn(
                stats.memory > 80 ? "text-red-400" : stats.memory > 50 ? "text-yellow-400" : "text-green-400"
              )}>
                {stats.memory}%
              </span>
            </div>
            <Progress value={stats.memory} className="h-1.5" />
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="uppercase text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5" />
          Connection
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Redis</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] h-4",
                stats.connected 
                  ? "border-green-500/50 text-green-400" 
                  : "border-red-500/50 text-red-400"
              )}
            >
              {stats.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active Agents</span>
            <span className="text-primary font-medium">{stats.agents}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last Sync
            </span>
            <span className="text-muted-foreground">{stats.lastSync}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Component Tree */}
      <div className="flex-1">
        <h3 className="uppercase text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          Component Tree
        </h3>
        
        <div className="space-y-1 pl-2 border-l border-border">
          {componentTree.map((component, i) => (
            <div 
              key={i}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              style={{ paddingLeft: `${i * 8}px` }}
            >
              <span className="text-primary">●</span>
              {component}
            </div>
          ))}
        </div>
      </div>

      {/* Theme Preview */}
      <div className="mt-auto pt-4">
        <h3 className="uppercase text-muted-foreground font-semibold mb-3">Theme</h3>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="aspect-square rounded bg-primary" title="Primary" />
          <div className="aspect-square rounded bg-secondary" title="Secondary" />
          <div className="aspect-square rounded bg-accent" title="Accent" />
          <div className="aspect-square rounded bg-muted" title="Muted" />
        </div>
      </div>
    </div>
  )
}
