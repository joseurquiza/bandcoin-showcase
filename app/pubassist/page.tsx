"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Send, Loader2, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { askPubAssistantAction, generateCSVAction } from "./actions"

interface Message {
  role: "assistant" | "user"
  content: string
}

interface WorkData {
  title?: string
  duration?: string
  writers?: string[]
  composers?: string[]
  publishers?: string[]
  iswc?: string
  isrc?: string
  releaseDate?: string
  genre?: string
  hasAI?: boolean
  hasSamples?: boolean
  sampleDetails?: string
  performanceType?: string
}

const requiredFields = [
  { key: "title", label: "Song Title" },
  { key: "duration", label: "Duration" },
  { key: "writers", label: "Writers/Authors" },
  { key: "releaseDate", label: "Release Date" },
  { key: "genre", label: "Genre" },
]

export default function PubAssistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Publishing Assistant. I'll help you register your musical work with ASCAP or BMI. Let's start with the basics - what's the title of the song you want to register?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [workData, setWorkData] = useState<WorkData>({})
  const [isComplete, setIsComplete] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      // Call AI to process the response and extract data
      const result = await askPubAssistantAction(userMessage, workData)

      // Update work data
      setWorkData(result.workData)

      // Add assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: result.message }])

      // Check if registration is complete
      if (result.isComplete) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error("[v0] Error asking assistant:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const csvContent = await generateCSVAction(workData)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${workData.title || "work"}-registration.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("[v0] Error generating CSV:", error)
    }
  }

  const getFieldStatus = (key: string): boolean => {
    const value = workData[key as keyof WorkData]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return !!value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">PubAssist</h1>
              <p className="text-sm text-white/60">Publishing Registration Assistant</p>
            </div>
          </div>
          {isComplete && (
            <Button onClick={handleDownloadCSV} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              {/* Messages */}
              <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white border border-white/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type your answer here..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-white/40 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-4">
            {/* Required Fields */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Registration Progress</h2>
              </div>
              <div className="space-y-3">
                {requiredFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    {getFieldStatus(field.key) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/20 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${getFieldStatus(field.key) ? "text-white" : "text-white/40"}`}>
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Current Data */}
            {Object.keys(workData).length > 0 && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Work Information</h2>
                <div className="space-y-3">
                  {workData.title && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Title</p>
                      <p className="text-sm text-white font-medium">{workData.title}</p>
                    </div>
                  )}
                  {workData.duration && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Duration</p>
                      <p className="text-sm text-white">{workData.duration}</p>
                    </div>
                  )}
                  {workData.writers && workData.writers.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Writers</p>
                      <div className="flex flex-wrap gap-1">
                        {workData.writers.map((writer, i) => (
                          <Badge key={i} variant="secondary" className="bg-purple-600/20 text-purple-300 border-0">
                            {writer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {workData.genre && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Genre</p>
                      <p className="text-sm text-white">{workData.genre}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Status */}
            {isComplete && (
              <Card className="bg-green-950/40 border-green-500/20 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="text-white font-semibold">Ready to Submit!</h3>
                    <p className="text-sm text-white/60">Download your CSV file to upload to ASCAP or BMI</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
