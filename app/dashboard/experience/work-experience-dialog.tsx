"use client";

import * as Yup from "yup";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { AlertTriangle, CalendarIcon, Loader, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createWorkExperienceAction, deleteWorkExperienceAction, updateWorkExperienceAction } from "./action";
import { useWorkExperienceDialog } from "@/lib/zustand/use-dialog-store";
import { ImageUploader } from "@/components/image-uploader";

const validationSchema = Yup.object().shape({
  company: Yup.string().required("Company name is required"),
  link: Yup.string().url("Invalid URL").required("Company website is required"),
  location: Yup.string().required("Location is required"),
  title: Yup.string().required("Job title is required"),
  logoUrl: Yup.mixed().required("Company logo is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().min(Yup.ref("startDate"), "End date must be after start date"),
  description: Yup.string().required("Description is required"),
});
export interface IWorkExperience {
  id: string;
  company: string;
  link: string;
  location: string;
  title: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  description: string;
}
export function ExpreienceDialog() {
  const { type, closeDialog, data, openDialog } = useWorkExperienceDialog();
  const workExperienceData = (data ?? {}) as IWorkExperience;
  const isCreate = !data || !(data?.id ?? false);

  const handleSubmit = async (values: IWorkExperience, { resetForm }: FormikHelpers<IWorkExperience>) => {
    try {
      const payload = {
        ...values,
          startDate: formvalues.startDate ? format(formvalues.startDate,"dd/MM/yyyy") : "",
          endDate: formvalues.endDate
          ? isToday(formvalues.endDate)
            ? "Present"
            : format(formvalues.endDate,"dd/MM/yyyy")
          : "",
      };
      if (isCreate) {
        const { success, message } = await createWorkExperienceAction(payload);
        if (!success) {
          throw new Error(message);
        }
        toast.success("Work expreience created successfully");
        return;
      }
      const { success, message } = await updateWorkExperienceAction(payload);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Work expreience updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      resetForm();
      closeDialog();
    }
  };

const parseCustomDate = (dateStr: string): string => {
    const date = parse(dateStr, "dd/MM/yyyy", new Date());
    return isValid(date) ? format(date, "yyyy-MM-dd") : format(new Date(),"yyyy-MM-dd");
};

  return (
    <Dialog open={type == "workExperience"} onOpenChange={closeDialog}>
      <Button onClick={() => openDialog("workExperience")} variant="outline">
        Create
      </Button>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create" : "Update"} Work Experience</DialogTitle>
          <DialogDescription>
            {isCreate ? "Enter" : "Update"} the details of your work experience here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            id: workExperienceData.id ?? "",
            company: workExperienceData.company ?? "",
            link: workExperienceData.link ?? "",
            location: workExperienceData.location ?? "",
            title: workExperienceData.title ?? "",
            startDate:   data?.startDate ? parseCustomDate(data?.startDate) : "",
            endDate:  data?.endDate ? parseCustomDate(data.endDate) :"", 
            description: workExperienceData.description ?? "",
            logoUrl: workExperienceData.logoUrl ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values, isSubmitting, submitForm }) => (
            <Form className="space-y-4 ">
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Field as={Input} id="company" name="company" placeholder="Enter company name" />
                  <ErrorMessage name="company" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <Label htmlFor="link">Company Website</Label>
                  <Field as={Input} id="link" name="link" placeholder="https://example.com" />
                  <ErrorMessage name="link" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Field as={Input} id="location" name="location" placeholder="City, Country" />
                  <ErrorMessage name="location" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Field as={Input} id="title" name="title" placeholder="Enter your job title" />
                  <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <ImageUploader
                  onUpload={(file) => setFieldValue("logoUrl", file)}
                  imageUrl={values.logoUrl}
                  fileName={values.company}
                  onDelete={() => setFieldValue("logoUrl", null)}
                />
                <ErrorMessage name="logoUrl" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="grid gap-2">
                <Label>Timeline</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.startDate ? format(values.startDate, "PPP") : <span>Start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={values.startDate ? new Date(values.startDate) : undefined}
                        onSelect={(date: Date | undefined) => setFieldValue("startDate", date ?? null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.endDate ? format(values.endDate, "PPP") : <span>End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={values.endDate ? new Date(values.endDate) : undefined}
                        onSelect={(date: Date | undefined) => setFieldValue("endDate", date ?? null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
                <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Field
                  as={Textarea}
                  id="description"
                  name="description"
                  placeholder="Describe your role and responsibilities"
                  className="resize-none"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
              </div>

              <DialogFooter>
                <Button onClick={() => closeDialog()} variant="outline" type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} variant="secondary" type="submit" onClick={submitForm}>
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {isCreate ? "Creating" : "Updating"}
                    </>
                  ) : isCreate ? (
                    "Create"
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogValues {
  id: string;
}

export const DeleteDialog: React.FC = () => {
  const { type, closeDialog, data } = useWorkExperienceDialog();

  const handleSubmit = async (_values: DeleteDialogValues, { setSubmitting }: FormikHelpers<DeleteDialogValues>) => {
    try {
      await deleteWorkExperienceAction(_values?.id);
      toast.success("Work experience deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={type === "deleteWorkExperience"} onOpenChange={closeDialog}>
      <Formik key={type} initialValues={{ id: data?.id ?? "" }} onSubmit={handleSubmit}>
        {({ isSubmitting, submitForm }) => (
          <Form>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p className="text-lg font-semibold mb-2">Are you sure you want to delete this work experience?</p>
                <p className="text-muted-foreground">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button onClick={closeDialog} variant="outline" type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  variant="destructive"
                  type="submit"
                  onClick={submitForm}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Work Experience"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
