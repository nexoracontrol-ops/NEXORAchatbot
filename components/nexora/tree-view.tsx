"use client"

import React, { useState, useMemo } from "react"
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Code, Settings, Database } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  content?: string
  language?: string
  children?: FileNode[]
  path: string
}

interface TreeViewProps {
  files: FileNode[]
  selectedFile: FileNode | null
  onSelectFile: (file: FileNode) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

function getFileIcon(fileName: string, isFolder: boolean, isOpen: boolean) {
  if (isFolder) {
    return isOpen ? <FolderOpen className="h-4 w-4 text-yellow-500" /> : <Folder className="h-4 w-4 text-yellow-500" />
  }
  
  const ext = fileName.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "kt":
    case "java":
      return <Code className="h-4 w-4 text-orange-400" />
    case "tsx":
    case "ts":
      return <Code className="h-4 w-4 text-blue-400" />
    case "json":
      return <Settings className="h-4 w-4 text-yellow-400" />
    case "sql":
      return <Database className="h-4 w-4 text-green-400" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

interface TreeNodeProps {
  node: FileNode
  level: number
  selectedFile: FileNode | null
  onSelectFile: (file: FileNode) => void
  searchTerm: string
}

function TreeNode({ node, level, selectedFile, onSelectFile, searchTerm }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  
  const isSelected = selectedFile?.id === node.id
  const isFolder = node.type === "folder"
  
  // Filter logic for search
  const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase())
  const hasMatchingChildren = node.children?.some(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.children?.some(grandChild => grandChild.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  if (searchTerm && !matchesSearch && !hasMatchingChildren) {
    return null
  }
  
  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen)
    } else {
      onSelectFile(node)
    }
  }
  
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 cursor-pointer rounded-sm transition-colors",
          "hover:bg-accent/50",
          isSelected && "bg-primary/20 text-primary"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder && (
          <span className="flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </span>
        )}
        {!isFolder && <span className="w-3.5" />}
        {getFileIcon(node.name, isFolder, isOpen)}
        <span className={cn(
          "text-sm truncate",
          matchesSearch && searchTerm && "bg-yellow-500/30 px-0.5 rounded"
        )}>
          {node.name}
        </span>
      </div>
      
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ files, selectedFile, onSelectFile, searchTerm, onSearchChange }: TreeViewProps) {
  const fileCount = useMemo(() => {
    const countFiles = (nodes: FileNode[]): number => {
      return nodes.reduce((count, node) => {
        if (node.type === "file") return count + 1
        if (node.children) return count + countFiles(node.children)
        return count
      }, 0)
    }
    return countFiles(files)
  }, [files])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-semibold mb-3">
          <Code className="h-5 w-5" />
          <span>NEXORA OS</span>
        </div>
        <Input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 text-xs bg-background"
        />
      </div>
      
      <ScrollArea className="flex-1 nexora-scrollbar">
        <div className="py-2">
          {files.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        {fileCount} files in workspace
      </div>
    </div>
  )
}
