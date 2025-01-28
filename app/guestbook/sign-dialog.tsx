"use client";

import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Loader, FilePenLineIcon as Signature } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/signature-pad";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createGuestSignature } from "@/app/guestbook/action";

export const guestSignatureSchema = Yup.object().shape({
  message: Yup.string().required("Please enter a message"),
  signature: Yup.string().required("Please provide a signature"),
});

export const SignDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (
    values: { message: string; signature: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const { success, message } = await createGuestSignature(values);
      if (!success) {
        throw new Error(message);
      }
      setIsOpen(false);
      toast.info("Guest signature created successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        <Signature className="w-6 h-6 mr-2" />
        Sign guestbook
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Formik
          key={isOpen ? "open" : "closed"}
          initialValues={{ message: "", signature: "" }}
          validationSchema={guestSignatureSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched, submitForm }) => (
            <Form>
              <DialogContent className="space-y-4">
                <DialogTitle>Sign my guestbook</DialogTitle>
                <div>
                  <Label htmlFor="message">Leave a message</Label>
                  <Field
                    as={Textarea}
                    id="message"
                    name="message"
                    className={cn(errors.message && touched.message ? "border-red-500" : "", "w-full")}
                    rows={3}
                  />
                  <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <Label htmlFor="signature">Sign Here</Label>
                  <SignaturePad
                    id="signature"
                    className={cn(
                      "aspect-video h-40 mt-2 w-full rounded-lg border bg-transparent shadow dark:shadow-none",
                      "border border-grey-950/10 dark:border-black/10 ",
                      "bg-transparent dark:bg-black/5"
                    )}
                    onChange={(value) => setFieldValue("signature", value ?? "")}
                  />
                  <ErrorMessage name="signature" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsOpen(false)} variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button disabled={isSubmitting} variant="secondary" type="button" onClick={submitForm}>
                    {isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        signing...
                      </>
                    ) : (
                      "Sign"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};
