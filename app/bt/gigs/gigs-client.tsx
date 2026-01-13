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
import { Plus, Calendar, MapPin, DollarSign, Music2 } from "lucide-react"
import { postGig, browseGigs } from "./gig-actions"
import { toast } from "sonner"

export function GigsClient() {
  const [gigs, setGigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPostDialog, setShowPostDialog] = useState(false)

  useEffect(() => {
    loadGigs()
  }, [])

  const loadGigs = async () => {
    setIsLoading(true)
    const data = await browseGigs()
    setGigs(data)
    setIsLoading(false)
  }

  const handlePostGig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await postGig({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      compensation: formData.get("compensation") as string,
      required_instruments: (formData.get("instruments") as string).split(",").map((i) => i.trim()),
      genres: (formData.get("genres") as string).split(",").map((g) => g.trim()),
    })

    if (result.success) {
      toast.success("Gig posted successfully!")
      setShowPostDialog(false)
      loadGigs()
    } else {
      toast.error(result.error || "Failed to post gig")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gig Board</h1>
            <p className="text-zinc-400">Find or post music gigs</p>
          </div>
          <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Gig
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post New Gig</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostGig} className="space-y-4">
                <div>
                  <Label htmlFor="title">Gig Title</Label>
                  <Input id="title" name="title" required className="bg-zinc-800 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    className="bg-zinc-800 border-white/10"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required className="bg-zinc-800 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      required
                      className="bg-zinc-800 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="compensation">Compensation</Label>
                  <Input
                    id="compensation"
                    name="compensation"
                    placeholder="$500, Paid"
                    required
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="instruments">Required Instruments (comma separated)</Label>
                  <Input
                    id="instruments"
                    name="instruments"
                    placeholder="Guitar, Drums"
                    required
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="genres">Genres (comma separated)</Label>
                  <Input
                    id="genres"
                    name="genres"
                    placeholder="Rock, Jazz"
                    required
                    className="bg-zinc-800 border-white/10"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                  Post Gig
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-zinc-400 py-12">Loading gigs...</div>
        ) : gigs.length === 0 ? (
          <Card className="bg-zinc-900/50 border-white/10 p-12 text-center">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No gigs available</h3>
            <p className="text-zinc-400 mb-6">Be the first to post a gig opportunity</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <Card
                key={gig.id}
                className="bg-zinc-900/50 border-white/10 p-6 hover:border-amber-500/50 transition-colors"
              >
                <h3 className="text-xl font-bold text-white mb-2">{gig.title}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{gig.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(gig.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    {gig.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <DollarSign className="w-4 h-4" />
                    {gig.compensation}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gig.required_instruments?.slice(0, 3).map((instrument: string) => (
                    <Badge
                      key={instrument}
                      variant="secondary"
                      className="bg-amber-500/20 text-amber-400 border-amber-500/30"
                    >
                      {instrument}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-4">Posted by {gig.posted_by_name}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
