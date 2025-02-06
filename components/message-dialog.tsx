// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Send, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { sideCannonsConfetti } from "@/lib/utils";
// import { sendEmailNotification } from "@/lib/action";
// import { toast } from "sonner";

// const confettiiPopTurn = "./sound/TunePocket-Confetti-Pop-Preview.mp3";

// const steps = [
//   { id: "name", label: "Your Name" },
//   { id: "email", label: "Your Email" },
//   { id: "message", label: "Your Message" },
// ];

// export function MessageDialog() {
//   const [open, setOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const nameForm = useFormik({
//     initialValues: { name: formData.name },
//     validationSchema: Yup.object({
//       name: Yup.string().required("Name is required"),
//     }),
//     onSubmit: (values) => {
//       setFormData((prev) => ({ ...prev, name: values.name }));
//       nextStep();
//     },
//   });

//   const emailForm = useFormik({
//     initialValues: { email: formData.email },
//     validationSchema: Yup.object({
//       email: Yup.string()
//         .email("Invalid email")
//         .test("is-google-domain", "Email must be from a Google domain", (value) => {
//           if (!value) return false;
//           const domain = value.split("@")[1];
//           const googleDomains = ["gmail.com", "google.com", "googlemail.com"];
//           return googleDomains.includes(domain);
//         })
//         .required("Email is required"),
//     }),
//     onSubmit: (values) => {
//       setFormData((prev) => ({ ...prev, email: values.email }));
//       nextStep();
//     },
//   });

//   const messageForm = useFormik({
//     initialValues: { message: formData.message },
//     validationSchema: Yup.object({
//       message: Yup.string().required("Message is required"),
//     }),
//     onSubmit: async (values) => {
//       setFormData((prev) => ({ ...prev, message: values.message }));
//       try {
//         const { message, success } = await sendEmailNotification({ ...formData, message: values.message });
//         setOpen(false);
//         setCurrentStep(0);
//         resetForms();
//         if (!success) {
//           throw new Error(message);
//         }
//         sideCannonsConfetti();
//         const sound = new Audio(confettiiPopTurn);
//         sound.play();
//       } catch (err) {
//         toast.error(err instanceof Error ? err.message : "Something went wrong");
//       }
//     },
//   });

//   const resetForms = useCallback(() => {
//     nameForm.resetForm();
//     emailForm.resetForm();
//     messageForm.resetForm();
//     setFormData({ name: "", email: "", message: "" });
//   }, [nameForm, emailForm, messageForm]);

//   useEffect(() => {
//     if (open) {
//       setCurrentStep(0);
//       resetForms();
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open]);

//   const nextStep = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const renderStepContent = (step: string) => {
//     switch (step) {
//       case "name":
//         return (
//           <form onSubmit={nameForm.handleSubmit} className="space-y-2">
//             <Label htmlFor="name" className="block">
//               Name
//             </Label>
//             <Input
//               id="name"
//               {...nameForm.getFieldProps("name")}
//               className={`w-full ${nameForm.errors.name && nameForm.touched.name ? "border-red-500" : ""}`}
//             />
//             {nameForm.errors.name && nameForm.touched.name && (
//               <motion.p
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-red-500 text-sm"
//               >
//                 {nameForm.errors.name}
//               </motion.p>
//             )}
//             <DialogFooter className="flex justify-end mt-4">
//               <Button type="submit">
//                 Next
//                 <ChevronRight className="h-4 w-4 ml-2" />
//               </Button>
//             </DialogFooter>
//           </form>
//         );
//       case "email":
//         return (
//           <form onSubmit={emailForm.handleSubmit} className="space-y-2">
//             <Label htmlFor="email" className="block">
//               Email
//             </Label>
//             <Input
//               id="email"
//               {...emailForm.getFieldProps("email")}
//               className={`w-full ${emailForm.errors.email && emailForm.touched.email ? "border-red-500" : ""}`}
//             />
//             {emailForm.errors.email && emailForm.touched.email && (
//               <motion.p
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-red-500 text-sm"
//               >
//                 {emailForm.errors.email}
//               </motion.p>
//             )}
//             <DialogFooter className="flex justify-between mt-4">
//               <Button type="button" onClick={prevStep} variant="outline">
//                 <ChevronLeft className="h-4 w-4 mr-2" />
//                 Previous
//               </Button>
//               <Button type="submit">
//                 Next
//                 <ChevronRight className="h-4 w-4 ml-2" />
//               </Button>
//             </DialogFooter>
//           </form>
//         );
//       case "message":
//         return (
//           <form onSubmit={messageForm.handleSubmit} className="space-y-2">
//             <Label htmlFor="message" className="block">
//               Message
//             </Label>
//             <Textarea
//               id="message"
//               {...messageForm.getFieldProps("message")}
//               className={`w-full ${messageForm.errors.message && messageForm.touched.message ? "border-red-500" : ""}`}
//             />
//             {messageForm.errors.message && messageForm.touched.message && (
//               <motion.p
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-red-500 text-sm"
//               >
//                 {messageForm.errors.message}
//               </motion.p>
//             )}
//             <DialogFooter className="flex justify-between mt-4">
//               <Button type="button" onClick={prevStep} variant="outline">
//                 <ChevronLeft className="h-4 w-4 mr-2" />
//                 Previous
//               </Button>
//               <Button type="submit" disabled={messageForm.isSubmitting}>
//                 {messageForm.isSubmitting ? (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="flex items-center"
//                   >
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Sending...
//                   </motion.div>
//                 ) : (
//                   "Send message"
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Dialog
//         open={open}
//         onOpenChange={(newOpen) => {
//           setOpen(newOpen);
//           if (!newOpen) {
//             setCurrentStep(0);
//             resetForms();
//           }
//         }}
//       >
//         <AnimatePresence>
//           {!open && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
//               animate={{ opacity: 1, scale: 1, rotate: 0 }}
//               exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
//               transition={{ duration: 0.5, type: "spring" }}
//               className="fixed sm:bottom-4 right-4 z-10 bottom-[6rem]"
//             >
//               <DialogTrigger asChild>
//                 <Button
//                   variant="default"
//                   size="icon"
//                   className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
//                 >
//                   <motion.div
//                     animate={{
//                       rotate: [0, 14, -8, 0],
//                       scale: [1, 1.2, 0.9, 1],
//                     }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                   >
//                     <Send className="h-4 w-4" />
//                   </motion.div>
//                   <span className="sr-only">Send Message</span>
//                 </Button>
//               </DialogTrigger>
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <div className="flex justify-between items-center">
//               <DialogTitle>Send a Message</DialogTitle>
//             </div>
//             <DialogDescription>Send me a message and I&apos;ll get back to you as soon as possible.</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-6">
//             <div className="mb-4">
//               <div className="flex space-x-2 mb-2">
//                 {steps.map((step, index) => (
//                   <motion.div
//                     key={step.id}
//                     className={`h-2 flex-1 rounded-full ${
//                       index <= currentStep ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
//                     }`}
//                     initial={{ scaleX: 0 }}
//                     animate={{ scaleX: 1 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                   />
//                 ))}
//               </div>
//               <p className="text-sm text-center">{steps[currentStep].label}</p>
//             </div>
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentStep}
//                 initial={{ opacity: 0, x: 50, rotate: 10 }}
//                 animate={{ opacity: 1, x: 0, rotate: 0 }}
//                 exit={{ opacity: 0, x: -50, rotate: -10 }}
//                 transition={{ duration: 0.5, type: "spring" }}
//               >
//                 {renderStepContent(steps[currentStep].id)}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
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

import { sendEmailNotification } from "@/lib/action"
import { sideCannonsConfetti } from "@/lib/utils"

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

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const handleSubmit = useCallback(async (values:keyof typeof formData) => {
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

