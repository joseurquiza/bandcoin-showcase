import type { Metadata } from "next"
import GigFinderClient from "./gig-finder-client"

export const metadata: Metadata = {
  title: "Gig Finder - Venue Discovery for Musicians",
  description:
    "Find venues, clubs, and booking contacts for your band. Analyzes similar artists to discover performance opportunities and connect you with promoters and bookers.",
  keywords: [
    "gig finder",
    "venue booking",
    "music venues",
    "band booking",
    "concert venues",
    "live music",
    "booking agent finder",
  ],
  openGraph: {
    title: "Gig Finder - Venue Discovery",
    description: "Discover venues and booking contacts based on similar artists in your genre",
    type: "website",
  },
}

export default function GigFinderPage() {
  return <GigFinderClient />
}
