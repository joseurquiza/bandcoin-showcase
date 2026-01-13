"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  BookOpen,
  Sparkles,
  ImageIcon,
  Download,
  Save,
  ChevronRight,
  GraduationCap,
  Clock,
  Target,
  CheckCircle,
  Loader2,
  Lightbulb,
  List,
  FileText,
  Trophy,
  ArrowLeft,
  Play,
} from "lucide-react"
import {
  generateCourse,
  generateCourseInfographic,
  saveCourse,
  getMyCourses,
  getCourseById,
  type Course,
} from "./learn-actions"

export function LearnClient() {
  const [topic, setTopic] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [depth, setDepth] = useState<"quick" | "standard" | "comprehensive">("standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("create")
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [selectedModule, setSelectedModule] = useState<number>(0)
  const [selectedLesson, setSelectedLesson] = useState<number>(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [viewingCourse, setViewingCourse] = useState<any | null>(null)

  useEffect(() => {
    loadMyCourses()
  }, [])

  async function loadMyCourses() {
    const result = await getMyCourses()
    if (result.success && result.courses) {
      setMyCourses(result.courses)
    }
  }

  async function handleGenerateCourse() {
    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }

    setError(null)
    setIsGenerating(true)
    setCourse(null)
    setInfographicUrl(null)

    try {
      const result = await generateCourse(topic, depth, targetAudience || "General audience with basic knowledge")

      if (result.success && result.course) {
        setCourse(result.course)
        setActiveTab("course")
      } else {
        setError(result.error || "Failed to generate course")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateInfographic() {
    if (!course) return

    setIsGeneratingInfographic(true)

    try {
      const result = await generateCourseInfographic(
        course.title,
        course.modules.map((m) => ({ title: m.title, description: m.description })),
        course.learningOutcomes,
      )

      if (result.success && result.imageUrl) {
        setInfographicUrl(result.imageUrl)
      } else {
        setError(result.error || "Failed to generate infographic")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsGeneratingInfographic(false)
    }
  }

  async function handleSaveCourse() {
    if (!course) return

    setIsSaving(true)

    try {
      const result = await saveCourse(course, infographicUrl || undefined)

      if (result.success) {
        await loadMyCourses()
        setActiveTab("library")
      } else {
        setError(result.error || "Failed to save course")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleViewCourse(courseId: number) {
    const result = await getCourseById(courseId)
    if (result.success && result.course) {
      setViewingCourse(result.course)
      setCourse(result.course.course_data)
      setInfographicUrl(result.course.infographic_url)
      setSelectedModule(0)
      setSelectedLesson(0)
      setActiveTab("course")
    }
  }

  function handleQuizAnswer(questionIndex: number, answerIndex: number) {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }))
  }

  function calculateQuizScore(quiz: Course["modules"][0]["quiz"]) {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const currentModule = course?.modules[selectedModule]
  const currentLesson = currentModule?.lessons[selectedLesson]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <GraduationCap className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Course Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate comprehensive courses on any topic with AI-powered content and beautiful infographics
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-card/50 border border-border/50">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="course" className="flex items-center gap-2" disabled={!course}>
              <BookOpen className="h-4 w-4" />
              Course
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    Course Details
                  </CardTitle>
                  <CardDescription>Tell us what you want to learn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Music Production, Guitar Basics, Audio Engineering..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Textarea
                      id="audience"
                      placeholder="e.g., Beginners with no prior experience, Musicians looking to produce their own tracks..."
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="bg-background/50 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Course Depth</Label>
                    <RadioGroup
                      value={depth}
                      onValueChange={(v) => setDepth(v as typeof depth)}
                      className="grid grid-cols-3 gap-3"
                    >
                      <div>
                        <RadioGroupItem value="quick" id="quick" className="peer sr-only" />
                        <Label
                          htmlFor="quick"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/10 cursor-pointer transition-all"
                        >
                          <Clock className="h-5 w-5 mb-2 text-amber-400" />
                          <span className="font-medium">Quick</span>
                          <span className="text-xs text-muted-foreground">~2 modules</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                        <Label
                          htmlFor="standard"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/10 cursor-pointer transition-all"
                        >
                          <BookOpen className="h-5 w-5 mb-2 text-amber-400" />
                          <span className="font-medium">Standard</span>
                          <span className="text-xs text-muted-foreground">~4 modules</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="comprehensive" id="comprehensive" className="peer sr-only" />
                        <Label
                          htmlFor="comprehensive"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/10 cursor-pointer transition-all"
                        >
                          <Target className="h-5 w-5 mb-2 text-amber-400" />
                          <span className="font-medium">Deep Dive</span>
                          <span className="text-xs text-muted-foreground">~6 modules</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateCourse}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Course...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Course
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview/Info Card */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-400" />
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Structured Curriculum</h4>
                        <p className="text-sm text-muted-foreground">
                          Organized modules and lessons that build progressively
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Comprehensive Content</h4>
                        <p className="text-sm text-muted-foreground">In-depth lessons with examples and explanations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Practice Exercises</h4>
                        <p className="text-sm text-muted-foreground">Hands-on activities to reinforce learning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Quizzes & Assessments</h4>
                        <p className="text-sm text-muted-foreground">Test your knowledge with interactive quizzes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Course Infographic</h4>
                        <p className="text-sm text-muted-foreground">
                          Beautiful visual summary of your course (AI-generated)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      Powered by Gemini 2.5 Flash for course content and Nano Banana for infographics
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Tab */}
          <TabsContent value="course" className="space-y-6">
            {course && (
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="lg:col-span-1 bg-card/50 border-border/50 h-fit lg:sticky lg:top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.estimatedDuration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {course.modules.map((module, mIndex) => (
                          <div key={mIndex}>
                            <button
                              onClick={() => {
                                setSelectedModule(mIndex)
                                setSelectedLesson(0)
                                setQuizAnswers({})
                                setShowQuizResults(false)
                              }}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                selectedModule === mIndex
                                  ? "bg-amber-500/20 border border-amber-500/50"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center">
                                  {module.moduleNumber}
                                </span>
                                <span className="text-sm font-medium line-clamp-1">{module.title}</span>
                              </div>
                            </button>
                            {selectedModule === mIndex && (
                              <div className="ml-8 mt-1 space-y-1">
                                {module.lessons.map((lesson, lIndex) => (
                                  <button
                                    key={lIndex}
                                    onClick={() => {
                                      setSelectedLesson(lIndex)
                                      setQuizAnswers({})
                                      setShowQuizResults(false)
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${
                                      selectedLesson === lIndex
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {lesson.lessonNumber}. {lesson.title}
                                  </button>
                                ))}
                                {module.quiz && (
                                  <button
                                    onClick={() => {
                                      setSelectedLesson(-1)
                                      setQuizAnswers({})
                                      setShowQuizResults(false)
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center gap-1 ${
                                      selectedLesson === -1
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    <Trophy className="h-3 w-3" />
                                    Quiz
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <Button
                        onClick={handleGenerateInfographic}
                        disabled={isGeneratingInfographic}
                        variant="outline"
                        className="w-full bg-transparent"
                        size="sm"
                      >
                        {isGeneratingInfographic ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Generate Infographic
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleSaveCourse}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Course
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Course Overview (shown when no lesson selected) */}
                  {selectedModule === 0 && selectedLesson === 0 && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Learning Outcomes */}
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5 text-amber-400" />
                            What You'll Learn
                          </h3>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {course.learningOutcomes.map((outcome, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Prerequisites */}
                        {course.prerequisites.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3">Prerequisites</h3>
                            <ul className="space-y-1">
                              {course.prerequisites.map((prereq, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <ChevronRight className="h-4 w-4" />
                                  {prereq}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Infographic */}
                        {infographicUrl && (
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <ImageIcon className="h-5 w-5 text-amber-400" />
                              Course Infographic
                            </h3>
                            <div className="rounded-lg overflow-hidden border border-border/50">
                              <img
                                src={infographicUrl || "/placeholder.svg"}
                                alt="Course Infographic"
                                className="w-full h-auto"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-transparent"
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = infographicUrl
                                link.download = `${course.title.replace(/\s+/g, "-")}-infographic.png`
                                link.click()
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Infographic
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Lesson Content */}
                  {currentModule && selectedLesson >= 0 && currentLesson && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline">Module {currentModule.moduleNumber}</Badge>
                          <ChevronRight className="h-4 w-4" />
                          <span>Lesson {currentLesson.lessonNumber}</span>
                        </div>
                        <CardTitle>{currentLesson.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Lesson Content */}
                        <div className="prose prose-invert max-w-none">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{currentLesson.content}</p>
                        </div>

                        {/* Key Takeaways */}
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-400">
                            <Lightbulb className="h-5 w-5" />
                            Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {currentLesson.keyTakeaways.map((takeaway, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Practice Exercise */}
                        {currentLesson.practiceExercise && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-400">
                              <Play className="h-5 w-5" />
                              Practice Exercise
                            </h4>
                            <p className="text-sm">{currentLesson.practiceExercise}</p>
                          </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-4 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedLesson > 0) {
                                setSelectedLesson(selectedLesson - 1)
                              } else if (selectedModule > 0) {
                                setSelectedModule(selectedModule - 1)
                                const prevModule = course.modules[selectedModule - 1]
                                setSelectedLesson(prevModule.lessons.length - 1)
                              }
                            }}
                            disabled={selectedModule === 0 && selectedLesson === 0}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (selectedLesson < currentModule.lessons.length - 1) {
                                setSelectedLesson(selectedLesson + 1)
                              } else if (currentModule.quiz) {
                                setSelectedLesson(-1)
                              } else if (selectedModule < course.modules.length - 1) {
                                setSelectedModule(selectedModule + 1)
                                setSelectedLesson(0)
                              }
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          >
                            {selectedLesson < currentModule.lessons.length - 1
                              ? "Next Lesson"
                              : currentModule.quiz
                                ? "Take Quiz"
                                : selectedModule < course.modules.length - 1
                                  ? "Next Module"
                                  : "Complete"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quiz */}
                  {currentModule && selectedLesson === -1 && currentModule.quiz && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline">Module {currentModule.moduleNumber}</Badge>
                          <ChevronRight className="h-4 w-4" />
                          <span>Quiz</span>
                        </div>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-6 w-6 text-amber-400" />
                          Module Quiz
                        </CardTitle>
                        <CardDescription>Test your knowledge from {currentModule.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {showQuizResults ? (
                          <div className="text-center py-8">
                            <div className="text-6xl font-bold text-amber-400 mb-4">
                              {calculateQuizScore(currentModule.quiz)}%
                            </div>
                            <p className="text-lg mb-6">
                              {calculateQuizScore(currentModule.quiz) >= 70
                                ? "Great job! You've mastered this module."
                                : "Keep practicing! Review the lessons and try again."}
                            </p>
                            <div className="space-y-4">
                              {currentModule.quiz.questions.map((q, i) => (
                                <div
                                  key={i}
                                  className={`p-4 rounded-lg text-left ${
                                    quizAnswers[i] === q.correctAnswer
                                      ? "bg-green-500/10 border border-green-500/30"
                                      : "bg-red-500/10 border border-red-500/30"
                                  }`}
                                >
                                  <p className="font-medium mb-2">{q.question}</p>
                                  <p className="text-sm">Your answer: {q.options[quizAnswers[i]]}</p>
                                  {quizAnswers[i] !== q.correctAnswer && (
                                    <p className="text-sm text-green-400">
                                      Correct answer: {q.options[q.correctAnswer]}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                                </div>
                              ))}
                            </div>
                            <Button
                              className="mt-6"
                              onClick={() => {
                                if (selectedModule < course.modules.length - 1) {
                                  setSelectedModule(selectedModule + 1)
                                  setSelectedLesson(0)
                                  setQuizAnswers({})
                                  setShowQuizResults(false)
                                }
                              }}
                            >
                              {selectedModule < course.modules.length - 1
                                ? "Continue to Next Module"
                                : "Course Complete!"}
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            {currentModule.quiz.questions.map((question, qIndex) => (
                              <div key={qIndex} className="space-y-3">
                                <p className="font-medium">
                                  {qIndex + 1}. {question.question}
                                </p>
                                <RadioGroup
                                  value={quizAnswers[qIndex]?.toString()}
                                  onValueChange={(v) => handleQuizAnswer(qIndex, Number.parseInt(v))}
                                >
                                  {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                      <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                                        {option}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            ))}
                            <Button
                              onClick={() => setShowQuizResults(true)}
                              disabled={Object.keys(quizAnswers).length !== currentModule.quiz.questions.length}
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            >
                              Submit Quiz
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  My Courses
                </CardTitle>
                <CardDescription>Your saved courses and learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                {myCourses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses saved yet.</p>
                    <p className="text-sm">Generate and save a course to see it here.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCourses.map((savedCourse) => (
                      <Card
                        key={savedCourse.id}
                        className="bg-background/50 border-border/50 hover:border-amber-500/50 transition-all cursor-pointer"
                        onClick={() => handleViewCourse(savedCourse.id)}
                      >
                        {savedCourse.infographic_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={savedCourse.infographic_url || "/placeholder.svg"}
                              alt={savedCourse.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base line-clamp-2">{savedCourse.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-amber-400 border-amber-400/50 text-xs">
                              {savedCourse.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {savedCourse.estimated_duration}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {new Date(savedCourse.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
