export const dynamic = "force-dynamic"

import ChatClient from "./chat-client"

export const metadata = {
  title: "Chat - BandCoin ShowCase",
  description: "Message other users in the BandCoin community",
}

export default function ChatPage() {
  return <ChatClient />
}
