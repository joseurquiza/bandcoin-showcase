"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles,
  Loader2,
  Download,
  Upload,
  Globe,
  FileCode,
  Home,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { submitWebsiteOrderAction } from "@/app/api/orders/actions"
import { listSiteBuilderProjects } from "@/app/api/v0-chat/track-project"
import { loadV0ChatByUrl } from "@/app/api/v0-chat/load-chat"

interface V0ChatResult {
  chatId: string
  content: string
  files: Array<{ name: string; content: string }>
  demo: string
  thinkingContent?: string
}

export default function SiteBuilder() {
  const [step, setStep] = useState<"describe" | "preview" | "order" | "success">("describe")
  const [websiteIdea, setWebsiteIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [v0Result, setV0Result] = useState<V0ChatResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState("")
  const [progressSteps, setProgressSteps] = useState<Array<{ stage: string; icon?: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sidebar state management
  const [showProjectsSidebar, setShowProjectsSidebar] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectChats, setProjectChats] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  const [followUpMessage, setFollowUpMessage] = useState("")
  const [isContinuingChat, setIsContinuingChat] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] = useState("")

  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const dbProjects = await listSiteBuilderProjects()
      setProjects(dbProjects)
    } catch (error) {
      console.error("[v0] Error loading projects:", error)
      setProjects([])
    }
    setIsLoadingProjects(false)
  }

  const loadChatFromSidebar = async (v0ChatId: string) => {
    setIsLoadingProjects(true)
    setGenerationError(null)

    try {
      console.log("[v0] Loading chat from sidebar:", v0ChatId)

      const chatUrl = `https://v0.app/chat/${v0ChatId}`
      const result = await loadV0ChatByUrl(chatUrl)

      console.log("[v0] Load chat result:", result)

      if (!result.success) {
        setGenerationError(result.error || "Failed to load chat")
        return
      }

      const { getProjectByChatId } = await import("@/app/api/v0-chat/track-project")
      const project = await getProjectByChatId(v0ChatId)

      if (project?.conversationHistory) {
        setConversationHistory(project.conversationHistory)
      } else {
        setConversationHistory([])
      }

      console.log("[v0] Demo URL:", result.demo)
      console.log("[v0] Chat content:", result.content)

      setWebsiteIdea(result.websiteIdea || "")
      setV0Result({
        chatId: result.chatId,
        content: result.content,
        files: [],
        demo: result.demo,
      })
      setStep("preview")
    } catch (error) {
      console.error("[v0] Error loading chat from sidebar:", error)
      setGenerationError("Failed to load website. Please try again.")
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleGenerateMockup = async () => {
    if (!websiteIdea.trim()) return

    setIsGenerating(true)
    setGenerationError(null)
    setGenerationProgress("Starting generation...")
    setProgressSteps([])

    try {
      const initialHistory = [{ role: "user", content: websiteIdea }]

      const response = await fetch("/api/v0-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: websiteIdea, images: [] }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate website")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let result: V0ChatResult | null = null

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim()
            if (dataStr === "[DONE]") continue

            try {
              const data = JSON.parse(dataStr)

              if (data.error) {
                throw new Error(data.error)
              }

              if (data.progress) {
                setGenerationProgress(data.progress)
              }

              if (data.steps) {
                setProgressSteps(data.steps)
              }

              if (data.chatId && data.content) {
                result = data
                setV0Result(data)

                const updatedHistory = [...initialHistory, { role: "assistant", content: data.content }]
                setConversationHistory(updatedHistory)

                const { saveGeneratedProject } = await import("@/app/api/v0-chat/track-project")
                await saveGeneratedProject({
                  v0ChatId: data.chatId,
                  websiteIdea: websiteIdea,
                  demoUrl: data.demo,
                  conversationHistory: updatedHistory,
                })

                await loadProjects()
              }
            } catch (e) {
              console.error("[v0] Error parsing SSE data:", e)
            }
          }
        }
      }

      if (result) {
        setStep("preview")
      } else {
        throw new Error("No result received")
      }
    } catch (error) {
      console.error("[v0] Error generating website:", error)
      setGenerationError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsGenerating(false)
      setGenerationProgress("")
      setProgressSteps([])
    }
  }

  const handleContinueChat = async () => {
    if (!followUpMessage.trim() || !v0Result?.chatId) return

    setIsContinuingChat(true)
    setGenerationError(null)
    setGenerationProgress("Continuing conversation...")
    setProgressSteps([])

    try {
      const updatedHistory = [...conversationHistory, { role: "user", content: followUpMessage }]

      const response = await fetch("/api/v0-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: followUpMessage, images: [] }],
          chatId: v0Result.chatId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to continue chat")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim()
            if (dataStr === "[DONE]") continue

            try {
              const data = JSON.parse(dataStr)

              if (data.error) {
                throw new Error(data.error)
              }

              if (data.progress) {
                setGenerationProgress(data.progress)
              }

              if (data.steps) {
                setProgressSteps(data.steps)
              }

              if (data.content) {
                setV0Result((prev) => ({
                  ...prev!,
                  content: data.content,
                  demo: data.demo || prev!.demo,
                  thinkingContent: data.thinkingContent,
                }))

                const finalHistory = [...updatedHistory, { role: "assistant", content: data.content }]
                setConversationHistory(finalHistory)

                const { saveGeneratedProject } = await import("@/app/api/v0-chat/track-project")
                await saveGeneratedProject({
                  v0ChatId: v0Result.chatId,
                  websiteIdea: websiteIdea,
                  demoUrl: data.demo || v0Result.demo,
                  conversationHistory: finalHistory,
                })
              }
            } catch (e) {
              console.error("[v0] Error parsing continuation SSE data:", e)
            }
          }
        }
      }

      setFollowUpMessage("")
      await loadProjects()
    } catch (error) {
      console.error("[v0] Error continuing chat:", error)
      setGenerationError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsContinuingChat(false)
      setGenerationProgress("")
      setProgressSteps([])
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await submitWebsiteOrderAction({
        name,
        email,
        phone,
        websiteIdea,
        customDomain,
        budget,
        timeline,
        v0ChatId: v0Result?.chatId || null,
      })

      setStep("success")
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Failed to submit order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadProject = () => {
    if (!v0Result) return

    const projectData = {
      websiteIdea,
      chatId: v0Result.chatId,
      demoUrl: v0Result.demo,
      files: v0Result.files,
      content: v0Result.content,
      timestamp: new Date().toISOString(),
      conversationHistory: conversationHistory,
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `site-builder-project-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string)
        setWebsiteIdea(projectData.websiteIdea || "")
        setV0Result({
          chatId: projectData.chatId || "",
          content: projectData.content || "",
          files: projectData.files || [],
          demo: projectData.demoUrl || "",
        })
        setConversationHistory(projectData.conversationHistory || [])
        setStep("preview")
      } catch (error) {
        alert("Failed to load project file. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside
        className={`fixed top-0 right-0 h-screen bg-zinc-950 border-l border-white/10 transition-all duration-300 z-40 ${
          showProjectsSidebar ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-heading font-semibold">Your Websites</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjectsSidebar(false)}
              className="hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                No websites yet. Create your first website to get started!
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => loadChatFromSidebar(project.v0ChatId)}
                    className="w-full text-left p-3 rounded-lg border bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-medium text-sm line-clamp-2">{project.websiteIdea}</div>
                    <div className="text-xs text-white/40 mt-2 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-mono text-cyan-400/60 mt-1 truncate">{project.v0ChatId}</div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Refresh Button */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={loadProjects}
              variant="outline"
              className="w-full border-white/20 hover:bg-white/10 bg-transparent"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingProjects ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </aside>

      {!showProjectsSidebar && (
        <button
          onClick={() => setShowProjectsSidebar(true)}
          className="fixed top-20 right-4 z-40 bg-zinc-900 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showProjectsSidebar ? "mr-80" : "mr-0"}`}>
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Site Builder
              </h1>
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoadProject} className="hidden" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-white/20 hover:bg-white/10 text-white bg-transparent"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Load Project
                </Button>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          {step === "describe" && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-heading font-bold">Build Your Dream Website</h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Describe your website vision and our AI will generate a fully functional prototype. You can then order
                  custom hosting and domain from BandCoin ShowCase.
                </p>
              </div>

              <Card className="bg-zinc-900 border-white/10 p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Describe Your Website</label>
                    <Textarea
                      value={websiteIdea}
                      onChange={(e) => setWebsiteIdea(e.target.value)}
                      placeholder="E.g., A website for my band Animal Army with a dark, energetic aesthetic. Include a hero section, music showcase, tour dates, bio, merch store, and newsletter signup..."
                      className="min-h-[200px] bg-black/50 border-white/20 text-white resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {generationError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                      {generationError}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateMockup}
                    disabled={!websiteIdea.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Website with AI
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-zinc-900 text-white/60">or</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === "preview" && v0Result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 font-heading text-white">
                        <Globe className="w-6 h-6 text-blue-400" />
                        Your Website Preview
                      </CardTitle>
                      <CardDescription>Generated by v0 AI based on your description</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadProject} className="gap-2 bg-transparent text-white">
                        <Download className="w-4 h-4" />
                        Download Project
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {v0Result.demo ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">Live Preview</label>
                      <div className="border border-white/20 rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={v0Result.demo}
                          className="w-full h-[600px]"
                          title="Website Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          onLoad={() => console.log("[v0] iframe loaded successfully")}
                          onError={(e) => console.error("[v0] iframe error:", e)}
                        />
                      </div>
                      <p className="text-xs text-white/40">Preview URL: {v0Result.demo}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Live Preview</label>
                      <div className="border border-white/20 rounded-lg overflow-hidden bg-black/50 p-8 text-center">
                        <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">No preview available for this project</p>
                        <p className="text-xs text-white/20 mt-2">The demo URL may not have been generated yet</p>
                      </div>
                    </div>
                  )}

                  {/* Generated Files */}
                  {v0Result.files && v0Result.files.length > 0 && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        Generated Files ({v0Result.files.length})
                      </label>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {v0Result.files.map((file, index) => (
                          <Card key={index} className="bg-black/50 border-white/10">
                            <CardHeader className="py-3">
                              <CardTitle className="text-sm font-mono">{file.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-3">
                              <pre className="text-xs overflow-x-auto bg-zinc-950 p-3 rounded border border-white/5">
                                <code>{file.content ? file.content.substring(0, 500) : "No content available"}...</code>
                              </pre>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response Content */}
                  {v0Result.content && (
                    <div className="space-y-2">
                      <label>AI Response</label>
                      <div className="p-4 bg-black/50 border border-white/10 rounded-lg text-sm whitespace-pre-wrap">
                        {v0Result.content}
                      </div>
                    </div>
                  )}

                  {/* Progress Steps History */}
                  {isGenerating && progressSteps.length > 0 && (
                    <div className="mt-6 space-y-2 bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="text-sm font-semibold text-white/60 mb-3">Progress:</div>
                      {progressSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                            index === progressSteps.length - 1 ? "text-white font-medium" : "text-white/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg">{step.stage}</span>
                          </div>
                          {index === progressSteps.length - 1 && (
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat Continuation UI */}
                  {v0Result && (
                    <div className="mt-6 border border-white/10 rounded-lg p-4 bg-black/20">
                      <h3 className="text-lg font-semibold text-white mb-3">Continue Building</h3>
                      <p className="text-sm text-white/60 mb-4">Ask for changes or refinements to your website</p>
                      <div className="flex gap-2">
                        <Textarea
                          value={followUpMessage}
                          onChange={(e) => setFollowUpMessage(e.target.value)}
                          placeholder="E.g., 'Make the header blue' or 'Add a contact form'"
                          className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                          disabled={isContinuingChat}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey && !isContinuingChat) {
                              handleContinueChat()
                            }
                          }}
                        />
                        <Button
                          onClick={handleContinueChat}
                          disabled={!followUpMessage.trim() || isContinuingChat}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {isContinuingChat ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Continue
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-white/40 mt-2">Press Ctrl+Enter to send</p>

                      {isContinuingChat && progressSteps.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {progressSteps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                              {index === progressSteps.length - 1 ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <div className="w-4 h-4 flex items-center justify-center">✓</div>
                              )}
                              <span>{step.stage}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("describe")} className="flex-1">
                      Start Over
                    </Button>
                    <Button
                      onClick={() => setStep("order")}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      Order Custom Hosting & Domain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "order" && (
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="font-heading">Complete Your Order</CardTitle>
                <CardDescription>
                  Fill in your details and we'll get started on building your dream website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Contact Information</h3>

                    <div>
                      <label htmlFor="name">Full Name *</label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email">Email Address *</label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone">Phone Number</label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="text-xl font-bold">Website Details</h3>

                    <div>
                      <label htmlFor="domain">Preferred Custom Domain</label>
                      <Input
                        id="domain"
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="myawesomesite.com"
                      />
                      <p className="text-white/40 text-sm mt-1">We'll help you register or transfer your domain</p>
                    </div>

                    <div>
                      <label htmlFor="budget">Budget Range</label>
                      <Input
                        id="budget"
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="$5,000 - $10,000"
                      />
                    </div>

                    <div>
                      <label htmlFor="timeline">Desired Timeline</label>
                      <Input
                        id="timeline"
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                        placeholder="Launch in 4 weeks"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-6 border-t border-white/10">
                    <h3 className="text-xl font-bold">Your Website Vision</h3>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                      <p className="text-white/80 text-sm leading-relaxed">{websiteIdea}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("describe")}
                      className="text-white/60 hover:text-white"
                    >
                      Edit Description
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep("preview")} className="flex-1">
                      Back to Preview
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Order Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="font-heading text-green-400">Order Submitted Successfully!</CardTitle>
                <CardDescription>We'll be in touch soon to discuss your project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Our team will review your website requirements within 24 hours</li>
                    <li>• We'll send you a detailed quote and timeline</li>
                    <li>• After approval, we'll set up your custom domain and hosting</li>
                    <li>• Your website will be deployed with SSL, CDN, and full support</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("describe")
                      setWebsiteIdea("")
                      setV0Result(null)
                      setName("")
                      setEmail("")
                      setPhone("")
                      setCustomDomain("")
                      setBudget("")
                      setTimeline("")
                      setConversationHistory([])
                    }}
                    className="flex-1"
                  >
                    Create Another Website
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button className="w-full">Return to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
