"use client"

import { useState, useEffect, useRef, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, User, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { createSupportSession, sendSupportMessage, escalateToHuman, getChatHistory } from "@/app/support/actions"

const SupportChatContext = createContext<{
  openSupport: () => void
} | null>(null)

export const useSupportChat = () => {
  const context = useContext(SupportChatContext)
  if (!context) {
    throw new Error("useSupportChat must be used within SupportChatProvider")
  }
  return context
}

interface Message {
  sender_type: string
  sender_name: string | null
  message: string
  created_at: string
}

function SupportChatWidgetContent() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [showUserForm, setShowUserForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages when escalated
  useEffect(() => {
    if (isEscalated && sessionId && isOpen) {
      pollIntervalRef.current = setInterval(async () => {
        const result = await getChatHistory(sessionId)
        if (result.success && result.messages) {
          setMessages(result.messages as Message[])
        }
      }, 3000) // Poll every 3 seconds
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isEscalated, sessionId, isOpen])

  const handleOpen = async () => {
    setIsOpen(true)
    if (!sessionId) {
      const result = await createSupportSession()
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId)
        const history = await getChatHistory(result.sessionId)
        if (history.success && history.messages) {
          setMessages(history.messages as Message[])
        }
      }
    }
  }

  // Listen for custom events to open chat
  useEffect(() => {
    const handleOpenEvent = () => {
      handleOpen()
    }
    window.addEventListener("openSupportChat", handleOpenEvent)
    return () => {
      window.removeEventListener("openSupportChat", handleOpenEvent)
    }
  }, [sessionId])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return

    const userMsg = inputMessage
    setInputMessage("")
    setIsLoading(true)

    // Add user message optimistically
    const optimisticMsg: Message = {
      sender_type: "user",
      sender_name: userName || "Guest",
      message: userMsg,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    try {
      const result = await sendSupportMessage(sessionId, userMsg, userEmail || undefined, userName || undefined)

      if (result.success && result.response) {
        if (result.isEscalated) {
          setIsEscalated(true)
        }

        // Fetch updated history to get AI response
        const history = await getChatHistory(sessionId)
        if (history.success && history.messages) {
          setMessages(history.messages as Message[])
        }
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalate = async () => {
    if (!sessionId) return

    const result = await escalateToHuman(sessionId)
    if (result.success) {
      setIsEscalated(true)
      setShowUserForm(true)

      // Refresh messages
      const history = await getChatHistory(sessionId)
      if (history.success && history.messages) {
        setMessages(history.messages as Message[])
      }
    }
  }

  const handleSubmitUserInfo = () => {
    if (userName.trim()) {
      setShowUserForm(false)
    }
  }

  const handleResetChat = async () => {
    // Clear current state
    setMessages([])
    setSessionId(null)
    setIsEscalated(false)
    setShowUserForm(false)
    setInputMessage("")

    // Create new session
    const result = await createSupportSession()
    if (result.success && result.sessionId) {
      setSessionId(result.sessionId)
      const history = await getChatHistory(result.sessionId)
      if (history.success && history.messages) {
        setMessages(history.messages as Message[])
      }
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-50"
        size="icon"
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col bg-zinc-900 border-zinc-800"
      role="dialog"
      aria-label="Support chat"
    >
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
          <h3 className="font-semibold text-white">BandCoin Support</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleResetChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            aria-label="Start new conversation"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-2 ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender_type !== "user" && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.sender_type === "user"
                  ? "bg-purple-600 text-white"
                  : msg.sender_type === "admin"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {msg.sender_type !== "user" && <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>}
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
            {msg.sender_type === "user" && (
              <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-zinc-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {showUserForm && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-sm text-zinc-400 mb-2">Please provide your contact info so we can assist you better:</p>
          <Input
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mb-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <Input
            placeholder="Your email (optional)"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="mb-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <Button onClick={handleSubmitUserInfo} className="w-full" size="sm">
            Continue
          </Button>
        </div>
      )}

      <footer className="p-4 border-t border-zinc-800">
        {!isEscalated && (
          <Button
            onClick={handleEscalate}
            variant="outline"
            size="sm"
            className="w-full mb-2 text-xs border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white"
            aria-label="Escalate to human support"
          >
            Talk to a Human
          </Button>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            aria-label="Message input"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="bg-gradient-to-br from-purple-600 to-pink-600"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </footer>
    </Card>
  )
}

export default function SupportChatWidget() {
  const openSupport = () => {
    window.dispatchEvent(new Event("openSupportChat"))
  }

  return (
    <SupportChatContext.Provider value={{ openSupport }}>
      <SupportChatWidgetContent />
    </SupportChatContext.Provider>
  )
}
