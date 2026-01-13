"use server"

import { generateText } from "ai"
import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

interface ArtistInfo {
  name: string
  genre: string
  location: string
  description: string
  spotifyUrl?: string
  instagramUrl?: string
  monthlyListeners?: string
}

interface SimilarArtist {
  name: string
  genre: string
  similarity: string
  venues: string[]
}

interface Venue {
  name: string
  location: string
  capacity: string
  genres: string[]
  bookingContact?: {
    name?: string
    email?: string
    phone?: string
    website?: string
  }
  recentShows: string[]
  tips?: string
}

interface GigFinderResults {
  artist: ArtistInfo
  similarArtists: SimilarArtist[]
  venues: Venue[]
  bookingTips: string[]
}

export async function findGigsAction(
  artistName: string,
  location?: string,
): Promise<{ data?: GigFinderResults; error?: string; limitReached?: boolean; usage?: any; authRequired?: boolean }> {
  try {
    const auth = await checkUserAuthentication()
    if (!auth.isAuthenticated) {
      return {
        error: "Please connect your wallet or sign in to find gigs.",
        authRequired: true,
      }
    }

    const usageCheck = await checkAIUsage("gig-finder")
    if (!usageCheck.allowed) {
      return {
        error: `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} AI gig searches today. Try again tomorrow!`,
        limitReached: true,
        usage: usageCheck,
      }
    }

    const locationContext = location ? ` Focus on venues in or near ${location}.` : ""

    const prompt = `You are a music industry expert helping artists find gig opportunities. 
    
Research the artist/band "${artistName}" and provide comprehensive booking intelligence.${locationContext}

IMPORTANT: Only provide information about REAL, CURRENTLY OPERATING venues that you can verify exist. Do not make up or fabricate venue names, contacts, or information. If you cannot find enough real venues, return fewer results rather than inventing fake ones. When uncertain about contact details, omit them rather than guessing.

Return a JSON object with the following structure:
{
  "artist": {
    "name": "Artist name",
    "genre": "Primary genre",
    "location": "Artist's base location",
    "description": "Brief description of the artist's style and sound (2-3 sentences)",
    "spotifyUrl": "Spotify artist URL if known (omit if unknown)",
    "instagramUrl": "Instagram URL if known (omit if unknown)",
    "monthlyListeners": "Approximate monthly listeners if known (omit if unknown)"
  },
  "similarArtists": [
    {
      "name": "REAL similar artist name",
      "genre": "Their genre",
      "similarity": "High/Medium percentage match",
      "venues": ["REAL Venue 1", "REAL Venue 2"] (only list venues you're confident exist)
    }
  ],
  "venues": [
    {
      "name": "REAL venue name (must be an actual existing venue)",
      "location": "City, State/Country",
      "capacity": "Approximate range based on venue size",
      "genres": ["Genre 1", "Genre 2"],
      "bookingContact": {
        "name": "ONLY if you know the real booking manager name",
        "email": "ONLY real email if known (omit if uncertain)",
        "phone": "ONLY real phone if known (omit if uncertain)",
        "website": "ONLY real website if known"
      },
      "recentShows": ["Only list if you have real information about shows"],
      "tips": "Specific tip for approaching this venue based on real knowledge"
    }
  ],
  "bookingTips": [
    "Tip 1 specific to this artist and their market (based on real industry knowledge)",
    "Tip 2 about approaching venues",
    "Tip 3 about building relationships",
    "Tip 4 about timing and preparation",
    "Tip 5 about follow-up strategies"
  ]
}

Guidelines:
- ONLY include venues that actually exist - verify before including
- Include 3-8 similar artists (real artists only)
- Include 4-8 relevant REAL venues that book similar acts
- For booking contacts, ONLY include if you have real information - omit fields when uncertain
- If you cannot find specific contact info, suggest checking the venue's website
- Make venue recommendations specific to the artist's genre and draw size
- Include both established and emerging venue options when available
- Booking tips should be actionable and based on real industry practices
- Quality over quantity - better to have fewer real venues than more fake ones

Return ONLY the JSON object, no additional text.`

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      prompt,
      maxTokens: 4000,
    })

    await incrementAIUsage("gig-finder")

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { error: "Failed to parse AI response. Please try again." }
    }

    const data = JSON.parse(jsonMatch[0]) as GigFinderResults
    return { data }
  } catch (error) {
    console.error("[GigFinder] Error:", error)
    return { error: "Failed to find gigs. Please try again." }
  }
}
