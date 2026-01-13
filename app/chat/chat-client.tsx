"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, Search, User, ArrowLeft } from "lucide-react"
import { getMyRooms, getRoomMessages, sendMessage, searchUsers, getOrCreateDirectRoom } from "./chat-actions"

interface Room {
  id: number
  last_message: string
  other_wallet: string
  unread_count: number
  last_message_at: string
}

interface Message {
  id: number
  sender_wallet: string
  message: string
  created_at: string
  isMine: boolean
}

interface SearchUser {
  stellar_address: string
  display_name: string
}

export default function ChatClient() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load rooms
  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  // Load messages when room selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom)
      const interval = setInterval(() => loadMessages(selectedRoom), 3000) // Poll every 3s
      return () => clearInterval(interval)
    }
  }, [selectedRoom])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Search users
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  async function loadRooms() {
    const data = await getMyRooms()
    setRooms(data)
  }

  async function loadMessages(roomId: number) {
    const data = await getRoomMessages(roomId)
    setMessages(data)
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedRoom) return

    await sendMessage(selectedRoom, newMessage.trim())
    setNewMessage("")
    loadMessages(selectedRoom)
    loadRooms()
  }

  async function startChatWithUser(walletAddress: string) {
    const result = await getOrCreateDirectRoom(walletAddress)
    if (result.success && result.roomId) {
      setSelectedRoom(result.roomId)
      setIsSearching(false)
      setSearchQuery("")
      setSearchResults([])
      loadRooms()
    }
  }

  const currentRoom = rooms.find((r) => r.id === selectedRoom)

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Rooms List */}
      <div
        className={`${selectedRoom ? "hidden md:block" : "block"} w-full md:w-80 border-r border-white/10 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearching(true)
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Search Results or Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {isSearching && searchResults.length > 0 ? (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm text-white/60">Search Results</span>
                <button onClick={() => setIsSearching(false)} className="text-xs text-blue-400 hover:text-blue-300">
                  Show Chats
                </button>
              </div>
              {searchResults.map((user) => (
                <button
                  key={user.stellar_address}
                  onClick={() => startChatWithUser(user.stellar_address)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {user.display_name || `${user.stellar_address.slice(0, 8)}...`}
                    </div>
                    <div className="text-xs text-white/40 truncate">{user.stellar_address}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Search for users to start chatting</p>
            </div>
          ) : (
            <div className="p-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    selectedRoom === room.id ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-white font-medium truncate">
                        {room.other_wallet?.slice(0, 8)}...{room.other_wallet?.slice(-4)}
                      </div>
                      {room.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/60 truncate">{room.last_message || "No messages yet"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <button onClick={() => setSelectedRoom(null)} className="md:hidden text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-medium">
                {currentRoom?.other_wallet?.slice(0, 8)}...{currentRoom?.other_wallet?.slice(-4)}
              </div>
              <div className="text-xs text-white/40">Stellar Wallet</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.isMine ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" : "bg-white/10 text-white"
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.isMine ? "text-white/70" : "text-white/40"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-white/40">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Select a conversation or search for users</p>
          </div>
        </div>
      )}
    </div>
  )
}
