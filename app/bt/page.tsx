import { Button } from "@/components/ui/button"
import { ArrowDown, Users, Music, Sparkles, Heart } from "lucide-react"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Band Together | BandCoin ShowCase",
  description: "Connect, Create, Collaborate. Your musician command center.",
}

export default function BandTogetherPage() {
  redirect("/bt/dashboard")

  // The rest of the code will not be executed due to the redirect
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Band Together
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance">
            Connect, Create, Collaborate. Your ultimate stage to find musicians, form bands, and amplify your musical
            journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              asChild
            >
              <a href="/bt/dashboard">Get Started</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-600/50 hover:border-amber-600 bg-transparent"
              asChild
            >
              <a href="/bt/browse">Browse Musicians</a>
            </Button>
          </div>
          <div className="pt-12 flex justify-center">
            <ArrowDown className="w-6 h-6 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Feature 1: Craft Your Identity */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Craft Your Musician Identity</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Build a stunning musician profile. Highlight your skills, instruments, preferred genres, and past
              experience to attract the perfect collaborators and bands.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-600/50 hover:border-amber-600 bg-transparent"
              asChild
            >
              <a href="/bt/dashboard">Create Your Profile</a>
            </Button>
          </div>
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Music className="w-24 h-24 text-amber-500/40" />
          </div>
        </div>
      </section>

      {/* Feature 2: Assemble Your Team */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center md:order-first">
            <Users className="w-24 h-24 text-orange-500/40" />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Assemble Your Dream Team</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Discover talented musicians or find existing bands to join. Manage your band's lineup, coordinate
              schedules, and prepare for electrifying performances together.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-orange-600/50 hover:border-orange-600 bg-transparent"
              asChild
            >
              <a href="/bt/browse">Explore Musicians</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature 3: Showcase Your Journey */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Showcase Your Musical Journey</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Keep your profile dynamic with your latest projects, new skills, and availability. A well-maintained
              profile opens doors to exciting gigs and collaborations.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-600/50 hover:border-amber-600 bg-transparent"
              asChild
            >
              <a href="/bt/dashboard">Manage Your Profile</a>
            </Button>
          </div>
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-24 h-24 text-amber-500/40" />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Band Together?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              We provide the tools and community to help your musical aspirations take flight.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Vast Network</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Connect with a diverse community of musicians, producers, and songwriters.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Creative Synergy</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Find the perfect collaborators to bring your unique musical visions to life.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Inspiration Hub</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Discover new genres, techniques, and get inspired by fellow artists.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Passion Driven</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                A platform built by musicians, for musicians, fostering a supportive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Join the Ensemble?</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Create your profile to start connecting with other musicians and unlock a world of musical possibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              asChild
            >
              <a href="/bt/dashboard">Create Profile</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-600/50 hover:border-amber-600 bg-transparent"
              asChild
            >
              <a href="/bt/browse">Browse Musicians</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
