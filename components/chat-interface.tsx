"use client"

import { Card } from "@/components/ui/card";
import { chatClient } from "@/lib/chat-client";
import { AlertCircle, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction
} from "@/components/prompt-kit/prompt-input";
import { Message, MessageAvatar, MessageContent } from "@/components/prompt-kit/message";
import { Loader } from "@/components/prompt-kit/loader";
import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: number,
  type: "user" | "ai"
  content: string
  timestamp: Date
  isError?: boolean
}

const SUGGESTIONS = [
  "Check live DEX rates",
  "Send money to India",
  "Find a recipient",
  "What are the fees?",
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
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

  const handleSend = async (value: string = input) => {
    if (!value.trim()) return

    // 1. Create and display User Message immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      content: value,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // 2. Create placeholder for AI Message
    const aiMessageId = Date.now() + 1;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])

    try {
      // 3. Call the Real Backend with Streaming
      let firstChunkReceived = false;
      await chatClient.streamMessage(userMessage.content, (chunk) => {
        if (!firstChunkReceived) {
          setLoading(false); // Stop loading indicator once first chunk arrives
          firstChunkReceived = true;
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        )
      }, 99)

    } catch (error) {
      // 4. Handle Errors Gracefully
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
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
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-orange-200 overflow-hidden shadow-2xl">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-orange-900/40 space-y-4">
            <MessageCircle className="w-12 h-12 opacity-50" />
            <p>Start a conversation</p>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} className={msg.type === "user" ? "justify-end" : "justify-start"}>
            {msg.type === "ai" && (
              <MessageAvatar
                src="/bot-avatar.png"
                alt="AI Agent"
                fallback="AI"
                className="bg-orange-500 text-white"
              />
            )}
            <div className={`flex flex-col max-w-[80%] ${msg.type === "user" ? "items-end" : "items-start"}`}>
              <Card
                className={`px-4 py-3 border-none shadow-sm ${msg.type === "user"
                  ? "bg-orange-600 text-white rounded-2xl rounded-tr-sm"
                  : msg.isError
                    ? "bg-red-50 text-red-900 border border-red-200 rounded-2xl rounded-tl-sm"
                    : "bg-white text-slate-900 border border-orange-100 rounded-2xl rounded-tl-sm shadow-sm"
                  }`}
              >
                <div className="flex items-start gap-2">
                  {msg.isError && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <MessageContent markdown={msg.type === "ai"} className="text-sm leading-relaxed">
                    {msg.content}
                  </MessageContent>
                </div>
              </Card>
              <span className="text-[10px] text-orange-900/40 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {msg.type === "user" && (
              <MessageAvatar
                src=""
                alt="User"
                fallback="ME"
                className="bg-orange-200 text-orange-900"
              />
            )}
          </Message>
        ))}

        {loading && messages[messages.length - 1]?.type === 'user' && (
          <div className="flex justify-start items-center gap-2 p-2">
            <MessageAvatar src="" alt="AI" fallback="AI" className="bg-orange-500 text-white w-8 h-8" />
            <Loader variant="dots" className="text-orange-500" />
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-orange-100 p-4 bg-orange-50/50">
        {messages.length < 2 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTIONS.map((suggestion) => (
              <PromptSuggestion
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 text-xs whitespace-nowrap"
              >
                {suggestion}
              </PromptSuggestion>
            ))}
          </div>
        )}

        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={() => handleSend()}
          isLoading={loading}
          className="bg-white border-orange-200 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 shadow-sm"
        >
          <PromptInputTextarea
            placeholder="Ask about rates, fees, or send money..."
            className="text-orange-900 placeholder:text-orange-900/40"
          />
          <PromptInputActions className="justify-end pt-2 pb-1 pr-1">
            <PromptInputAction tooltip="Send message">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-100"
              >
                <Send className="w-4 h-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
        <div className="text-center mt-2">
          <span className="text-[10px] text-orange-900/40">
            Powered by RemitAI & Prompt Kit
          </span>
        </div>
      </div>
    </div>
  )
}