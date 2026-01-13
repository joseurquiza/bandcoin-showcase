"use client"

import StudioSidebar from "@/components/studio-sidebar"
import SupportChatWidget from "@/components/support-chat-widget"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { RewardsTracker } from "@/components/rewards-tracker"
import { RewardsDisplay } from "@/components/rewards-display"
import { WalletConnect } from "@/components/wallet-connect-header"
import { Toaster } from "sonner"
import type React from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AnalyticsTracker />
      <RewardsTracker />
      <StudioSidebar />
      <div className="transition-all duration-300" style={{ paddingLeft: "var(--sidebar-width, 256px)" }}>
        <style jsx>{`
          @media (max-width: 1024px) {
            div {
              padding-left: 0 !important;
            }
          }
        `}</style>
        <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width,256px)] z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-end gap-3 px-4 lg:px-6 py-3">
            <RewardsDisplay />
            <WalletConnect />
          </div>
        </header>
        <div className="pt-16">{children}</div>
      </div>
      <SupportChatWidget />
      <Toaster position="top-right" theme="dark" richColors />
    </>
  )
}
