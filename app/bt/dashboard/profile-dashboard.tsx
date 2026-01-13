"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Music, MapPin, Calendar, ExternalLink, Edit } from "lucide-react"
import { ProfileForm } from "../profile-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProfileDashboard({ initialProfile }: { initialProfile: any }) {
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(!initialProfile)

  const handleSuccess = () => {
    setIsEditing(false)
    window.location.reload()
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Create Your Musician Profile
            </CardTitle>
            <CardDescription>
              Set up your profile to connect with other musicians and start collaborating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{profile.musician_name}</CardTitle>
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Instruments */}
          <div>
            <h3 className="font-semibold mb-2">Instruments</h3>
            <div className="flex flex-wrap gap-2">
              {profile.instruments?.map((instrument: string) => (
                <Badge
                  key={instrument}
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-700 dark:text-amber-300"
                >
                  <Music className="w-3 h-3 mr-1" />
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {profile.genres?.map((genre: string) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h3 className="font-semibold mb-2">Experience Level</h3>
            <Badge>{profile.experience_level}</Badge>
          </div>

          {/* Looking For */}
          {profile.looking_for && profile.looking_for.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {profile.looking_for.map((item: string) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.spotify_url || profile.soundcloud_url || profile.instagram_url) && (
            <div>
              <h3 className="font-semibold mb-2">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {profile.spotify_url && (
                  <a
                    href={profile.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Spotify
                  </a>
                )}
                {profile.soundcloud_url && (
                  <a
                    href={profile.soundcloud_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                    SoundCloud
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Availability Status */}
          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <Badge variant={profile.is_available ? "default" : "secondary"}>
              {profile.is_available ? "Available for Collaborations" : "Not Currently Available"}
            </Badge>
          </div>

          {/* Member Since */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileForm profile={profile} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
