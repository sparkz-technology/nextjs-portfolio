"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, User, Sparkles, Trash2, Zap, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const PREDEFINED_QUESTIONS = [
  { text: "About my experience", icon: "🚀" },
  { text: "Featured projects", icon: "⭐" },
]

const STORAGE_KEY = "rocket-chatbot-history"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface RocketChatbotProps {
  webhookUrl: string
}

export default function RocketChatbot({ webhookUrl }: RocketChatbotProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [hasNotification, setHasNotification] = useState(false)
  const [pendingResponse, setPendingResponse] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamic accent colors based on theme
  const getAccentColor = (intensity: "light" | "medium" | "strong" = "medium") => {
    if (!mounted) return ""

    const colors = {
      light: {
        light: "rgba(59, 130, 246, 0.3)", // blue-500/30
        medium: "rgba(59, 130, 246, 0.6)", // blue-500/60
        strong: "rgba(59, 130, 246, 1)", // blue-500
      },
      dark: {
        light: "rgba(34, 197, 94, 0.3)", // green-500/30
        medium: "rgba(34, 197, 94, 0.6)", // green-500/60
        strong: "rgba(34, 197, 94, 1)", // green-500
      },
    }

    return colors[theme as keyof typeof colors]?.[intensity] || colors.light[intensity]
  }

  // Local Storage Functions
  const saveToLocalStorage = (messages: Message[]) => {
    try {
      const serializedMessages = messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedMessages))
    } catch (error) {
      console.warn("Failed to save chat history to localStorage:", error)
    }
  }

  const loadFromLocalStorage = (): Message[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      }
    } catch (error) {
      console.warn("Failed to load chat history from localStorage:", error)
    }
    return []
  }

  const clearChatHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      const welcomeMessage: Message = {
        id: "welcome",
        content:
          "Mission Control here! I'm your AI-powered navigation system, ready to guide you through this portfolio's vast expanse. My advanced propulsion algorithms are optimized to deliver precise information about projects, skills, and achievements. Ready for launch?",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      setShowQuestions(true)
      setHasNotification(false)
      setPendingResponse(false)
      saveToLocalStorage([welcomeMessage])
    } catch (error) {
      console.warn("Failed to clear chat history:", error)
    }
  }

  // Initialize messages from localStorage or with welcome message
  useEffect(() => {
    if (!mounted) return

    const storedMessages = loadFromLocalStorage()
    if (storedMessages.length > 0) {
      setMessages(storedMessages)
      setShowQuestions(storedMessages.length === 1)
    } else {
      const welcomeMessage: Message = {
        id: "welcome",
        content:
          "Mission Control here! I'm your AI-powered navigation system, ready to guide you through this portfolio's vast expanse. My advanced propulsion algorithms are optimized to deliver precise information about projects, skills, and achievements. Ready for launch?",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      saveToLocalStorage([welcomeMessage])
    }
  }, [mounted])

  useEffect(() => {
    if (messages.length > 0) {
      saveToLocalStorage(messages)
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && hasNotification) {
      setHasNotification(false)
    }
  }, [isOpen, hasNotification])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleCloseModal = () => {
    if (pendingResponse || isLoading) {
      setHasNotification(true)
    }
    setIsOpen(false)
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setPendingResponse(true)
    setShowQuestions(false)

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          timestamp: new Date().toISOString(),
          sessionId: "rocket-portfolio-chat",
          conversationHistory: messages.slice(-5),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            data.response || "Processing trajectory... Mission Control is calculating optimal response parameters.",
          sender: "bot",
          timestamp: new Date(),
        }

        setTimeout(
          () => {
            setMessages((prev) => [...prev, botMessage])
            setIsLoading(false)
            setPendingResponse(false)
          },
          1000 + Math.random() * 1000,
        )
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Houston, we have a problem! Communication systems experiencing interference. Please retry transmission. 🚀",
        sender: "bot",
        timestamp: new Date(),
      }
      setTimeout(() => {
        setMessages((prev) => [...prev, errorMessage])
        setIsLoading(false)
        setPendingResponse(false)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* High-Quality Rocket Flying Animation */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 overflow-hidden">
        {/* Space Atmosphere */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-500/10 to-transparent animate-pulse" />
        </div>

        {/* Rocket Flying Animation */}
        <div className="relative w-full h-full">
          <div
            className={cn(
              "absolute w-20 h-20 md:w-24 md:h-24 animate-rocket-flight cursor-pointer pointer-events-auto transition-all duration-300",
              hasNotification && "animate-rocket-alert-flight",
            )}
            onClick={() => setIsOpen(true)}
            style={{
              filter: hasNotification
                ? `drop-shadow(0 0 20px ${getAccentColor("strong")}) drop-shadow(0 0 30px ${getAccentColor("strong")})`
                : theme === "dark"
                  ? "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
                  : "drop-shadow(0 0 12px rgba(0,0,0,0.4))",
            }}
          >
            {/* High-Quality Rocket Design */}
            <div className="relative w-full h-full">
              {/* Rocket Nose Cone */}
              <div
                className={cn(
                  "absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-8 md:w-5 md:h-10 border-2",
                  theme === "dark"
                    ? "bg-gradient-to-b from-white via-gray-200 to-gray-300 border-gray-400"
                    : "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border-gray-600",
                )}
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  boxShadow:
                    theme === "dark"
                      ? "inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)"
                      : "inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 8px rgba(255,255,255,0.1)",
                }}
              />

              {/* Rocket Body */}
              <div
                className={cn(
                  "absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-10 md:w-10 md:h-12 rounded-lg border-2 relative overflow-hidden",
                  theme === "dark"
                    ? "bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 border-gray-500"
                    : "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border-gray-600",
                )}
                style={{
                  boxShadow:
                    theme === "dark"
                      ? "inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)"
                      : "inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 8px rgba(255,255,255,0.1)",
                }}
              >
                {/* Rocket Windows with Accent Color */}
                <div
                  className={cn(
                    "absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 md:w-5 md:h-3 rounded-full border",
                    theme === "dark" ? "border-gray-600" : "border-gray-400",
                  )}
                  style={{ backgroundColor: getAccentColor("light") }}
                />
                <div
                  className={cn(
                    "absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-2 md:w-5 md:h-3 rounded-full border",
                    theme === "dark" ? "border-gray-600" : "border-gray-400",
                  )}
                  style={{ backgroundColor: getAccentColor("light") }}
                />

                {/* Rocket Logo with Accent Color */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <Rocket className="w-3 h-3 md:w-4 md:h-4" style={{ color: getAccentColor("strong") }} />
                </div>

                {/* Accent Stripe */}
                <div
                  className="absolute top-6 left-0 right-0 h-1 rounded-full"
                  style={{ backgroundColor: getAccentColor("medium") }}
                />
              </div>

              {/* Rocket Fins */}
              <div
                className={cn(
                  "absolute top-12 left-0 w-3 h-6 md:w-4 md:h-7 border-2",
                  theme === "dark"
                    ? "bg-gradient-to-b from-gray-300 to-gray-500 border-gray-600"
                    : "bg-gradient-to-b from-gray-600 to-gray-800 border-gray-500",
                )}
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 80% 100%, 0% 80%)",
                  boxShadow:
                    theme === "dark" ? "inset 0 1px 2px rgba(0,0,0,0.2)" : "inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              />
              <div
                className={cn(
                  "absolute top-12 right-0 w-3 h-6 md:w-4 md:h-7 border-2",
                  theme === "dark"
                    ? "bg-gradient-to-b from-gray-300 to-gray-500 border-gray-600"
                    : "bg-gradient-to-b from-gray-600 to-gray-800 border-gray-500",
                )}
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 20% 100%)",
                  boxShadow:
                    theme === "dark" ? "inset 0 1px 2px rgba(0,0,0,0.2)" : "inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              />

              {/* Rocket Exhaust with Accent Colors */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-6 h-8 md:w-8 md:h-10">
                {/* Main Exhaust Flame */}
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-6 md:w-4 md:h-8 animate-exhaust-main"
                  style={{
                    background: `linear-gradient(to bottom, ${getAccentColor("strong")}, ${getAccentColor("light")}, transparent)`,
                    clipPath: "polygon(30% 0%, 70% 0%, 50% 100%)",
                  }}
                />
                {/* Side Exhaust Flames */}
                <div
                  className="absolute top-1 left-0 w-2 h-4 md:w-3 md:h-6 animate-exhaust-left"
                  style={{
                    background: `linear-gradient(to bottom, ${getAccentColor("medium")}, transparent)`,
                    clipPath: "polygon(0% 0%, 80% 0%, 40% 100%)",
                  }}
                />
                <div
                  className="absolute top-1 right-0 w-2 h-4 md:w-3 md:h-6 animate-exhaust-right"
                  style={{
                    background: `linear-gradient(to bottom, ${getAccentColor("medium")}, transparent)`,
                    clipPath: "polygon(20% 0%, 100% 0%, 60% 100%)",
                  }}
                />
              </div>

              {/* Thruster Glow */}
              <div
                className="absolute top-14 left-1/2 transform -translate-x-1/2 w-10 h-2 md:w-12 md:h-3 rounded-full animate-thruster-glow opacity-60"
                style={{
                  background: `radial-gradient(ellipse, ${getAccentColor("strong")}, transparent)`,
                  filter: `blur(2px)`,
                }}
              />
            </div>

            {/* Notification Badge */}
            {hasNotification && (
              <div
                className={cn(
                  "absolute -top-2 -right-2 w-5 h-5 rounded-full animate-bounce flex items-center justify-center border-2 shadow-lg",
                  theme === "dark" ? "bg-white border-gray-300 text-black" : "bg-black border-gray-700 text-white",
                )}
                style={{
                  boxShadow: `0 0 15px ${getAccentColor("strong")}`,
                }}
              >
                <Zap className="w-2.5 h-2.5" />
              </div>
            )}

            {/* Enhanced Vapor Trail with Accent Colors */}
            <div
              className="absolute top-1/2 -left-8 w-8 h-1 rounded-full animate-vapor-trail"
              style={{
                background: `linear-gradient(to right, transparent, ${getAccentColor("light")})`,
              }}
            />
            <div
              className="absolute top-1/2 -left-6 w-6 h-0.5 rounded-full animate-vapor-trail"
              style={{
                background: `linear-gradient(to right, transparent, ${getAccentColor("light")})`,
                animationDelay: "0.3s",
              }}
            />
            <div
              className="absolute top-1/2 -left-4 w-4 h-0.5 rounded-full animate-vapor-trail"
              style={{
                background: `linear-gradient(to right, transparent, ${getAccentColor("light")})`,
                animationDelay: "0.6s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Rocket-themed Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:justify-end md:items-end p-2 md:p-4">
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-sm animate-in fade-in duration-500",
              theme === "dark"
                ? "bg-gradient-to-b from-black/80 via-gray-900/70 to-black/80"
                : "bg-gradient-to-b from-white/80 via-gray-100/70 to-white/80",
            )}
            onClick={handleCloseModal}
          />

          {/* Rocket Chat Modal */}
          <div
            className={cn(
              "relative w-full max-w-sm h-[520px] md:h-[520px] h-[85vh] max-h-[520px] rounded-2xl md:rounded-2xl rounded-t-2xl shadow-2xl border-2 flex flex-col overflow-hidden",
              "animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-500",
              theme === "dark"
                ? "bg-gradient-to-b from-white via-gray-100 to-white border-gray-300/50"
                : "bg-gradient-to-b from-black via-gray-900 to-black border-gray-700/50",
            )}
            style={{
              boxShadow:
                theme === "dark"
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 0, 0, 0.1)"
                  : "0 25px 50px -12px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Rocket Header */}
            <div
              className={cn(
                "flex items-center justify-between p-3 border-b-2 relative overflow-hidden",
                theme === "dark"
                  ? "border-gray-400/20 bg-gradient-to-r from-gray-200 via-white to-gray-200"
                  : "border-gray-600/20 bg-gradient-to-r from-gray-800 via-black to-gray-800",
              )}
            >
              {/* Accent Glow Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                style={{ backgroundColor: getAccentColor("medium") }}
              />

              <div
                className={cn(
                  "absolute inset-0 animate-pulse",
                  theme === "dark"
                    ? "bg-gradient-to-r from-transparent via-gray-400/10 to-transparent"
                    : "bg-gradient-to-r from-transparent via-gray-600/10 to-transparent",
                )}
              />

              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center relative overflow-hidden border",
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-800 to-black border-gray-700"
                      : "bg-gradient-to-br from-gray-200 to-white border-gray-300",
                  )}
                  style={{
                    boxShadow:
                      theme === "dark"
                        ? "inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)"
                        : "inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(255,255,255,0.3)",
                  }}
                >
                  <Rocket className="h-4 w-4" style={{ color: getAccentColor("strong") }} />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-transparent to-transparent -skew-x-12 animate-shimmer",
                      theme === "dark" ? "via-white/20" : "via-black/20",
                    )}
                  />
                </div>
                <div>
                  <h3
                    className={cn("font-bold text-sm tracking-tight", theme === "dark" ? "text-black" : "text-white")}
                  >
                    MISSION CONTROL
                  </h3>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full animate-pulse shadow-lg"
                      style={{
                        backgroundColor: getAccentColor("strong"),
                        boxShadow: `0 0 6px ${getAccentColor("strong")}`,
                      }}
                    />
                    <p className={cn("text-xs font-medium", theme === "dark" ? "text-gray-700" : "text-gray-300")}>
                      {messages.length > 1 ? `${messages.length - 1} transmissions` : "Launch Ready"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                {messages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChatHistory}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-300 hover:scale-110",
                      theme === "dark"
                        ? "text-gray-700 hover:text-black hover:bg-black/10"
                        : "text-gray-300 hover:text-white hover:bg-white/10",
                    )}
                    title="Clear transmission history"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-300 hover:scale-110",
                    theme === "dark"
                      ? "text-gray-800 hover:text-black hover:bg-black/10"
                      : "text-gray-200 hover:text-white hover:bg-white/10",
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea
              className={cn(
                "flex-1 p-3",
                theme === "dark" ? "bg-gradient-to-b from-gray-50 to-white" : "bg-gradient-to-b from-gray-950 to-black",
              )}
            >
              <div className="space-y-3">
                {/* Rocket-themed Predefined Questions */}
                {showQuestions && (
                  <div className="animate-in slide-in-from-top-2 duration-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3 w-3 animate-spin" style={{ color: getAccentColor("strong") }} />
                      <p
                        className={cn(
                          "text-xs font-bold tracking-wide uppercase",
                          theme === "dark" ? "text-gray-800" : "text-gray-200",
                        )}
                      >
                        LAUNCH SEQUENCE
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {PREDEFINED_QUESTIONS.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handlePredefinedQuestion(question.text)}
                          className={cn(
                            "text-xs px-3 py-2 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden inline-flex items-center gap-1 whitespace-nowrap",
                            "animate-in slide-in-from-left-2 duration-500",
                            theme === "dark"
                              ? "border-gray-500/30 text-black hover:bg-black/10 hover:border-gray-700/60 bg-white/50"
                              : "border-gray-500/30 text-white hover:bg-white/10 hover:border-gray-300/60 bg-black/50",
                          )}
                          style={{
                            animationDelay: `${index * 100}ms`,
                            boxShadow:
                              theme === "dark"
                                ? "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(0, 0, 0, 0.1)"
                                : "0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          {/* Rocket Shine Effects with Accent Colors */}
                          <div
                            className="absolute inset-0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"
                            style={{
                              background: `linear-gradient(to right, transparent, ${getAccentColor("light")}, transparent)`,
                            }}
                          />
                          <div
                            className="absolute inset-0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"
                            style={{
                              background: `linear-gradient(to right, transparent, ${getAccentColor("medium")}, transparent)`,
                            }}
                          />
                          <div
                            className="absolute inset-0 -skew-x-12 animate-rocket-shine"
                            style={{
                              background: `linear-gradient(to right, transparent, ${getAccentColor("light")}, transparent)`,
                            }}
                          />

                          <span className="relative z-10 drop-shadow-sm">{question.icon}</span>
                          <span className="relative z-10 font-medium drop-shadow-sm">{question.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 animate-in slide-in-from-bottom-2 duration-500",
                      message.sender === "user" ? "justify-end" : "justify-start",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {message.sender === "bot" && (
                      <div
                        className={cn(
                          "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 relative overflow-hidden border",
                          theme === "dark"
                            ? "bg-gradient-to-br from-gray-800 to-black border-gray-700"
                            : "bg-gradient-to-br from-gray-200 to-white border-gray-300",
                        )}
                        style={{
                          boxShadow:
                            theme === "dark"
                              ? "inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)"
                              : "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(255,255,255,0.3)",
                        }}
                      >
                        <Rocket className="h-3 w-3" style={{ color: getAccentColor("strong") }} />
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-pulse",
                            theme === "dark" ? "via-white/20" : "via-black/20",
                          )}
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[90%] md:max-w-[85%] rounded-2xl px-3 py-2 relative overflow-hidden group shadow-lg border",
                        message.sender === "user"
                          ? theme === "dark"
                            ? "bg-gradient-to-r from-black to-gray-900 text-white border-gray-800"
                            : "bg-gradient-to-r from-white to-gray-100 text-black border-gray-200"
                          : theme === "dark"
                            ? "bg-gradient-to-r from-gray-100 to-white text-black border-gray-300/50"
                            : "bg-gradient-to-r from-gray-900 to-black text-white border-gray-700/50",
                      )}
                      style={{
                        boxShadow:
                          theme === "dark"
                            ? message.sender === "user"
                              ? "0 4px 15px rgba(0, 0, 0, 0.4)"
                              : "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(0, 0, 0, 0.1)"
                            : message.sender === "user"
                              ? "0 4px 15px rgba(255, 255, 255, 0.4)"
                              : "0 4px 15px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      {/* Accent Border for User Messages */}
                      {message.sender === "user" && (
                        <div
                          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                          style={{ backgroundColor: getAccentColor("medium") }}
                        />
                      )}

                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r from-transparent to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000",
                          theme === "dark" ? "via-black/10" : "via-white/10",
                        )}
                      />
                      <p className="text-xs leading-relaxed relative z-10 font-medium">{message.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1 opacity-70 relative z-10",
                          message.sender === "user" ? "text-right" : "text-left",
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.sender === "user" && (
                      <div
                        className={cn(
                          "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 relative overflow-hidden border",
                          theme === "dark"
                            ? "bg-gradient-to-br from-gray-800 to-black border-gray-700"
                            : "bg-gradient-to-br from-gray-200 to-white border-gray-300",
                        )}
                        style={{
                          boxShadow:
                            theme === "dark"
                              ? "inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)"
                              : "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(255,255,255,0.3)",
                        }}
                      >
                        <User className="h-3 w-3" style={{ color: getAccentColor("strong") }} />
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-pulse",
                            theme === "dark" ? "via-white/20" : "via-black/20",
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Rocket Loading Animation */}
                {isLoading && (
                  <div className="flex gap-2 justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 relative overflow-hidden border",
                        theme === "dark"
                          ? "bg-gradient-to-br from-gray-800 to-black border-gray-700"
                          : "bg-gradient-to-br from-gray-200 to-white border-gray-300",
                      )}
                      style={{
                        boxShadow:
                          theme === "dark"
                            ? "inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)"
                            : "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(255,255,255,0.3)",
                      }}
                    >
                      <Rocket className="h-3 w-3 animate-pulse" style={{ color: getAccentColor("strong") }} />
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 relative overflow-hidden shadow-lg border",
                        theme === "dark"
                          ? "bg-gradient-to-r from-gray-100 to-white border-gray-300/50"
                          : "bg-gradient-to-r from-gray-900 to-black border-gray-700/50",
                      )}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full animate-bounce shadow-sm"
                            style={{
                              backgroundColor: getAccentColor("medium"),
                              animationDelay: `${i * 200}ms`,
                              boxShadow: `0 0 4px ${getAccentColor("light")}`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Rocket Input */}
            <div
              className={cn(
                "p-3 border-t-2 relative overflow-hidden",
                theme === "dark"
                  ? "border-gray-400/20 bg-gradient-to-r from-gray-200 via-white to-gray-200"
                  : "border-gray-600/20 bg-gradient-to-r from-gray-800 via-black to-gray-800",
              )}
            >
              {/* Accent Glow Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 animate-pulse"
                style={{ backgroundColor: getAccentColor("medium") }}
              />

              <div
                className={cn(
                  "absolute inset-0 animate-pulse",
                  theme === "dark"
                    ? "bg-gradient-to-r from-transparent via-gray-400/10 to-transparent"
                    : "bg-gradient-to-r from-transparent via-gray-600/10 to-transparent",
                )}
              />
              <div className="flex gap-2 relative z-10">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Send transmission to Mission Control..."
                  disabled={isLoading}
                  className={cn(
                    "flex-1 border-2 focus-visible:ring-2 h-10 md:h-9 text-sm font-medium transition-all duration-300 shadow-lg",
                    theme === "dark"
                      ? "bg-white text-black placeholder:text-gray-600 border-gray-500/30 focus-visible:border-gray-700/60"
                      : "bg-black text-white placeholder:text-gray-400 border-gray-500/30 focus-visible:border-gray-300/60",
                  )}
                  style={
                    {
                      boxShadow:
                        theme === "dark"
                          ? "inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(0, 0, 0, 0.1)"
                          : "inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.05)",
                      "--tw-ring-color": getAccentColor("light"),
                    } as React.CSSProperties
                  }
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className={cn(
                    "h-10 w-10 md:h-9 md:w-9 rounded-full transition-all duration-300 hover:scale-110 relative overflow-hidden group shadow-lg border",
                    theme === "dark"
                      ? "bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white border-gray-800"
                      : "bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black border-gray-200",
                    isLoading && "animate-pulse",
                  )}
                  style={{
                    boxShadow:
                      theme === "dark"
                        ? `0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px ${getAccentColor("light")}`
                        : `0 4px 15px rgba(255, 255, 255, 0.4), 0 0 10px ${getAccentColor("light")}`,
                  }}
                >
                  <div
                    className="absolute inset-0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"
                    style={{
                      background: `linear-gradient(to right, transparent, ${getAccentColor("light")}, transparent)`,
                    }}
                  />
                  <Send className="h-4 w-4 relative z-10" style={{ color: getAccentColor("strong") }} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes rocket-shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          50% { transform: translateX(-50%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-rocket-shine {
          animation: rocket-shine 4s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        @keyframes rocket-flight {
          0% { 
            transform: translateX(-100px) translateY(20vh) rotate(-15deg) scale(0.8); 
            opacity: 0;
          }
          5% { 
            opacity: 1;
          }
          20% { 
            transform: translateX(20vw) translateY(10vh) rotate(-10deg) scale(0.9); 
          }
          40% { 
            transform: translateX(40vw) translateY(30vh) rotate(-5deg) scale(1); 
          }
          60% { 
            transform: translateX(60vw) translateY(15vh) rotate(0deg) scale(1.1); 
          }
          80% { 
            transform: translateX(80vw) translateY(25vh) rotate(5deg) scale(1); 
          }
          95% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(calc(100vw + 100px)) translateY(20vh) rotate(10deg) scale(0.9); 
            opacity: 0;
          }
        }
        .animate-rocket-flight {
          animation: rocket-flight 22s ease-in-out infinite;
        }
        
        @keyframes rocket-alert-flight {
          0% { 
            transform: translateX(-100px) translateY(20vh) rotate(-15deg) scale(1); 
            opacity: 0;
          }
          5% { 
            opacity: 1;
          }
          20% { 
            transform: translateX(20vw) translateY(10vh) rotate(-10deg) scale(1.2); 
          }
          40% { 
            transform: translateX(40vw) translateY(30vh) rotate(-5deg) scale(1.3); 
          }
          60% { 
            transform: translateX(60vw) translateY(15vh) rotate(0deg) scale(1.4); 
          }
          80% { 
            transform: translateX(80vw) translateY(25vh) rotate(5deg) scale(1.3); 
          }
          95% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(calc(100vw + 100px)) translateY(20vh) rotate(10deg) scale(1.1); 
            opacity: 0;
          }
        }
        .animate-rocket-alert-flight {
          animation: rocket-alert-flight 22s ease-in-out infinite;
        }
        
        @keyframes exhaust-main {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.8; }
          50% { transform: scaleY(1.3) scaleX(0.8); opacity: 1; }
        }
        .animate-exhaust-main {
          animation: exhaust-main 0.3s ease-in-out infinite;
        }
        
        @keyframes exhaust-left {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(-5deg); opacity: 0.6; }
          50% { transform: scaleY(1.2) scaleX(0.9) rotate(-8deg); opacity: 0.9; }
        }
        .animate-exhaust-left {
          animation: exhaust-left 0.4s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        
        @keyframes exhaust-right {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(5deg); opacity: 0.6; }
          50% { transform: scaleY(1.2) scaleX(0.9) rotate(8deg); opacity: 0.9; }
        }
        .animate-exhaust-right {
          animation: exhaust-right 0.4s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        @keyframes vapor-trail {
          0% { opacity: 0; transform: translateX(0px) scaleX(0.5); }
          50% { opacity: 0.7; transform: translateX(-10px) scaleX(1); }
          100% { opacity: 0; transform: translateX(-20px) scaleX(1.5); }
        }
        .animate-vapor-trail {
          animation: vapor-trail 1s ease-out infinite;
        }
        
        @keyframes thruster-glow {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scaleX(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scaleX(1.2); }
        }
        .animate-thruster-glow {
          animation: thruster-glow 0.5s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
