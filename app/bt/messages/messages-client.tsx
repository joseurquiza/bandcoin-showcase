"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Mail, MailOpen, Send } from "lucide-react"
import { getInbox, getSentMessages, markAsRead } from "./message-actions"

export function MessagesClient() {
  const [inbox, setInbox] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setIsLoading(true)
    const [inboxData, sentData] = await Promise.all([getInbox(), getSentMessages()])
    setInbox(inboxData)
    setSent(sentData)
    setIsLoading(false)
  }

  const handleMarkAsRead = async (messageId: number) => {
    await markAsRead(messageId)
    loadMessages()
  }

  const unreadCount = inbox.filter((m) => !m.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
          <p className="text-zinc-400">Connect with other musicians</p>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Mail className="w-4 h-4 mr-2" />
              Inbox
              {unreadCount > 0 && <Badge className="ml-2 bg-amber-500 text-black">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Send className="w-4 h-4 mr-2" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4 mt-6">
            {inbox.length === 0 ? (
              <Card className="bg-zinc-900/50 border-white/10 p-12 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
                <p className="text-zinc-400">Your inbox is empty</p>
              </Card>
            ) : (
              inbox.map((message) => (
                <Card
                  key={message.id}
                  className={`bg-zinc-900/50 border-white/10 p-6 cursor-pointer hover:border-amber-500/50 transition-colors ${
                    !message.is_read ? "border-amber-500/30" : ""
                  }`}
                  onClick={() => !message.is_read && handleMarkAsRead(message.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {message.is_read ? (
                        <MailOpen className="w-6 h-6 text-zinc-500" />
                      ) : (
                        <Mail className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                        <span className="text-sm text-zinc-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-amber-400 mb-2">From: {message.from_name}</p>
                      <p className="text-zinc-400">{message.message}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4 mt-6">
            {sent.length === 0 ? (
              <Card className="bg-zinc-900/50 border-white/10 p-12 text-center">
                <Send className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-xl font-semibold text-white mb-2">No sent messages</h3>
                <p className="text-zinc-400">Start connecting with musicians</p>
              </Card>
            ) : (
              sent.map((message) => (
                <Card key={message.id} className="bg-zinc-900/50 border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <Send className="w-6 h-6 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                        <span className="text-sm text-zinc-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-amber-400 mb-2">To: {message.to_name}</p>
                      <p className="text-zinc-400">{message.message}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
