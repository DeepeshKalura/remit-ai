"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatClient } from "@/lib/chat-client";
import { AlertCircle, Loader2, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";



interface Message {
  id: number,
  type: "user" | "ai"
  content: string
  timestamp: Date
  isError?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm RemitAI. How can I help you send money today? I can check live DEX rates or help you find a recipient.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // 1. Create and display User Message immediately
    const userMessage: Message = {
      id: 99,
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // 2. Call the Real Backend
      const responseText = await chatClient.sendMessage(userMessage.content, userMessage.id)

      // 3. Display AI Response
      const aiMessage: Message = {
        id: Math.floor(Math.random() * 1000000000000000),
        type: "ai",
        content: responseText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

    } catch (error) {
      // 4. Handle Errors Gracefully
      const errorMessage: Message = {
        id: Math.floor(Math.random() * 1000000000000000),
        type: "ai",
        content: "I'm having trouble connecting to the backend. Is the Python server running on port 5000?",
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Chat Messages Area */}
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
              className={`max-w-[85%] px-4 py-2 ${msg.type === "user"
                ? "bg-cyan-600 border-cyan-500 text-white"
                : msg.isError
                  ? "bg-red-900/50 border-red-500/50 text-red-200"
                  : "bg-slate-700 border-slate-600 text-slate-100"
                }`}
            >
              <div className="flex items-start gap-2">
                {msg.isError && <AlertCircle className="w-4 h-4 mt-0.5" />}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              <p className="text-[10px] mt-1 opacity-70 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-slate-700 border-slate-600 px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs text-slate-400">Thinking...</span>
              </div>
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
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus-visible:ring-cyan-500"
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