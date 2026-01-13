"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Music,
  MapPin,
  Calendar,
  Radio,
  ExternalLink,
  Edit,
  Star,
  Play,
  Instagram,
  Music2,
  Users,
  Plus,
  Check,
  X,
  Edit2,
} from "lucide-react"
import { ProfileForm } from "../profile-form"
import { BandForm } from "../band-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  toggleAvailability,
  getMyBands,
  getPendingInvitations,
  respondToInvitation,
  getBandMembers,
} from "../bt-actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UnifiedDashboard({
  profile: initialProfile,
  initialAvailableProfiles = [],
  onProfileCreated,
}: {
  profile: any
  initialAvailableProfiles?: any[]
  onProfileCreated?: () => void
}) {
  useEffect(() => {
    console.log("[v0] BT Dashboard mounted")
    console.log("[v0] Initial profile received:", initialProfile)
    console.log("[v0] Profile is null?", initialProfile === null)
    console.log("[v0] Profile is undefined?", initialProfile === undefined)
    if (initialProfile) {
      console.log("[v0] Profile ID:", initialProfile.id)
      console.log("[v0] Profile wallet:", initialProfile.stellar_address)
      console.log("[v0] Profile musician name:", initialProfile.musician_name)
    }
  }, [initialProfile])

  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const [myBands, setMyBands] = useState<any[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [isCreatingBand, setIsCreatingBand] = useState(false)
  const [editingBand, setEditingBand] = useState<any>(null)
  const [selectedBand, setSelectedBand] = useState<any>(null)
  const [bandMembers, setBandMembers] = useState<any[]>([])
  const [loadingBands, setLoadingBands] = useState(false)

  useEffect(() => {
    if (profile) {
      loadBandsAndInvitations()
    }
  }, [profile])

  const loadBandsAndInvitations = async () => {
    setLoadingBands(true)
    const [bands, invitations] = await Promise.all([getMyBands(), getPendingInvitations()])
    setMyBands(bands)
    setPendingInvitations(invitations)
    setLoadingBands(false)
  }

  const handleBandCreated = () => {
    setIsCreatingBand(false)
    setEditingBand(null)
    loadBandsAndInvitations()
  }

  const handleInvitationResponse = async (bandId: number, accept: boolean) => {
    const result = await respondToInvitation(bandId, accept)
    if (result.success) {
      loadBandsAndInvitations()
    }
  }

  const loadBandMembers = async (bandId: number) => {
    const members = await getBandMembers(bandId)
    setBandMembers(members)
  }

  const handleSuccess = (updatedProfile: any) => {
    setIsEditing(false)
    setProfile(updatedProfile)
    if (onProfileCreated) {
      onProfileCreated()
    }
  }

  const handleToggleAvailability = async () => {
    setIsTogglingAvailability(true)
    const result = await toggleAvailability()
    if (result.success) {
      setProfile({ ...profile, is_available: result.isAvailable })
    }
    setIsTogglingAvailability(false)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-3xl">Create Your Musician Profile</CardTitle>
              <CardDescription className="text-base">Join the Band Together community</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-6 h-full flex items-end pb-8">
          <div className="flex items-end gap-6 relative z-10">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                {profile.musician_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h1 className="text-5xl font-bold text-foreground mb-2">{profile.musician_name}</h1>
              <p className="text-muted-foreground text-lg">{profile.instruments?.join(" • ") || "Musician"}</p>
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold">{myBands.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Bands</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Plays</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Shows</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile.is_available && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                  <Radio className="w-3 h-3 mr-1.5" />
                  Available Now
                </Badge>
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleToggleAvailability}
                disabled={isTogglingAvailability}
                variant={profile.is_available ? "destructive" : "default"}
                size="sm"
              >
                {profile.is_available ? "Leave Green Room" : "Enter Green Room"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Left Column - Main Content */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card/50 backdrop-blur border border-border">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="bands">
                  Bands
                  {pendingInvitations.length > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{pendingInvitations.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                {profile.bio && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Biography</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Instruments & Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.instruments?.map((instrument: string) => (
                        <div
                          key={instrument}
                          className="flex items-center gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                        >
                          <Music2 className="w-5 h-5 text-primary" />
                          <span className="font-medium">{instrument}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Genres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.genres?.map((genre: string) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="bg-secondary text-secondary-foreground px-3 py-1"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bands" className="space-y-6">
                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <Card className="border-border bg-card border-primary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Pending Invitations
                      </CardTitle>
                      <CardDescription>You've been invited to join these bands</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pendingInvitations.map((band: any) => (
                        <div key={band.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <h3 className="font-semibold">{band.band_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Role: {band.role} {band.instrument && `• ${band.instrument}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleInvitationResponse(band.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleInvitationResponse(band.id, false)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* My Bands */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          My Bands
                        </CardTitle>
                        <CardDescription>Bands you're a member of</CardDescription>
                      </div>
                      <Button onClick={() => setIsCreatingBand(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Band
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingBands ? (
                      <div className="text-center py-8 text-muted-foreground">Loading bands...</div>
                    ) : myBands.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">You're not in any bands yet</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create your first band and start collaborating
                        </p>
                        <Button onClick={() => setIsCreatingBand(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Band
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {myBands.map((band: any) => (
                          <Card key={band.id} className="border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-xl">{band.band_name}</CardTitle>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{band.role}</Badge>
                                    {band.status === "active" && (
                                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                                    )}
                                  </div>
                                </div>
                                {band.role === "Leader" && (
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log("[v0] Opening edit dialog for band:", band)
                                      setEditingBand(band)
                                      setIsCreatingBand(true)
                                    }}
                                    className="border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-500"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Band
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedBand(band)
                                loadBandMembers(band.id)
                              }}
                            >
                              {band.bio && <p className="text-sm text-muted-foreground mb-3">{band.bio}</p>}
                              <div className="flex flex-wrap gap-2">
                                {band.genres?.map((genre: string) => (
                                  <Badge key={genre} variant="secondary" className="text-xs">
                                    {genre}
                                  </Badge>
                                ))}
                              </div>
                              {band.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                                  <MapPin className="w-4 h-4" />
                                  {band.location}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Media Gallery</CardTitle>
                    <CardDescription>Tracks, videos, and photos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Play className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No media uploaded yet</p>
                      <p className="text-sm text-muted-foreground">Share your music and videos with the community</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Reviews & Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Star className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Upcoming Shows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No shows scheduled</p>
                      <p className="text-sm text-muted-foreground">Your upcoming gigs will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Experience Badge */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm">Experience Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary text-primary-foreground px-3 py-1.5">{profile.experience_level}</Badge>
              </CardContent>
            </Card>

            {/* Looking For */}
            {profile.looking_for && profile.looking_for.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm">Looking For</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.looking_for.map((item: string) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {(profile.spotify_url || profile.soundcloud_url || profile.instagram_url) && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm">Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.spotify_url && (
                    <a
                      href={profile.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Music className="w-4 h-4" />
                      <span>Spotify</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {profile.soundcloud_url && (
                    <a
                      href={profile.soundcloud_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Music className="w-4 h-4" />
                      <span>SoundCloud</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Green Room */}
            {/* Placeholder for Green Room content */}
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <ProfileForm profile={profile} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>

        {/* Create/Edit Band Dialog */}
        <Dialog open={isCreatingBand} onOpenChange={setIsCreatingBand}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-purple-400">{editingBand ? "Edit Band" : "Create Band"}</DialogTitle>
            </DialogHeader>
            <BandForm
              onSuccess={handleBandCreated}
              editBand={
                editingBand
                  ? {
                      id: editingBand.id,
                      band_name: editingBand.band_name,
                      bio: editingBand.bio,
                      genres: editingBand.genres,
                      location: editingBand.location,
                      spotify_url: editingBand.spotify_url,
                      soundcloud_url: editingBand.soundcloud_url,
                      instagram_url: editingBand.instagram_url,
                      looking_for_members: editingBand.looking_for_members,
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>

        {/* Band Details Dialog */}
        <Dialog open={!!selectedBand} onOpenChange={() => setSelectedBand(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedBand?.band_name}</DialogTitle>
                {selectedBand?.role === "Leader" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingBand(selectedBand)
                      setSelectedBand(null)
                      setIsCreatingBand(true)
                    }}
                    className="border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-500"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Band
                  </Button>
                )}
              </div>
            </DialogHeader>
            {selectedBand && (
              <div className="space-y-6">
                {selectedBand.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{selectedBand.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Band Members</h3>
                  <div className="space-y-3">
                    {bandMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Avatar>
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {member.musician_name?.charAt(0) || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{member.musician_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role} {member.instrument && `• ${member.instrument}`}
                          </div>
                        </div>
                        <Badge variant={member.status === "accepted" ? "default" : "secondary"}>{member.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBand.looking_for_members && selectedBand.looking_for_members.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Looking for</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBand.looking_for_members.map((role: string) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
