"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle, Loader2, Music, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function OrderPage() {
  const searchParams = useSearchParams()
  const serviceType = searchParams.get("service") || "epk"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: serviceType,
    bandName: "",
    genre: "",
    description: "",
    budget: "",
    timeline: "",
    websiteUrl: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: "",
      spotify: "",
      other: "",
    },
    additionalInfo: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          socialMedia: JSON.stringify(formData.socialMedia),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit order")
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Failed to submit order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/bandcoin-logo.png"
                  alt="BandCoin Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="text-2xl font-bold text-white">BandCoin ShowCase</span>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-8">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-6">Order Submitted Successfully!</h1>
              <p className="text-xl text-gray-300 mb-8">
                Thank you for choosing BandCoin ShowCase! We've received your order and will get back to you within 24
                hours.
              </p>
              <div className="bg-white/10 border border-white/20 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• We'll review your requirements and contact you within 24 hours</li>
                  <li>• We'll discuss your project details and timeline</li>
                  <li>
                    • Once confirmed, we'll begin work on your {formData.serviceType === "epk" ? "EPK" : "website"}
                  </li>
                  <li>• You'll receive regular updates throughout the process</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/images/bandcoin-logo.png" alt="BandCoin Logo" width={40} height={40} className="h-10 w-10" />
              <span className="text-2xl font-bold text-white">BandCoin ShowCase</span>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Order Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Order Your {formData.serviceType === "epk" ? "EPK" : "Website"}
              </h1>
              <p className="text-xl text-gray-300">Fill out the form below and we'll get started on your project</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Service Info Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-white/10 border-white/20 sticky top-8">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      {formData.serviceType === "epk" ? (
                        <Music className="h-8 w-8 text-orange-400" />
                      ) : (
                        <Globe className="h-8 w-8 text-yellow-400" />
                      )}
                      <div>
                        <CardTitle className="text-white">
                          {formData.serviceType === "epk" ? "EPK Package" : "Website Package"}
                        </CardTitle>
                        <Badge className={formData.serviceType === "epk" ? "bg-orange-600" : "bg-yellow-600"}>
                          {formData.serviceType === "epk" ? "$100" : "$250"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70 mb-4">
                      {formData.serviceType === "epk"
                        ? "Professional digital EPK that makes booking and press outreach effortless"
                        : "Full-featured website with everything you need to connect with fans"}
                    </CardDescription>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {formData.serviceType === "epk" ? (
                        <>
                          <li>• Professional bio & photos</li>
                          <li>• Music samples & links</li>
                          <li>• Press coverage & reviews</li>
                          <li>• Contact information</li>
                          <li>• Social media integration</li>
                        </>
                      ) : (
                        <>
                          <li>• Tour dates & booking</li>
                          <li>• Music player & streaming</li>
                          <li>• Photo & video galleries</li>
                          <li>• Merchandise store</li>
                          <li>• Fan newsletter signup</li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Order Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Project Details</CardTitle>
                    <CardDescription className="text-white/70">
                      Tell us about your project so we can create something amazing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-white">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-white">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-white">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      {/* Project Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Project Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="serviceType" className="text-white">
                              Service Type *
                            </Label>
                            <Select
                              value={formData.serviceType}
                              onValueChange={(value) => handleInputChange("serviceType", value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="epk">EPK Package ($100)</SelectItem>
                                <SelectItem value="website">Website Package ($250)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="bandName" className="text-white">
                              Band/Artist Name *
                            </Label>
                            <Input
                              id="bandName"
                              type="text"
                              required
                              value={formData.bandName}
                              onChange={(e) => handleInputChange("bandName", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="Your band or artist name"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="genre" className="text-white">
                              Genre
                            </Label>
                            <Input
                              id="genre"
                              type="text"
                              value={formData.genre}
                              onChange={(e) => handleInputChange("genre", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="Rock, Pop, Hip-Hop, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeline" className="text-white">
                              Preferred Timeline
                            </Label>
                            <Select
                              value={formData.timeline}
                              onValueChange={(value) => handleInputChange("timeline", value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asap">ASAP (Rush - +$50)</SelectItem>
                                <SelectItem value="1-week">Within 1 week</SelectItem>
                                <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                                <SelectItem value="1-month">Within 1 month</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-white">
                            Project Description *
                          </Label>
                          <Textarea
                            id="description"
                            required
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                            placeholder="Tell us about your music, style, and what you're looking for..."
                          />
                        </div>
                      </div>

                      {/* Social Media Links */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Social Media & Links</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="instagram" className="text-white">
                              Instagram
                            </Label>
                            <Input
                              id="instagram"
                              type="url"
                              value={formData.socialMedia.instagram}
                              onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="https://instagram.com/yourband"
                            />
                          </div>
                          <div>
                            <Label htmlFor="facebook" className="text-white">
                              Facebook
                            </Label>
                            <Input
                              id="facebook"
                              type="url"
                              value={formData.socialMedia.facebook}
                              onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="https://facebook.com/yourband"
                            />
                          </div>
                          <div>
                            <Label htmlFor="spotify" className="text-white">
                              Spotify
                            </Label>
                            <Input
                              id="spotify"
                              type="url"
                              value={formData.socialMedia.spotify}
                              onChange={(e) => handleSocialMediaChange("spotify", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="https://open.spotify.com/artist/..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="youtube" className="text-white">
                              YouTube
                            </Label>
                            <Input
                              id="youtube"
                              type="url"
                              value={formData.socialMedia.youtube}
                              onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                              placeholder="https://youtube.com/yourband"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="websiteUrl" className="text-white">
                            Current Website (if any)
                          </Label>
                          <Input
                            id="websiteUrl"
                            type="url"
                            value={formData.websiteUrl}
                            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="https://yourband.com"
                          />
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Additional Information</h3>
                        <div>
                          <Label htmlFor="additionalInfo" className="text-white">
                            Anything else we should know?
                          </Label>
                          <Textarea
                            id="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="Special requests, inspiration, deadlines, etc."
                          />
                        </div>
                      </div>

                      {/* Terms Agreement */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                          className="border-white/20"
                        />
                        <Label htmlFor="terms" className="text-white text-sm">
                          I agree to the terms of service and understand that payment will be required before work
                          begins *
                        </Label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.agreeToTerms}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-lg py-6"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting Order...
                          </>
                        ) : (
                          `Submit Order - ${formData.serviceType === "epk" ? "$100" : "$250"}`
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
