"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  MessageCircle,
  Send,
  CheckCircle,
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  TrendingUp,
  RefreshCw,
  Lock,
  AlertCircle,
  Wallet,
  CheckCircle2,
  XCircle,
  Mail,
  ExternalLink,
} from "lucide-react"
import { getEscalatedSessions, getChatHistory, sendAdminMessage, resolveSession } from "@/app/support/actions"
import { getAnalyticsSummary } from "@/app/admin/analytics-actions"
import { verifyAdminPassword } from "@/app/admin/auth-actions"
import { getAllWithdrawalRequests, processWithdrawal, updateWithdrawalStatus } from "./withdrawal-actions"
import { getContactSubmissions, updateSubmissionStatus } from "@/app/examples/actions"

interface Session {
  session_id: string
  user_email: string | null
  user_name: string | null
  status: string
  escalated_at: string
  created_at: string
  updated_at: string
  last_message: string
}

interface Message {
  sender_type: string
  sender_name: string | null
  message: string
  created_at: string
}

interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  pageViews: Array<{ page_path: string; views: number }>
  appUsage: Array<{ app_name: string; launches: number }>
  dailyViews: Array<{ date: string; views: number }>
  deviceBreakdown: Array<{ device_type: string; count: number }>
  browserBreakdown: Array<{ browser: string; count: number }>
  recentSessions: Array<{
    session_id: string
    first_seen: string
    last_seen: string
    page_views: number
    device_type: string
    browser: string
    os: string
    ip_address: string | null
  }>
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [adminName, setAdminName] = useState("Support Agent")
  const [isLoading, setIsLoading] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [dateRange, setDateRange] = useState("30")

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([])

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [transactionHash, setTransactionHash] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const authSession = sessionStorage.getItem("admin_authenticated")
    if (authSession === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthLoading(true)
    setAuthError("")

    try {
      const isValid = await verifyAdminPassword(password)
      if (isValid) {
        setIsAuthenticated(true)
        sessionStorage.setItem("admin_authenticated", "true")
        setPassword("")
      } else {
        setAuthError("Invalid password")
      }
    } catch {
      setAuthError("Authentication failed. Please try again.")
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("admin_authenticated")
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
      loadAnalytics()
      loadSubmissions()
      const interval = setInterval(loadSessions, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession)
      const interval = setInterval(() => loadMessages(selectedSession), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedSession])

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics()
    }
  }, [dateRange, isAuthenticated])

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadSessions = async () => {
    const result = await getEscalatedSessions()
    if (result.success && result.sessions) {
      setSessions(result.sessions as Session[])
    }
  }

  const loadMessages = async (sessionId: string) => {
    const result = await getChatHistory(sessionId)
    if (result.success && result.messages) {
      setMessages(result.messages as Message[])
    }
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    const result = await getAnalyticsSummary(Number.parseInt(dateRange))
    if (result.success && result.data) {
      setAnalytics(result.data)
    }
    setAnalyticsLoading(false)
  }

  const loadSubmissions = async () => {
    const result = await getContactSubmissions()
    if (result.success) {
      setSubmissions(result.submissions || [])
    }
  }

  const handleUpdateSubmissionStatus = async (id: number, status: string) => {
    await updateSubmissionStatus(id, status)
    await loadSubmissions()
  }

  const loadWithdrawals = async () => {
    const result = await getAllWithdrawalRequests()
    if (result.success) {
      setWithdrawals(result.withdrawals || [])
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession || isLoading) return

    setIsLoading(true)
    const result = await sendAdminMessage(selectedSession, inputMessage, adminName)

    if (result.success) {
      setInputMessage("")
      await loadMessages(selectedSession)
    }
    setIsLoading(false)
  }

  const handleResolve = async (sessionId: string) => {
    const result = await resolveSession(sessionId)
    if (result.success) {
      await loadSessions()
      if (selectedSession === sessionId) {
        setSelectedSession(null)
        setMessages([])
      }
    }
  }

  const handleProcessWithdrawal = async (status: "completed" | "rejected") => {
    if (!selectedWithdrawal) return

    setIsProcessing(true)
    const result = await processWithdrawal(
      selectedWithdrawal.id,
      status,
      status === "completed" ? transactionHash : undefined,
      adminNotes,
    )

    if (result.success) {
      toast.success(`Withdrawal ${status}`)
      setSelectedWithdrawal(null)
      setTransactionHash("")
      setAdminNotes("")
      await loadWithdrawals()
    } else {
      toast.error(result.message || "Failed to process withdrawal")
    }
    setIsProcessing(false)
  }

  const handleSetProcessing = async (withdrawalId: number) => {
    const result = await updateWithdrawalStatus(withdrawalId, "processing")
    if (result.success) {
      toast.success("Marked as processing")
      await loadWithdrawals()
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  // Calculate max for chart scaling
  const maxDailyViews = analytics?.dailyViews?.length
    ? Math.max(...analytics.dailyViews.map((d) => Number(d.views)))
    : 1

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-2 text-center">Enter your admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isAuthLoading || !password}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              {isAuthLoading ? "Verifying..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage support chats, view analytics, and process withdrawals</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 bg-transparent"
        >
          Sign Out
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-purple-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Support
              {sessions.length > 0 && <Badge className="ml-2 bg-red-500 text-white">{sessions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-purple-600">
              <Wallet className="h-4 w-4 mr-2" />
              Withdrawals
              {withdrawals.filter((w) => w.status === "pending").length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white">
                  {withdrawals.filter((w) => w.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-purple-600">
              <Mail className="h-4 w-4 mr-2" />
              Submissions
              {submissions.filter((s) => s.status === "new").length > 0 && (
                <Badge className="ml-2 bg-green-500 text-white">
                  {submissions.filter((s) => s.status === "new").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="7" className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      Last 7 days
                    </SelectItem>
                    <SelectItem value="30" className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="90" className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      Last 90 days
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalytics}
                  disabled={analyticsLoading}
                  className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/20">
                    <Eye className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Page Views</p>
                    <p className="text-2xl font-bold text-white">{analytics?.totalPageViews || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Unique Visitors</p>
                    <p className="text-2xl font-bold text-white">{analytics?.uniqueVisitors || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-600/20">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Avg Views/Visitor</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics?.uniqueVisitors
                        ? (Number(analytics.totalPageViews) / Number(analytics.uniqueVisitors)).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-600/20">
                    <Globe className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Active Apps</p>
                    <p className="text-2xl font-bold text-white">{analytics?.appUsage?.length || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Views Chart */}
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Daily Page Views</h3>
                <div className="h-48 flex items-end gap-1">
                  {analytics?.dailyViews && analytics.dailyViews.length > 0 ? (
                    analytics.dailyViews.slice(-14).map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:from-purple-500 hover:to-purple-300"
                          style={{
                            height: `${Math.max((Number(day.views) / maxDailyViews) * 100, 5)}%`,
                            minHeight: "4px",
                          }}
                          title={`${day.views} views`}
                        />
                        <span className="text-[10px] text-zinc-500 -rotate-45 origin-left">
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">No data yet</div>
                  )}
                </div>
              </Card>

              {/* App Usage */}
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">App Usage</h3>
                <div className="space-y-3">
                  {analytics?.appUsage && analytics.appUsage.length > 0 ? (
                    analytics.appUsage.map((app, i) => {
                      const maxLaunches = Math.max(...analytics.appUsage.map((a) => Number(a.launches)))
                      const percentage = (Number(app.launches) / maxLaunches) * 100
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{app.app_name}</span>
                            <span className="text-zinc-400">{app.launches} visits</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-zinc-500 text-center py-8">No app usage data yet</div>
                  )}
                </div>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Pages */}
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Top Pages</h3>
                <div className="space-y-2">
                  {analytics?.pageViews && analytics.pageViews.length > 0 ? (
                    analytics.pageViews.slice(0, 8).map((page, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0"
                      >
                        <span className="text-sm truncate max-w-[200px] text-white" title={page.page_path}>
                          {page.page_path === "/" ? "Home" : page.page_path}
                        </span>
                        <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                          {page.views}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 text-center py-4">No page data yet</div>
                  )}
                </div>
              </Card>

              {/* Device Breakdown */}
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Devices</h3>
                <div className="space-y-3">
                  {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 ? (
                    analytics.deviceBreakdown.map((device, i) => {
                      const total = analytics.deviceBreakdown.reduce((sum, d) => sum + Number(d.count), 0)
                      const percentage = total > 0 ? ((Number(device.count) / total) * 100).toFixed(1) : 0
                      return (
                        <div key={i} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.device_type)}
                            <span className="capitalize text-white">{device.device_type || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">{percentage}%</span>
                            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                              {device.count}
                            </Badge>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-zinc-500 text-center py-4">No device data yet</div>
                  )}
                </div>
              </Card>

              {/* Browsers */}
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Browsers</h3>
                <div className="space-y-3">
                  {analytics?.browserBreakdown && analytics.browserBreakdown.length > 0 ? (
                    analytics.browserBreakdown.slice(0, 5).map((browser, i) => {
                      const total = analytics.browserBreakdown.reduce((sum, b) => sum + Number(b.count), 0)
                      const percentage = total > 0 ? ((Number(browser.count) / total) * 100).toFixed(1) : 0
                      return (
                        <div key={i} className="flex items-center justify-between py-2">
                          <span className="text-white">{browser.browser || "Unknown"}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">{percentage}%</span>
                            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                              {browser.count}
                            </Badge>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-zinc-500 text-center py-4">No browser data yet</div>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Visitors</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">Device</th>
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">Browser</th>
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">OS</th>
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">IP Address</th>
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">Pages</th>
                      <th className="text-left py-2 px-2 text-zinc-400 font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.recentSessions && analytics.recentSessions.length > 0 ? (
                      analytics.recentSessions.map((session, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(session.device_type)}
                              <span className="capitalize text-white">{session.device_type || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-white">{session.browser || "Unknown"}</td>
                          <td className="py-2 px-2 text-white">{session.os || "Unknown"}</td>
                          <td className="py-2 px-2 text-zinc-400 font-mono text-xs">{session.ip_address || "—"}</td>
                          <td className="py-2 px-2">
                            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                              {session.page_views}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-zinc-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(session.last_seen)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-zinc-500">
                          No visitor data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions List */}
              <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 p-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Escalated Chats</h2>
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No escalated chats</p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.session_id}
                        onClick={() => setSelectedSession(session.session_id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSession === session.session_id
                            ? "bg-purple-600/20 border border-purple-600"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-white">{session.user_name || "Guest"}</span>
                          <Badge variant="outline" className="text-xs text-white">
                            {session.status}
                          </Badge>
                        </div>
                        {session.user_email && (
                          <p className="text-xs text-zinc-500 mb-1 text-white">{session.user_email}</p>
                        )}
                        <p className="text-xs text-zinc-500 truncate text-white">{session.last_message}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Chat View */}
              <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col h-[calc(100vh-300px)] min-h-[400px]">
                {selectedSession ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {sessions.find((s) => s.session_id === selectedSession)?.user_name || "Guest"}
                        </h3>
                        <p className="text-xs text-zinc-400 text-white">
                          {sessions.find((s) => s.session_id === selectedSession)?.user_email}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleResolve(selectedSession)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-2 ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.sender_type !== "user" && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] rounded-lg p-3 ${
                              msg.sender_type === "user"
                                ? "bg-zinc-700 text-white"
                                : msg.sender_type === "admin"
                                  ? "bg-green-600 text-white"
                                  : "bg-zinc-800 text-zinc-100"
                            }`}
                          >
                            <p className="text-xs opacity-70 mb-1 text-white">{msg.sender_name}</p>
                            <p className="text-sm whitespace-pre-wrap text-white">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Admin name..."
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-40 bg-zinc-800 border-zinc-700 text-sm text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your response..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading || !inputMessage.trim()}
                          size="icon"
                          className="bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Select a chat to view conversation
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Withdrawal Requests List */}
              <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 p-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Withdrawal Requests</h2>
                <div className="space-y-2">
                  {withdrawals.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No withdrawal requests</p>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedWithdrawal?.id === withdrawal.id
                            ? "bg-amber-600/20 border border-amber-600"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-white">
                            {withdrawal.display_name || withdrawal.email || "User"}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              withdrawal.status === "completed"
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : withdrawal.status === "rejected"
                                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                                  : withdrawal.status === "processing"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                            }
                          >
                            {withdrawal.status}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-amber-400">{withdrawal.amount} BC</div>
                        <p className="text-xs text-zinc-500 truncate font-mono">{withdrawal.stellar_address}</p>
                        <p className="text-xs text-zinc-600 mt-1">{new Date(withdrawal.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Withdrawal Details */}
              <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 p-6">
                {selectedWithdrawal ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-white">Withdrawal Details</h2>
                      <Badge
                        variant="outline"
                        className={
                          selectedWithdrawal.status === "completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : selectedWithdrawal.status === "rejected"
                              ? "bg-red-500/20 text-red-400 border-red-500/50"
                              : selectedWithdrawal.status === "processing"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                        }
                      >
                        {selectedWithdrawal.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">User</p>
                        <p className="text-white font-medium">
                          {selectedWithdrawal.display_name || selectedWithdrawal.email || "Anonymous"}
                        </p>
                        {selectedWithdrawal.email && (
                          <p className="text-xs text-zinc-500">{selectedWithdrawal.email}</p>
                        )}
                      </div>

                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-amber-400">{selectedWithdrawal.amount} BC</p>
                      </div>

                      <div className="bg-zinc-800 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-zinc-400 mb-1">Stellar Address</p>
                        <p className="text-white font-mono text-sm break-all">{selectedWithdrawal.stellar_address}</p>
                      </div>

                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">User Total Tokens</p>
                        <p className="text-white font-medium">{selectedWithdrawal.total_tokens} BC</p>
                      </div>

                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">Requested</p>
                        <p className="text-white text-sm">{new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
                      </div>

                      {selectedWithdrawal.processed_at && (
                        <>
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-400 mb-1">Processed By</p>
                            <p className="text-white text-sm">{selectedWithdrawal.processed_by_email || "Admin"}</p>
                          </div>

                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-400 mb-1">Processed</p>
                            <p className="text-white text-sm">
                              {new Date(selectedWithdrawal.processed_at).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}

                      {selectedWithdrawal.transaction_hash && (
                        <div className="bg-zinc-800 p-4 rounded-lg col-span-2">
                          <p className="text-sm text-zinc-400 mb-1">Transaction Hash</p>
                          <p className="text-white font-mono text-xs break-all">
                            {selectedWithdrawal.transaction_hash}
                          </p>
                        </div>
                      )}

                      {selectedWithdrawal.admin_notes && (
                        <div className="bg-zinc-800 p-4 rounded-lg col-span-2">
                          <p className="text-sm text-zinc-400 mb-1">Admin Notes</p>
                          <p className="text-white text-sm">{selectedWithdrawal.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Process Withdrawal Form */}
                    {(selectedWithdrawal.status === "pending" || selectedWithdrawal.status === "processing") && (
                      <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold text-white">Process Withdrawal</h3>

                        {selectedWithdrawal.status === "pending" && (
                          <Button
                            onClick={() => handleSetProcessing(selectedWithdrawal.id)}
                            variant="outline"
                            className="w-full"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Processing
                          </Button>
                        )}

                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-zinc-400 mb-1 block">
                              Stellar Transaction Hash (for completion)
                            </label>
                            <Input
                              type="text"
                              placeholder="Optional"
                              value={transactionHash}
                              onChange={(e) => setTransactionHash(e.target.value)}
                              className="bg-zinc-900 border-zinc-800 text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-zinc-400 mb-1 block">Admin Notes (optional)</label>
                            <Input
                              type="text"
                              placeholder="Add any notes..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="bg-zinc-900 border-zinc-800 text-white"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleProcessWithdrawal("completed")}
                              disabled={isProcessing}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {isProcessing ? "Processing..." : "Complete Withdrawal"}
                            </Button>
                            <Button
                              onClick={() => handleProcessWithdrawal("rejected")}
                              disabled={isProcessing}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-64">
                    <p className="text-zinc-500">Select a withdrawal request to view details</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Contact Form Submissions</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSubmissions}
                className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {submissions.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                <Mail className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No submissions yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <Card key={sub.id} className="bg-zinc-900 border-zinc-800 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white">{sub.band_name}</span>
                          <Badge
                            className={
                              sub.status === "new"
                                ? "bg-green-600 text-white"
                                : sub.status === "contacted"
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-600 text-white"
                            }
                          >
                            {sub.status}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            {new Date(sub.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>{sub.name}</span>
                          <a
                            href={`mailto:${sub.email}`}
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                          >
                            {sub.email}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-300 capitalize">
                            {sub.service_type === "epk"
                              ? "EPK"
                              : sub.service_type === "website"
                                ? "Website"
                                : sub.service_type === "both"
                                  ? "EPK + Website"
                                  : "Not sure"}
                          </Badge>
                        </div>

                        {sub.message && (
                          <p className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3">{sub.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {sub.status !== "contacted" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSubmissionStatus(sub.id, "contacted")}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            Mark Contacted
                          </Button>
                        )}
                        {sub.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubmissionStatus(sub.id, "closed")}
                            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent text-xs"
                          >
                            Close
                          </Button>
                        )}
                        {sub.status === "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubmissionStatus(sub.id, "new")}
                            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent text-xs"
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
