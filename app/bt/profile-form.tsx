"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createProfile, updateProfile } from "./bt-actions"
import { useToast } from "@/hooks/use-toast"

const INSTRUMENTS = [
  "Vocals",
  "Guitar",
  "Bass",
  "Drums",
  "Keyboard",
  "Piano",
  "Saxophone",
  "Trumpet",
  "Violin",
  "DJ",
  "Producer",
  "Other",
]

const GENRES = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "Country",
  "R&B",
  "Metal",
  "Indie",
  "Folk",
  "Blues",
]

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"]

const LOOKING_FOR = ["Band Members", "Collaborators", "Jam Sessions", "Gigs", "Recording Projects", "Networking"]

export function ProfileForm({ profile, onSuccess }: { profile?: any; onSuccess?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [musicianName, setMusicianName] = useState(profile?.musician_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(profile?.instruments || [])
  const [selectedGenres, setSelectedGenres] = useState<string[]>(profile?.genres || [])
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [spotifyUrl, setSpotifyUrl] = useState(profile?.spotify_url || "")
  const [soundcloudUrl, setSoundcloudUrl] = useState(profile?.soundcloud_url || "")
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || "")
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(profile?.looking_for || [])
  const [isAvailable, setIsAvailable] = useState(profile?.is_available ?? true)

  const toggleItem = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item))
    } else {
      setter([...list, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Profile form submission started")
    console.log("[v0] Form data:", {
      musicianName,
      bio,
      selectedInstruments,
      selectedGenres,
      experienceLevel,
      location,
      spotifyUrl,
      soundcloudUrl,
      instagramUrl,
      selectedLookingFor,
      isAvailable,
    })

    if (!musicianName || selectedInstruments.length === 0 || selectedGenres.length === 0 || !experienceLevel) {
      console.log("[v0] Validation failed - missing required fields")
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Validation passed, preparing to submit")
    setLoading(true)

    const formData = {
      musicianName,
      bio,
      instruments: selectedInstruments,
      genres: selectedGenres,
      experienceLevel,
      location,
      spotifyUrl,
      soundcloudUrl,
      instagramUrl,
      lookingFor: selectedLookingFor,
      isAvailable,
    }

    console.log("[v0] Calling server action:", profile ? "updateProfile" : "createProfile")
    const result = profile ? await updateProfile(formData) : await createProfile(formData)

    console.log("[v0] Server action result:", result)
    setLoading(false)

    if (result.success) {
      console.log("[v0] Profile saved successfully")
      toast({
        title: profile ? "Profile Updated" : "Profile Created",
        description: profile
          ? "Your profile has been updated successfully"
          : "Your profile has been created successfully",
      })
      onSuccess?.()
    } else {
      console.log("[v0] Profile save failed:", result.error)
      toast({
        title: "Error",
        description: result.error || "Failed to save profile",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="musicianName">Musician Name *</Label>
        <Input
          id="musicianName"
          value={musicianName}
          onChange={(e) => setMusicianName(e.target.value)}
          placeholder="Your stage name or musician name"
          required
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself and your musical journey..."
          rows={4}
        />
      </div>

      <div>
        <Label>Instruments *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {INSTRUMENTS.map((instrument) => (
            <Badge
              key={instrument}
              variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem(instrument, selectedInstruments, setSelectedInstruments)}
            >
              {instrument}
              {selectedInstruments.includes(instrument) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Genres *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {GENRES.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem(genre, selectedGenres, setSelectedGenres)}
            >
              {genre}
              {selectedGenres.includes(genre) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Experience Level *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <Badge
              key={level}
              variant={experienceLevel === level ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setExperienceLevel(level)}
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
      </div>

      <div>
        <Label>Looking For</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {LOOKING_FOR.map((item) => (
            <Badge
              key={item}
              variant={selectedLookingFor.includes(item) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem(item, selectedLookingFor, setSelectedLookingFor)}
            >
              {item}
              {selectedLookingFor.includes(item) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Social Links</Label>
        <Input value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Spotify URL" />
        <Input value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} placeholder="SoundCloud URL" />
        <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram URL" />
      </div>

      {profile && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAvailable"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="isAvailable" className="cursor-pointer">
            Available for collaborations
          </Label>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
      </Button>
    </form>
  )
}
