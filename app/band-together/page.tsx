import { Suspense } from "react"
import BandTogetherClient from "./band-together-client"
import { getMyProfile, getGreenRoomMusicians } from "./band-together-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function BandTogetherPage() {
  const profileResult = await getMyProfile()

  if (!profileResult.success || profileResult.error === "Not authenticated") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to sign in with your wallet or email to access Band Together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Band Together connects musicians who are ready to collaborate and perform. Sign in to create your musician
              profile and join the Green Room.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const greenRoomResult = await getGreenRoomMusicians()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BandTogetherClient
        initialProfile={profileResult.profile}
        initialGreenRoomMusicians={greenRoomResult.musicians || []}
      />
    </Suspense>
  )
}
