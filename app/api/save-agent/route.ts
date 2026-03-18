import { NextRequest, NextResponse } from "next/server"

// In production, you would connect to Redis here
// import Redis from "ioredis"
// const redis = new Redis(process.env.REDIS_URL)

interface SaveAgentRequest {
  fileName: string
  content: string
  path: string
}

// In-memory storage for demo (replace with Redis in production)
const agentStorage = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const body: SaveAgentRequest = await request.json()
    const { fileName, content, path } = body

    if (!fileName || content === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Store the agent code
    const key = `agent:${path || fileName}`
    agentStorage.set(key, content)

    // In production with Redis:
    // await redis.set(key, content)
    // await redis.publish("nexora_updates", fileName)

    console.log(`[NEXORA] Saved agent: ${fileName} (${content.length} chars)`)

    return NextResponse.json({
      success: true,
      message: `Agent ${fileName} synced successfully`,
      key,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[NEXORA] Save error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save agent" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileName = searchParams.get("fileName")
  const path = searchParams.get("path")

  if (!fileName && !path) {
    // Return all stored agents
    const agents: Record<string, string> = {}
    agentStorage.forEach((value, key) => {
      agents[key] = value
    })
    return NextResponse.json({ success: true, agents })
  }

  const key = `agent:${path || fileName}`
  const content = agentStorage.get(key)

  if (!content) {
    return NextResponse.json(
      { success: false, error: "Agent not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    fileName,
    content,
    timestamp: new Date().toISOString()
  })
}
