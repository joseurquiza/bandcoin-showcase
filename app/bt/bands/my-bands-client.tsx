"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Music } from "lucide-react"
import { createBand, getMyBands } from "./band-actions"
import { toast } from "sonner"

export function MyBandsClient() {
  const [bands, setBands] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadBands()
  }, [])

  const loadBands = async () => {
    setIsLoading(true)
    const data = await getMyBands()
    setBands(data)
    setIsLoading(false)
  }

  const handleCreateBand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await createBand({
      band_name: formData.get("band_name") as string,
      bio: formData.get("bio") as string,
      genres: (formData.get("genres") as string).split(",").map((g) => g.trim()),
      location: formData.get("location") as string,
      looking_for_members: (formData.get("looking_for") as string).split(",").map((m) => m.trim()),
      spotify_url: formData.get("spotify_url") as string,
      soundcloud_url: formData.get("soundcloud_url") as string,
      instagram_url: formData.get("instagram_url") as string,
    })

    if (result.success) {
      toast.success("Band created successfully!")
      setShowCreateDialog(false)
      loadBands()
    } else {
      toast.error(result.error || "Failed to create band")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Bands</h1>
            <p className="text-zinc-400">Create and manage your musical groups</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Band
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Band</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBand} className="space-y-4">
                <div>
                  <Label htmlFor="band_name">Band Name</Label>
                  <Input id="band_name" name="band_name" required className="bg-zinc-800 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" required className="bg-zinc-800 border-white/10" rows={4} />
                </div>
                <div>
                  <Label htmlFor="genres">Genres (comma separated)</Label>
                  <Input
                    id="genres"
                    name="genres"
                    placeholder="Rock, Jazz, Blues"
                    required
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required className="bg-zinc-800 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="looking_for">Looking For (comma separated)</Label>
                  <Input
                    id="looking_for"
                    name="looking_for"
                    placeholder="Drummer, Bassist"
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="spotify_url">Spotify URL</Label>
                    <Input id="spotify_url" name="spotify_url" className="bg-zinc-800 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="soundcloud_url">SoundCloud URL</Label>
                    <Input id="soundcloud_url" name="soundcloud_url" className="bg-zinc-800 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input id="instagram_url" name="instagram_url" className="bg-zinc-800 border-white/10" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                  Create Band
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-zinc-400 py-12">Loading bands...</div>
        ) : bands.length === 0 ? (
          <Card className="bg-zinc-900/50 border-white/10 p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No bands yet</h3>
            <p className="text-zinc-400 mb-6">Create your first band to start collaborating with musicians</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Band
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bands.map((band) => (
              <Card
                key={band.id}
                className="bg-zinc-900/50 border-white/10 p-6 hover:border-amber-500/50 transition-colors"
              >
                <h3 className="text-xl font-bold text-white mb-2">{band.band_name}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{band.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {band.genres?.slice(0, 3).map((genre: string) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-amber-500/20 text-amber-400 border-amber-500/30"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {band.member_count || 0} members
                  </div>
                  <div>{band.location}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
