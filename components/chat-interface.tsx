"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Loader2, MessageCircle } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm RemitAI. How can I help you send money today? You can ask me about exchange rates, fees, or I can guide you through sending a remittance.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const aiResponses: Record<string, string> = {
      rate: "Current ADA/USD rate is 1.12 with excellent liquidity on Minswap and SundaeSwap DEXes.",
      fee: "Our fees are 0.5% on average, significantly lower than traditional remittance services.",
      send: "I can help you send money right away! Which country are you sending to?",
      default: "I'm here to help with your remittance needs. What would you like to know?",
    }

    const lowerInput = input.toLowerCase()
    let response = aiResponses.default
    if (lowerInput.includes("rate")) response = aiResponses.rate
    else if (lowerInput.includes("fee")) response = aiResponses.fee
    else if (lowerInput.includes("send")) response = aiResponses.send

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-xs px-4 py-2 ${
                msg.type === "user"
                  ? "bg-cyan-600 border-cyan-500 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-100"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-slate-700 border-slate-600 px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            </Card>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 bg-slate-800">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about rates, fees, or send money..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
