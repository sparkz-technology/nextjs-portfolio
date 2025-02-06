"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"

const steps = [
  { id: "name", label: "Your Name" },
  { id: "email", label: "Your Email" },
  { id: "message", label: "Your Message" },
]

  // @ts-expect-error - `props` is not compatible with `StepForm`
const StepForm = ({ currentStep, formData, setFormData, nextStep, prevStep, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameForm = useFormik({
    initialValues: { name: formData.name },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: (values) => {
        // @ts-expect-error - `prev` is not compatible with `setFormData`
      setFormData((prev) => ({ ...prev, name: values.name }))
      nextStep()
    },
  })

  const emailForm = useFormik({
    initialValues: { email: formData.email },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email")
        .test("is-google-domain", "Email must be from a Google domain", (value) => {
          if (!value) return false
          const domain = value.split("@")[1]
          const googleDomains = ["gmail.com", "google.com", "googlemail.com"]
          return googleDomains.includes(domain)
        })
        .required("Email is required"),
    }),
    onSubmit: (values) => {
         // @ts-expect-error - `prev` is not compatible with `setFormData`
      setFormData((prev) => ({ ...prev, email: values.email }))
      nextStep()
    },
  })

  const messageForm = useFormik({
    initialValues: { message: formData.message },
    validationSchema: Yup.object({
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true)
      await onSubmit({ ...formData, message: values.message })
      setIsSubmitting(false)
    },
  })

  const renderStepContent = (step: string) => {
    switch (step) {
      case "name":
        return (
          <form onSubmit={nameForm.handleSubmit} className="space-y-2">
            <Label htmlFor="name" className="block">
              Name
            </Label>
            <Input
              id="name"
              {...nameForm.getFieldProps("name")}
              className={`w-full ${nameForm.errors.name && nameForm.touched.name ? "border-red-500" : ""}`}
            />
            {nameForm.errors.name && nameForm.touched.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {nameForm.errors.name}
              </motion.p>
            )}
            <DialogFooter className="flex justify-end mt-4">
              <Button type="submit">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </form>
        )
      case "email":
        return (
          <form onSubmit={emailForm.handleSubmit} className="space-y-2">
            <Label htmlFor="email" className="block">
              Email
            </Label>
            <Input
              id="email"
              {...emailForm.getFieldProps("email")}
              className={`w-full ${emailForm.errors.email && emailForm.touched.email ? "border-red-500" : ""}`}
            />
            {emailForm.errors.email && emailForm.touched.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {emailForm.errors.email}
              </motion.p>
            )}
            <DialogFooter className="flex justify-between mt-4">
              <Button type="button" onClick={prevStep} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button type="submit">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </form>
        )
      case "message":
        return (
          <form onSubmit={messageForm.handleSubmit} className="space-y-2">
            <Label htmlFor="message" className="block">
              Message
            </Label>
            <Textarea
              id="message"
              {...messageForm.getFieldProps("message")}
              className={`w-full ${messageForm.errors.message && messageForm.touched.message ? "border-red-500" : ""}`}
            />
            {messageForm.errors.message && messageForm.touched.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {messageForm.errors.message}
              </motion.p>
            )}
            <DialogFooter className="flex justify-between mt-4">
              <Button type="button" onClick={prevStep} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </motion.div>
                ) : (
                  "Send message"
                )}
              </Button>
            </DialogFooter>
          </form>
        )
      default:
        return null
    }
  }

  return renderStepContent(steps[currentStep].id)
}

export default StepForm

