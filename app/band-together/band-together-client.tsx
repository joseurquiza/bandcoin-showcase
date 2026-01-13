"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, Music, MapPin, Clock, Radio, Plus, X } from "lucide-react"
import { toggleGreenRoom, getGreenRoomMusicians, createOrUpdateProfile } from "./band-together-actions"

interface Musician {
  id: number
  musician_name: string
  avatar_url: string | null
  instruments: string[]
  genres: string[]
  location: string
  bio: string
  experience_level: string
  spotify_url: string | null
  instagram_url: string | null
  soundcloud_url: string | null
  updated_at: string
}

export default function BandTogetherClient({
  initialProfile,
  initialGreenRoomMusicians,
}: {
  initialProfile: any
  initialGreenRoomMusicians: Musician[]
}) {
  const [inGreenRoom, setInGreenRoom] = useState(initialProfile?.is_available || false)
  const [greenRoomMusicians, setGreenRoomMusicians] = useState<Musician[]>(initialGreenRoomMusicians)
  const [loading, setLoading] = useState(false)

  const [showProfileForm, setShowProfileForm] = useState(!initialProfile)
  const [formData, setFormData] = useState({
    musician_name: initialProfile?.musician_name || "",
    instruments: initialProfile?.instruments || [],
    genres: initialProfile?.genres || [],
    location: initialProfile?.location || "",
    bio: initialProfile?.bio || "",
    experience_level: initialProfile?.experience_level || "intermediate",
    avatar_url: initialProfile?.avatar_url || "",
    spotify_url: initialProfile?.spotify_url || "",
    instagram_url: initialProfile?.instagram_url || "",
    soundcloud_url: initialProfile?.soundcloud_url || "",
  })
  const [newInstrument, setNewInstrument] = useState("")
  const [newGenre, setNewGenre] = useState("")

  const handleToggleGreenRoom = async () => {
    setLoading(true)
    const newStatus = !inGreenRoom
    const result = await toggleGreenRoom(newStatus)

    if (result.success) {
      setInGreenRoom(newStatus)
      // Refresh green room list
      const musiciansResult = await getGreenRoomMusicians()
      if (musiciansResult.success) {
        setGreenRoomMusicians(musiciansResult.musicians as Musician[])
      }
    }
    setLoading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted, starting profile save")
    console.log("[v0] Form data:", formData)

    setLoading(true)

    console.log("[v0] Calling createOrUpdateProfile action")
    const result = await createOrUpdateProfile(formData)
    console.log("[v0] Profile save result:", result)

    if (result.success) {
      console.log("[v0] Profile saved successfully, reloading page")
      setShowProfileForm(false)
      window.location.reload() // Refresh to show updated profile
    } else {
      console.error("[v0] Failed to save profile:", result.error)
      alert(`Failed to save profile: ${result.error || "Please try again."}`)
    }

    setLoading(false)
  }

  const addInstrument = () => {
    if (newInstrument.trim() && !formData.instruments.includes(newInstrument.trim())) {
      setFormData({ ...formData, instruments: [...formData.instruments, newInstrument.trim()] })
      setNewInstrument("")
    }
  }

  const removeInstrument = (instrument: string) => {
    setFormData({ ...formData, instruments: formData.instruments.filter((i) => i !== instrument) })
  }

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData({ ...formData, genres: [...formData.genres, newGenre.trim()] })
      setNewGenre("")
    }
  }

  const removeGenre = (genre: string) => {
    setFormData({ ...formData, genres: formData.genres.filter((g) => g !== genre) })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {showProfileForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Musician Profile</CardTitle>
            <CardDescription>Set up your profile to connect with other musicians</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="musician_name">Musician Name *</Label>
                <Input
                  id="musician_name"
                  value={formData.musician_name}
                  onChange={(e) => setFormData({ ...formData, musician_name: e.target.value })}
                  placeholder="Your stage name or band name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Instruments *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInstrument}
                    onChange={(e) => setNewInstrument(e.target.value)}
                    placeholder="Add an instrument"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstrument())}
                  />
                  <Button type="button" onClick={addInstrument} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.instruments.map((instrument, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {instrument}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeInstrument(instrument)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Genres *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Add a genre"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                  />
                  <Button type="button" onClick={addGenre} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.genres.map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      {genre}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State or Region"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level *</Label>
                <select
                  id="experience_level"
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your music"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="spotify_url">Spotify URL</Label>
                  <Input
                    id="spotify_url"
                    value={formData.spotify_url}
                    onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soundcloud_url">SoundCloud URL</Label>
                  <Input
                    id="soundcloud_url"
                    value={formData.soundcloud_url}
                    onChange={(e) => setFormData({ ...formData, soundcloud_url: e.target.value })}
                    placeholder="https://soundcloud.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : initialProfile ? "Update Profile" : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Green Room Status Card */}
      {initialProfile && !showProfileForm && (
        <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="h-8 w-8 text-green-500" />
                  {inGreenRoom && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle>Green Room Status</CardTitle>
                  <CardDescription>
                    {inGreenRoom ? "You're live and available for gigs!" : "Not currently available for gigs"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowProfileForm(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
                <Button
                  onClick={handleToggleGreenRoom}
                  disabled={loading}
                  variant={inGreenRoom ? "destructive" : "default"}
                  className={inGreenRoom ? "" : "bg-green-600 hover:bg-green-700"}
                >
                  {loading ? "Updating..." : inGreenRoom ? "Leave Green Room" : "Enter Green Room"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Green Room Musicians */}
      {!showProfileForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle>The Green Room</CardTitle>
                <CardDescription>
                  Musicians ready for gigs right now • {greenRoomMusicians.length} available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {greenRoomMusicians.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No musicians in the Green Room</p>
                <p className="text-sm">Be the first to enter and show you're ready to perform!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {greenRoomMusicians.map((musician) => (
                  <Card key={musician.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-green-600">LIVE</span>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={musician.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(musician.musician_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{musician.musician_name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(musician.updated_at)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{musician.location}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <Music className="h-3 w-3" />
                          Instruments
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {musician.instruments.map((instrument, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium">Genres</div>
                        <div className="flex flex-wrap gap-1">
                          {musician.genres.map((genre, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {musician.bio && <p className="text-sm text-muted-foreground line-clamp-2">{musician.bio}</p>}

                      <div className="flex gap-2 pt-2">
                        {musician.spotify_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={musician.spotify_url} target="_blank" rel="noopener noreferrer">
                              Spotify
                            </a>
                          </Button>
                        )}
                        {musician.instagram_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={musician.instagram_url} target="_blank" rel="noopener noreferrer">
                              Instagram
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
