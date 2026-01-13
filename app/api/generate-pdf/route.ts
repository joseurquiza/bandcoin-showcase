import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { epkData, epkType } = await request.json()

    // Import jsPDF dynamically to avoid SSR issues
    const { jsPDF } = await import("jspdf")

    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set up styling
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number, isBold = false, color = "#000000") => {
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", isBold ? "bold" : "normal")
      doc.setTextColor(color)

      const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
      doc.text(lines, margin, yPosition)
      yPosition += lines.length * fontSize * 0.35 + 5

      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
    }

    // Add header with BandCoin branding
    doc.setFillColor(255, 193, 7) // BandCoin yellow
    doc.rect(0, 0, pageWidth, 30, "F")
    doc.setTextColor("#000000")
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("BandCoin", margin, 20)
    doc.setFontSize(12)
    doc.text("Professional Electronic Press Kit", pageWidth - margin - 60, 20)

    yPosition = 45

    // Add EPK content based on type
    if (epkType === "3years-hollow") {
      addText("3 YEARS HOLLOW", 28, true, "#DC2626")
      addText("Rock / Alternative Metal", 16, false, "#6B7280")
      yPosition += 10

      addText("BAND OVERVIEW", 18, true)
      addText(
        'Powerful rock anthems with crushing riffs and emotionally charged vocals. Their latest album "The Cracks" showcases their perfect balance between melody and aggression.',
        12,
      )
      yPosition += 5

      addText("KEY STATISTICS", 18, true)
      addText("• Monthly Listeners: 40K", 12)
      addText("• Total Streams: 21M", 12)
      addText("• Songstats Followers: 80K", 12)
      addText("• Countries: 101+", 12)
      addText("• Years Active: 14+", 12)
      yPosition += 10

      addText('LATEST ALBUM: "THE CRACKS" (2024)', 18, true)
      addText("• Hungry (Featured Track)", 12)
      addText("• For Life (Featured Track)", 12)
      addText("• Fallen (Featured Track)", 12)
      addText("• Chemical Ride (Featured Track)", 12)
      yPosition += 10

      addText("UPCOMING TOUR DATES", 18, true)
      addText("August 2, 2025 - Mississippi Valley Fair, Davenport, IA (with Pop Evil)", 12)
      yPosition += 10

      addText("CONTACT INFORMATION", 18, true)
      addText("Email: admin@3yearsinc.com", 12)
      addText("Phone: +1 (309) 314-3010", 12)
      addText("Web: www.3yearshollow.com", 12)
    } else if (epkType === "now-its-dark") {
      addText("NOW ITS DARK", 28, true, "#3B82F6")
      addText("Rock / Alternative Metal - Chicago", 16, false, "#6B7280")
      yPosition += 10

      addText("BAND OVERVIEW", 18, true)
      addText(
        'Chicago rock quartet bringing raw sincerity to modern rock music. Influenced by Three Days Grace, Evanescence, and Killswitch Engage. Latest single "NYMPH" showcases their mystical rock sound.',
        12,
      )
      yPosition += 5

      addText("KEY STATISTICS", 18, true)
      addText("• Monthly Listeners: 36+", 12)
      addText("• Years Active: 4+", 12)
      addText("• Studio Albums: 1", 12)
      addText("• Based In: Chicago, IL", 12)
      yPosition += 10

      addText("LATEST RELEASES", 18, true)
      addText("• NYMPH (2024) - Latest Single", 12)
      addText("• Bother Me (2024) - Most Streamed", 12)
      addText("• Elusive (2024) - Single", 12)
      addText("• First Full-Length Album (2023)", 12)
      yPosition += 10

      addText("LIVE PERFORMANCE HISTORY", 18, true)
      addText("• Shared stages with Icon For Hire", 12)
      addText("• Performed with A Killers Confession", 12)
      addText("• Toured with City Of The Weak", 12)
      yPosition += 10

      addText("PROFESSIONAL COLLABORATIONS", 18, true)
      addText("• Producer: Tavis Stanley (Art Of Dying, Saint Asonia)", 12)
      addText("• Grammy-nominated guitarist collaboration (2023)", 12)
      yPosition += 10

      addText("CONTACT INFORMATION", 18, true)
      addText("Booking: booking@nowitsdark.com", 12)
      addText("Phone: +1 (312) 555-DARK", 12)
      addText("Social: @nowitsdarkofficial", 12)
    } else if (epkType === "tame-the-jester") {
      addText("TAME THE JESTER", 28, true, "#F97316")
      addText("Interactive Website - Custom Development", 16, false, "#6B7280")
      yPosition += 10

      addText("PROJECT OVERVIEW", 18, true)
      addText(
        "Fully custom interactive website featuring game-like elements, custom animations, and immersive branding. Built with modern web technologies to create an engaging user experience that perfectly captures the artist's chaotic yet harmonious musical style.",
        12,
      )
      yPosition += 5

      addText("KEY FEATURES", 18, true)
      addText("• Interactive jester counter system", 12)
      addText("• Custom navigation with game elements", 12)
      addText("• Responsive design for all devices", 12)
      addText("• Custom animations and transitions", 12)
      addText("• Brand-integrated design elements", 12)
      yPosition += 10

      addText("TECHNICAL IMPLEMENTATION", 18, true)
      addText("• Modern web development technologies", 12)
      addText("• Custom JavaScript interactions", 12)
      addText("• Optimized performance and loading", 12)
      addText("• Cross-browser compatibility", 12)
      yPosition += 10

      addText("BRAND INTEGRATION", 18, true)
      addText("• Custom jester mascot design", 12)
      addText("• Thematic color scheme and typography", 12)
      addText("• Brand-consistent messaging throughout", 12)
      addText("• Social media integration", 12)
      yPosition += 10

      addText("CONTACT INFORMATION", 18, true)
      addText("Website: www.tamethejester.com", 12)
      addText("Created by: BandCoin", 12)
      addText("Package: Custom Website ($250)", 12)
    } else if (epkType === "hollowvox") {
      addText("HOLLOWVOX", 28, true, "#10B981")
      addText("Action Token Platform - Digital Community", 16, false, "#6B7280")
      yPosition += 10

      addText("PLATFORM OVERVIEW", 18, true)
      addText(
        'HollowVox represents the cutting edge of crypto community engagement through "The Hollow" - the official sanctuary for community members. Built as part of the ACTIONverse ecosystem with advanced gaming elements, rewards systems, and comprehensive dashboard functionality.',
        12,
      )
      yPosition += 5

      addText("KEY FEATURES", 18, true)
      addText("• Action Token Integration", 12)
      addText("• Community Dashboard", 12)
      addText("• Rewards & Raffle Systems", 12)
      addText("• Gaming Elements", 12)
      addText("• Digital Asset Management", 12)
      yPosition += 10

      addText("TECHNICAL IMPLEMENTATION", 18, true)
      addText("• Part of the ACTIONverse ecosystem", 12)
      addText("• Advanced community management tools", 12)
      addText("• Integrated token functionality", 12)
      addText("• Cross-platform compatibility", 12)
      yPosition += 10

      addText("COMMUNITY FEATURES", 18, true)
      addText("• The Hollow - Official sanctuary access", 12)
      addText("• Exclusive rewards and incentives", 12)
      addText("• Deep lore and storytelling integration", 12)
      addText("• Interactive gaming elements", 12)
      yPosition += 10

      addText("CONTACT INFORMATION", 18, true)
      addText("Website: www.hollowvox.com", 12)
      addText("Created by: BandCoin", 12)
      addText("Package: Action Token Platform ($250)", 12)
    }

    // Add footer
    const footerY = pageHeight - 15
    doc.setFontSize(10)
    doc.setTextColor("#6B7280")
    doc.text("Generated by BandCoin - Professional Digital Services for Musicians", margin, footerY)
    doc.text(`www.bandcoin.com | ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, footerY)

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${epkData.artistName || "EPK"}-Press-Kit.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
