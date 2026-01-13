import { getAllProfiles } from "../bt-actions"
import { BrowseProfiles } from "./browse-profiles"

export const metadata = {
  title: "Browse Musicians | Band Together Beta",
  description: "Discover talented musicians and find your perfect collaborators",
}

export default async function BrowsePage() {
  const profiles = await getAllProfiles({ availableOnly: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <BrowseProfiles initialProfiles={profiles} />
      </div>
    </div>
  )
}
