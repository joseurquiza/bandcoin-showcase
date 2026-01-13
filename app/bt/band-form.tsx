"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createBand, updateBand } from "./bt-actions"

const GENRE_OPTIONS = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Metal",
  "Electronic",
  "Hip-Hop",
  "Country",
  "Folk",
  "Classical",
  "R&B",
  "Indie",
]

const LOOKING_FOR_OPTIONS = [
  "Guitarist",
  "Bassist",
  "Drummer",
  "Vocalist",
  "Keyboardist",
  "DJ",
  "Producer",
  "Saxophonist",
  "Trumpeter",
  "Violinist",
]

export function BandForm({
  onSuccess,
  editBand,
}: {
  onSuccess: () => void
  editBand?: {
    id: number
    band_name: string
    bio?: string
    genres: string[]
    location?: string
    spotify_url?: string
    soundcloud_url?: string
    instagram_url?: string
    looking_for_members: string[]
  }
}) {
  const [bandName, setBandName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [lookingForMembers, setLookingForMembers] = useState<string[]>([])
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [soundcloudUrl, setSoundcloudUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editBand) {
      setBandName(editBand.band_name)
      setBio(editBand.bio || "")
      setLocation(editBand.location || "")
      setSelectedGenres(editBand.genres || [])
      setLookingForMembers(editBand.looking_for_members || [])
      setSpotifyUrl(editBand.spotify_url || "")
      setSoundcloudUrl(editBand.soundcloud_url || "")
      setInstagramUrl(editBand.instagram_url || "")
    }
  }, [editBand])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Band form submission started")

    if (!bandName.trim()) {
      console.log("[v0] Validation failed: Band name is required")
      setError("Band name is required")
      return
    }

    if (selectedGenres.length === 0) {
      console.log("[v0] Validation failed: No genres selected")
      setError("Select at least one genre")
      return
    }

    console.log("[v0] Validation passed, form data:", {
      bandName,
      genres: selectedGenres,
      location,
      lookingForMembers,
    })

    setSaving(true)
    setError("")

    const result = editBand
      ? await updateBand(editBand.id, {
          bandName,
          bio,
          genres: selectedGenres,
          location,
          spotifyUrl,
          soundcloudUrl,
          instagramUrl,
          lookingForMembers,
        })
      : await createBand({
          bandName,
          bio,
          genres: selectedGenres,
          location,
          spotifyUrl,
          soundcloudUrl,
          instagramUrl,
          lookingForMembers,
        })

    console.log(`[v0] ${editBand ? "updateBand" : "createBand"} result:`, result)

    setSaving(false)

    if (result.success) {
      console.log(`[v0] Band ${editBand ? "updated" : "created"} successfully:`, result.band)
      onSuccess()
    } else {
      console.log(`[v0] Band ${editBand ? "update" : "creation"} failed:`, result.error)
      setError(result.error || `Failed to ${editBand ? "update" : "create"} band`)
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-400">{editBand ? "Edit Band" : "Create Your Band"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bandName" className="text-purple-300">
              Band Name *
            </Label>
            <Input
              id="bandName"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="The Electric Dreams"
              className="bg-zinc-800/50 border-purple-500/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-purple-300">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your band..."
              className="bg-zinc-800/50 border-purple-500/30 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Genres *</Label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedGenres.includes(genre)
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-purple-500/30 hover:border-purple-500"
                  }`}
                  onClick={() => {
                    if (selectedGenres.includes(genre)) {
                      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
                    } else {
                      setSelectedGenres([...selectedGenres, genre])
                    }
                  }}
                >
                  {genre}
                  {selectedGenres.includes(genre) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Looking for Members</Label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((role) => (
                <Badge
                  key={role}
                  variant={lookingForMembers.includes(role) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    lookingForMembers.includes(role)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-purple-500/30 hover:border-purple-500"
                  }`}
                  onClick={() => {
                    if (lookingForMembers.includes(role)) {
                      setLookingForMembers(lookingForMembers.filter((r) => r !== role))
                    } else {
                      setLookingForMembers([...lookingForMembers, role])
                    }
                  }}
                >
                  {role}
                  {lookingForMembers.includes(role) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-purple-300">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Los Angeles, CA"
              className="bg-zinc-800/50 border-purple-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spotifyUrl" className="text-purple-300">
              Spotify URL
            </Label>
            <Input
              id="spotifyUrl"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="bg-zinc-800/50 border-purple-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soundcloudUrl" className="text-purple-300">
              SoundCloud URL
            </Label>
            <Input
              id="soundcloudUrl"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
              placeholder="https://soundcloud.com/..."
              className="bg-zinc-800/50 border-purple-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramUrl" className="text-purple-300">
              Instagram URL
            </Label>
            <Input
              id="instagramUrl"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="bg-zinc-800/50 border-purple-500/30 text-white"
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            {saving ? (editBand ? "Saving..." : "Creating Band...") : editBand ? "Save Changes" : "Create Band"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
