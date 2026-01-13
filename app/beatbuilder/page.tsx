"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Download, Eraser, Play, Shuffle, Sparkles, Square } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import MidiWriter from "midi-writer-js"

// Instrument rows (modern gradient chips)
const INSTRUMENTS = [
  { id: "kick", name: "Kick", dot: "bg-fuchsia-400" },
  { id: "snare", name: "Snare", dot: "bg-rose-400" },
  { id: "ch", name: "Closed Hat", dot: "bg-amber-400" },
  { id: "oh", name: "Open Hat", dot: "bg-emerald-400" },
  { id: "tom1", name: "Tom 1", dot: "bg-violet-400" },
  { id: "tom2", name: "Tom 2", dot: "bg-purple-400" },
  { id: "crash", name: "Crash", dot: "bg-cyan-400" },
  { id: "china", name: "China", dot: "bg-teal-400" },
] as const

type InstrumentId = (typeof INSTRUMENTS)[number]["id"]
type Pattern = Record<InstrumentId, number[]>

// Tighter cells to fit more steps across
const CELL_SIZE = 28 // px

export default function BeatBuilder() {
  // Steps and pattern
  const [steps, setSteps] = useState(32)
  const blank = (n: number) => new Array(n).fill(0)
  const [pattern, setPattern] = useState<Pattern>({
    kick: blank(32),
    snare: blank(32),
    ch: blank(32),
    oh: blank(32),
    tom1: blank(32),
    tom2: blank(32),
    crash: blank(32),
    china: blank(32),
  })

  // Transport
  const [tempo, setTempo] = useState([120]) // Slider uses array
  const [swing, setSwing] = useState([0]) // 0-60%
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)

  // AI prompt
  const [prompt, setPrompt] = useState("house groove with light hats")
  const [isGenerating, setIsGenerating] = useState(false)

  // Refs for accurate scheduling
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepRef = useRef(-1)
  const tempoRef = useRef(tempo[0])
  const swingRef = useRef(swing[0])
  const stepsRef = useRef(steps)
  const patternRef = useRef(pattern)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    tempoRef.current = tempo[0]
  }, [tempo])
  useEffect(() => {
    swingRef.current = swing[0]
  }, [swing])
  useEffect(() => {
    stepsRef.current = steps
  }, [steps])
  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  // Init Web Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Real-drummer sanitization for a given step
  function sanitizeStepHits(step: number, patt: Pattern): Set<InstrumentId> {
    // Build initial hit map
    const hit: Record<InstrumentId, boolean> = {
      kick: patt.kick[step] > 0,
      snare: patt.snare[step] > 0,
      ch: patt.ch[step] > 0,
      oh: patt.oh[step] > 0,
      tom1: patt.tom1[step] > 0,
      tom2: patt.tom2[step] > 0,
      crash: patt.crash[step] > 0,
      china: patt.china[step] > 0,
    }

    // 1) Hats are mutually exclusive (prefer open)
    if (hit.oh && hit.ch) hit.ch = false

    // 2) Crash/China replace hats on that step
    if (hit.crash || hit.china) {
      hit.ch = false
      hit.oh = false
    }

    // 3) Crash and China not together (prefer crash)
    if (hit.crash && hit.china) hit.china = false

    // 4) Toms replace snare on that step (fills)
    if (hit.tom1 || hit.tom2) hit.snare = false

    // 5) Only one tom at a time (prefer tom1)
    if (hit.tom1 && hit.tom2) hit.tom2 = false

    // 6) Limit "hands" to at most two simultaneous hits
    // Hand instruments:
    const orderedHands: InstrumentId[] = ["snare", "tom1", "tom2", "crash", "china", "oh", "ch"]
    const activeHands = orderedHands.filter((id) => hit[id])
    if (activeHands.length > 2) {
      const keep = new Set<InstrumentId>(activeHands.slice(0, 2))
      for (const id of orderedHands) {
        if (!keep.has(id)) hit[id] = false
      }
    }

    // Kick is foot, can always coincide
    const allowed = new Set<InstrumentId>()
    ;(Object.keys(hit) as InstrumentId[]).forEach((id) => {
      if (hit[id]) allowed.add(id)
    })
    return allowed
  }

  const playDrumSound = (instrument: InstrumentId) => {
    const ctx = audioContextRef.current
    if (!ctx) return
    const now = ctx.currentTime

    if (instrument === "kick") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(120, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12)
      gain.gain.setValueAtTime(1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.start(now)
      osc.stop(now + 0.15)
      return
    }

    // Toms: pitched percussive hits
    if (instrument === "tom1" || instrument === "tom2") {
      const baseFreq = instrument === "tom1" ? 200 : 140
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const lp = ctx.createBiquadFilter()
      lp.type = "lowpass"
      lp.frequency.value = 4000
      osc.type = "sine"
      osc.connect(gain)
      gain.connect(lp)
      lp.connect(ctx.destination)
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.2)
      gain.gain.setValueAtTime(0.9, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.3)
      return
    }

    // Cymbals/HiHats/China: noise-based
    const dur =
      instrument === "snare"
        ? 0.15
        : instrument === "ch"
          ? 0.06
          : instrument === "oh"
            ? 0.22
            : instrument === "crash"
              ? 0.9
              : 0.6 // china
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      const decayPow = instrument === "crash" ? 0.9 : instrument === "china" ? 0.8 : instrument === "oh" ? 1.2 : 2
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, decayPow)
    }
    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    if (instrument === "snare") {
      filter.type = "highpass"
      filter.frequency.value = 1800
      gain.gain.value = 0.5
    } else if (instrument === "ch") {
      filter.type = "highpass"
      filter.frequency.value = 8000
      gain.gain.value = 0.35
    } else if (instrument === "oh") {
      filter.type = "highpass"
      filter.frequency.value = 6000
      gain.gain.value = 0.4
    } else if (instrument === "crash") {
      filter.type = "bandpass"
      filter.frequency.value = 7000
      filter.Q.value = 0.6
      gain.gain.value = 0.5
    } else if (instrument === "china") {
      filter.type = "bandpass"
      filter.frequency.value = 3000
      filter.Q.value = 0.9
      gain.gain.value = 0.5
    }
    src.buffer = buffer
    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start(now)
  }

  const baseStepMs = () => (60 / tempoRef.current / 4) * 1000

  const scheduleNext = () => {
    const next = (stepRef.current + 1) % stepsRef.current
    stepRef.current = next
    setCurrentStep(next)

    // Sanitize for real drummer constraints at this step
    const allowed = sanitizeStepHits(next, patternRef.current)

    // Trigger sounds for allowed instruments only
    INSTRUMENTS.forEach(({ id }) => {
      if (allowed.has(id)) playDrumSound(id)
    })

    // Swing timing
    const base = baseStepMs()
    const swingAmt = Math.min(60, Math.max(0, swingRef.current)) / 100 // 0..0.6
    const delay = next % 2 === 1 ? base * (1 + 0.5 * swingAmt) : base * (1 - 0.5 * swingAmt)

    timeoutRef.current = setTimeout(scheduleNext, Math.max(10, delay))
  }

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }
    stepRef.current = -1
    scheduleNext()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  // Mutations
  const toggleStep = (instrument: InstrumentId, index: number) => {
    setPattern((prev) => ({
      ...prev,
      [instrument]: prev[instrument].map((v, i) => (i === index ? (v > 0 ? 0 : 1) : v)),
    }))
  }

  const clearPattern = () => {
    const n = stepsRef.current
    const zeros = (len: number) => new Array(len).fill(0)
    setPattern({
      kick: zeros(n),
      snare: zeros(n),
      ch: zeros(n),
      oh: zeros(n),
      tom1: zeros(n),
      tom2: zeros(n),
      crash: zeros(n),
      china: zeros(n),
    })
  }

  const randomizePattern = () => {
    const n = stepsRef.current
    const next: Pattern = {
      kick: new Array(n).fill(0),
      snare: new Array(n).fill(0),
      ch: new Array(n).fill(0),
      oh: new Array(n).fill(0),
      tom1: new Array(n).fill(0),
      tom2: new Array(n).fill(0),
      crash: new Array(n).fill(0),
      china: new Array(n).fill(0),
    }
    for (let i = 0; i < n; i++) {
      // Foundational groove
      if (i % 4 === 0) next.kick[i] = Math.random() > 0.15 ? 1 : 0
      if (i % 8 === 4) next.snare[i] = Math.random() > 0.1 ? 1 : 0
      if (i % 2 === 0) next.ch[i] = Math.random() > 0.3 ? 1 : 0
      if (i % 4 === 3) next.oh[i] = Math.random() > 0.8 ? 1 : 0

      // Toms: occasional fills near bar ends
      if (i % 16 >= 12 && Math.random() > 0.7) next.tom1[i] = 1
      if (i % 16 >= 14 && Math.random() > 0.6) next.tom2[i] = 1

      // Cymbals: crash at bar starts, china as transition
      if (i % 16 === 0 && Math.random() > 0.5) next.crash[i] = 1
      if ((i % 16 === 15 || i % 32 === 31) && Math.random() > 0.75) next.china[i] = 1
    }
    setPattern(next)
  }

  const updateSteps = (value: number) => {
    setSteps((_) => {
      const n = value
      setPattern((prev) => {
        const resized: Pattern = {
          kick: new Array(n).fill(0),
          snare: new Array(n).fill(0),
          ch: new Array(n).fill(0),
          oh: new Array(n).fill(0),
          tom1: new Array(n).fill(0),
          tom2: new Array(n).fill(0),
          crash: new Array(n).fill(0),
          china: new Array(n).fill(0),
        }
        INSTRUMENTS.forEach(({ id }) => {
          const copyLen = Math.min(prev[id].length, n)
          for (let i = 0; i < copyLen; i++) resized[id][i] = prev[id][i]
        })
        return resized
      })
      if (currentStep >= n) setCurrentStep(-1)
      return n
    })
  }

  // Export (MIDI) with sanitization
  const exportMIDI = () => {
    try {
      const PPQ = 480
      const ticksPerStep = PPQ / 4 // 16th note per grid step

      const drumMap: Record<InstrumentId, number> = {
        kick: 36,
        snare: 38,
        ch: 42,
        oh: 46,
        tom1: 50,
        tom2: 45,
        crash: 49,
        china: 52,
      }

      const track = new (MidiWriter as any).Track()
      if (typeof track.setTempo === "function") {
        track.setTempo(tempoRef.current)
      } else if (typeof (MidiWriter as any).TempoEvent === "function") {
        track.addEvent(new (MidiWriter as any).TempoEvent({ bpm: tempoRef.current }))
      }

      const durationTicks = Math.max(30, Math.floor(ticksPerStep / 2))
      const velocity = 90

      // Walk steps and add only sanitized hits
      for (let step = 0; step < stepsRef.current; step++) {
        const allowed = sanitizeStepHits(step, patternRef.current)
        for (const id of allowed) {
          const midiNote = drumMap[id]
          const startTick = step * ticksPerStep
          const noteEvent = new (MidiWriter as any).NoteEvent({
            channel: 10,
            pitch: [midiNote],
            duration: "T" + durationTicks,
            startTick,
            velocity,
          })
          track.addEvent(noteEvent)
        }
      }

      const writer = new (MidiWriter as any).Writer(track)
      if (typeof writer.dataUri === "function") {
        const uri: string = writer.dataUri()
        const a = document.createElement("a")
        a.href = uri
        a.download = `beat-${Date.now()}.mid`
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        const data = writer.buildFile()
        const blob =
          data instanceof Uint8Array
            ? new Blob([data], { type: "audio/midi" })
            : new Blob([new Uint8Array(data)], { type: "audio/midi" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `beat-${Date.now()}.mid`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("MIDI export failed:", err)
      alert("Failed to export MIDI. Please try again.")
    }
  }

  // AI generation with graceful merge for new instruments
  const generateWithAI = async () => {
    setIsGenerating(true)
    try {
      const bpm = tempoRef.current
      const promptWithBpm = `${prompt || ""} Tempo: ${bpm} BPM. Adjust groove density, hat subdivision, and fill frequency to feel natural at this tempo.`
      const res = await fetch("/api/ai-beat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptWithBpm,
          genre: "custom",
          steps,
          bpm, // included for server-side usage if supported
        }),
      })
      if (!res.ok) throw new Error("AI request failed")
      const data = await res.json()
      const ai = data?.pattern
      if (ai) {
        const ensure = (arr?: number[]) => (Array.isArray(arr) && arr.length === steps ? arr : new Array(steps).fill(0))
        setPattern({
          kick: ensure(ai.kick),
          snare: ensure(ai.snare),
          ch: ensure(ai.ch),
          oh: ensure(ai.oh),
          tom1: ensure(ai.tom1),
          tom2: ensure(ai.tom2),
          crash: ensure(ai.crash),
          china: ensure(ai.china),
        })
      }
    } catch {
      randomizePattern()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#09090B] via-[#0B0B10] to-black">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-3xl" />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="w-full px-4 py-4">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
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

      {/* Skinny Controls Bar */}
      <div className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5">
        <div className="mx-auto flex w-full flex-wrap items-center gap-3 px-3 py-3 md:gap-4">
          {/* Transport */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPlaying((p) => !p)}
              className="gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
            >
              {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button
              variant="outline"
              onClick={randomizePattern}
              className="gap-2 bg-transparent border-white/20 text-white"
            >
              <Shuffle className="h-4 w-4" />
              Randomize
            </Button>
            <Button
              variant="outline"
              onClick={clearPattern}
              className="gap-2 bg-transparent border-white/20 text-white"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
            <Button variant="outline" onClick={exportMIDI} className="gap-2 bg-transparent border-white/20 text-white">
              <Download className="h-4 w-4" />
              Export MIDI
            </Button>
          </div>

          {/* Divider */}
          <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

          {/* Tempo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Tempo</span>
            <div className="flex items-center gap-2 w-[160px]">
              <Slider value={tempo} onValueChange={setTempo} min={60} max={200} step={1} />
              <span className="w-10 text-right text-xs text-white/80 tabular-nums">{tempo[0]}</span>
            </div>
          </div>

          {/* Swing */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Swing</span>
            <div className="flex items-center gap-2 w-[140px]">
              <Slider value={swing} onValueChange={setSwing} min={0} max={60} step={1} />
              <span className="w-10 text-right text-xs text-white/80">{swing[0]}%</span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Steps</span>
            <Select value={String(steps)} onValueChange={(v) => updateSteps(Number.parseInt(v, 10))}>
              <SelectTrigger className="h-8 w-[90px] bg-white/5 border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Divider */}
          <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

          {/* Prompt + AI */}
          <div className="md:ml-auto flex min-w-[280px] items-center gap-2 md:min-w-[440px]">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  generateWithAI()
                }
              }}
              placeholder="Describe a style (e.g. 'dark techno with sparse hats')"
              className="h-9 w-full bg-white/5 border-white/15 text-white placeholder:text-white/40"
            />
            <Button
              className="gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
              onClick={generateWithAI}
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "AI"}
            </Button>
          </div>
        </div>
      </div>

      {/* Pattern Grid - Full width, modern glass */}
      <section className="py-6 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Pattern Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-white/10 p-3 md:p-4">
                {/* Timeline headers (bars) */}
                <div className="mb-2 overflow-x-auto">
                  <div className="flex items-center">
                    {/* Spacer to match the instrument label column */}
                    <div className="w-32 shrink-0 md:w-40" aria-hidden="true" />
                    {/* Match the gap between label and grid: gap-3 on base, gap-4 on md */}
                    <div
                      className="relative h-6 ml-3 md:ml-4"
                      style={{
                        width: steps * (CELL_SIZE + 8),
                        minWidth: "100%",
                      }}
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        {/* subtle bar markers every 4 steps */}
                        {Array.from({ length: Math.ceil(steps / 4) }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 h-full w-px bg-white/10"
                            style={{ left: `${i * 4 * (CELL_SIZE + 8)}px` }}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: Math.ceil(steps / 4) }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-center text-[10px] text-white/60"
                            style={{ width: 4 * (CELL_SIZE + 8) }}
                          >
                            {"Bar "}
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {INSTRUMENTS.map(({ id, name, dot }) => (
                      <div key={id} className="flex items-center gap-3 py-2 md:gap-4">
                        {/* Row label - modern chip */}
                        <div className="w-32 shrink-0 md:w-40">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/90">
                            <span className={`h-2.5 w-2.5 rounded-full ${dot} shadow-[0_0_12px]`} />
                            <span className="truncate">{name}</span>
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps}, ${CELL_SIZE}px)` }}>
                          {pattern[id].map((on, i) => {
                            const highlight = isPlaying && i === currentStep
                            const isBarStart = i % 4 === 0
                            return (
                              <button
                                key={i}
                                onClick={() => toggleStep(id, i)}
                                className={[
                                  "relative h-7 w-7 rounded-xl border transition-all duration-150",
                                  on
                                    ? "bg-white/90 border-white/80 text-slate-900 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.85),0_8px_24px_-8px_rgba(216,70,239,0.6)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10",
                                  highlight ? "ring-2 ring-fuchsia-400/60" : "",
                                  isBarStart
                                    ? "after:absolute after:-left-2 after:top-1/2 after:h-4 after:w-px after:-translate-y-1/2 after:bg-white/10"
                                    : "",
                                ].join(" ")}
                                aria-pressed={on > 0}
                                title={`${name} - Step ${i + 1}`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtle footer info */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                  <div>
                    Tip: Click cells to toggle hits. Bar lines every 4 steps. Playback/export auto-resolve impossible
                    combos to mimic a real drummer (max two hand hits, hats exclusive, toms replace snare, crash
                    replaces hats).
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-white/90" />
                    <span>Active</span>
                    <div className="ml-3 h-3 w-3 rounded bg-white/10" />
                    <span>Inactive</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
