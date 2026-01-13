"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, MapPin, ExternalLink, Search, Users } from "lucide-react"
import Link from "next/link"
import { BandForm } from "../band-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function BrowseProfiles({ initialProfiles }: { initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null)
  const [showBandForm, setShowBandForm] = useState(false)

  // Extract unique genres and instruments
  const allGenres = [...new Set(profiles.flatMap((p) => p.genres || []))].sort()
  const allInstruments = [...new Set(profiles.flatMap((p) => p.instruments || []))].sort()

  // Filter profiles
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      !searchTerm ||
      profile.musician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGenre = !selectedGenre || profile.genres?.includes(selectedGenre)
    const matchesInstrument = !selectedInstrument || profile.instruments?.includes(selectedInstrument)

    return matchesSearch && matchesGenre && matchesInstrument
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Discover Musicians
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find talented musicians to collaborate with and build your dream band
        </p>
        {/* Create Band Button */}
        <Dialog open={showBandForm} onOpenChange={setShowBandForm}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Create a Band
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Your Band</DialogTitle>
              <DialogDescription>
                Form a new band and invite musicians to join. You'll be able to manage members and invite collaborators.
              </DialogDescription>
            </DialogHeader>
            <BandForm onSuccess={() => setShowBandForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your search to find the perfect collaborators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <div className="text-sm font-medium mb-2">Genres</div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedGenre === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedGenre(null)}
              >
                All
              </Badge>
              {allGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Instrument Filter */}
          <div>
            <div className="text-sm font-medium mb-2">Instruments</div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedInstrument === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedInstrument(null)}
              >
                All
              </Badge>
              {allInstruments.map((instrument) => (
                <Badge
                  key={instrument}
                  variant={selectedInstrument === instrument ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedInstrument(instrument)}
                >
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? "musician" : "musicians"}
        </div>

        {filteredProfiles.length === 0 ? (
          <Card className="border-amber-500/30">
            <CardContent className="py-12 text-center text-muted-foreground">
              No musicians found matching your criteria. Try adjusting your filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="border-amber-500/30 hover:border-amber-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">{profile.musician_name}</CardTitle>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bio Preview */}
                  {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>}

                  {/* Instruments */}
                  <div>
                    <div className="text-xs font-semibold mb-1">Instruments</div>
                    <div className="flex flex-wrap gap-1">
                      {profile.instruments?.slice(0, 3).map((instrument: string) => (
                        <Badge key={instrument} variant="secondary" className="text-xs bg-amber-500/20">
                          <Music className="w-3 h-3 mr-1" />
                          {instrument}
                        </Badge>
                      ))}
                      {profile.instruments?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{profile.instruments.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <div className="text-xs font-semibold mb-1">Genres</div>
                    <div className="flex flex-wrap gap-1">
                      {profile.genres?.slice(0, 3).map((genre: string) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {profile.genres?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.genres.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <Badge className="text-xs">{profile.experience_level}</Badge>

                  {/* View Profile Button */}
                  <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <Link href={`/bt/profile/${profile.id}`}>
                      View Full Profile
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
