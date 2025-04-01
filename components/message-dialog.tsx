"use client"

import { useState, useEffect, useCallback } from "react"
import { Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const StepForm = dynamic(() => import("./message-step-form"), {
  loading: () => <p>Loading...</p>,
})
interface VisitData {
  deviceType: string;
  token: string;
}
import { sendEmailNotification } from "@/lib/action"
import { sideCannonsConfetti } from "@/lib/utils"

type SendEmailNotification = { name: string; email: string; message: string };

const steps = [
  { id: "name", label: "Your Name" },
  { id: "email", label: "Your Email" },
  { id: "message", label: "Your Message" },
]

export function MessageDialog() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const resetForms = useCallback(() => {
    setFormData({ name: "", email: "", message: "" })
  }, [])

  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      resetForms()
    }
  }, [open, resetForms])

    useEffect(() => {
    const fetchVisitData = async () => {
      const sessionToken: string | null = sessionStorage.getItem('sessionToken');

      if (sessionToken) {
        return; // Token exists, don't call API again
      }

      try {
        const response = await fetch('/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: null }),
        });

        if (response.ok) {
          const data: VisitData = await response.json();
          sessionStorage.setItem('sessionToken', data.token);
          sessionStorage.setItem('deviceType', data.deviceType);
        } else {
          console.error('Failed to record visit:', response.statusText);
        }
      } catch (error) {
        console.error('Error recording visit:', error);
      }
    };

    fetchVisitData();
  }, []);
  
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])
  
  const handleSubmit = useCallback(async (values: SendEmailNotification) => {
    try {
      const { message, success } = await sendEmailNotification(values)
      if (!success) {
        throw new Error(message)
      }
      setOpen(false)
      sideCannonsConfetti()
      const sound = new Audio("/sound/TunePocket-Confetti-Pop-Preview.mp3")
      await sound.play()
      toast.success("Message sent successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed sm:bottom-4 right-4 z-10 bottom-[6rem]"
            >
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 14, -8, 0],
                      scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  <span className="sr-only">Send Message</span>
                </Button>
              </DialogTrigger>
            </motion.div>
          )}
        </AnimatePresence>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send a Message</DialogTitle>
            <DialogDescription>Send me a message and I&apos;ll get back to you as soon as possible.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="mb-4">
              <div className="flex space-x-2 mb-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`h-2 flex-1 rounded-full ${
                      index <= currentStep ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                ))}
              </div>
              <p className="text-sm text-center">{steps[currentStep].label}</p>
            </div>
            <StepForm
              currentStep={currentStep}
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
              prevStep={prevStep}
              onSubmit={handleSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

