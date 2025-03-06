"use client";

import { toast } from "sonner";
import * as Yup from "yup";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createEducationAction, updateEducationAction, deleteEducationAction } from "@/app/dashboard/education/action";
import { useEducationDialog } from "@/lib/zustand/use-dialog-store";
import { ImageUploader } from "@/components/image-uploader";

const validationSchema = Yup.object().shape({
  school: Yup.string().required("School name is required"),
  link: Yup.string().url("Invalid URL").required("Company website is required"),
  degree: Yup.string().required("Degree is required"),
  logoUrl: Yup.mixed().required("Company logo is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().min(Yup.ref("startDate"), "End date must be after start date"),
});

export interface IEducation {
  id: string;
  school: string;
  link: string;
  degree: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
}

export function EducationDialog() {
  const { type, closeDialog, data, openDialog } = useEducationDialog();
  const workExperienceData = (data ?? {}) as IEducation;
  const isCreate = !data || !(data?.id ?? false);

  const handleSubmit = async (values: IEducation, { resetForm }: FormikHelpers<IEducation>) => {
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
        const { success, message } = await createEducationAction(payload);
        if (!success) {
          throw new Error(message);
        }
        toast.success("Education created successfully");
        return;
      }
      const { success, message } = await updateEducationAction(payload);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Education updated successfully");
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
    <Dialog open={type == "education"} onOpenChange={closeDialog}>
      <Button onClick={() => openDialog("education")} variant="outline">
        Create
      </Button>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create" : "Update"} Education</DialogTitle>
          <DialogDescription>
            {isCreate ? "Enter" : "Update"} the details of your education here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            id: workExperienceData.id ?? "",
            school: workExperienceData.school ?? "",
            link: workExperienceData.link ?? "",
            degree: workExperienceData.degree ?? "",
            startDate:   data?.startDate ? parseCustomDate(data?.startDate) : "",
            endDate:  data?.endDate ? parseCustomDate(data.endDate) :"", 
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values, isSubmitting, submitForm }) => (
            <Form className="space-y-4 ">
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="school">School</Label>
                  <Field as={Input} id="school" name="school" placeholder="Enter school name" />
                  <ErrorMessage name="school" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <Label htmlFor="link">School Website</Label>
                  <Field as={Input} id="link" name="link" placeholder="https://example.com" />
                  <ErrorMessage name="link" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Field as={Input} id="degree" name="degree" placeholder="Enter your degree" />
                  <ErrorMessage name="degree" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="logo">School Logo</Label>
                <ImageUploader
                  onUpload={(file) => setFieldValue("logoUrl", file)}
                  imageUrl={values.logoUrl}
                  fileName={values.school}
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
  const { type, closeDialog, data } = useEducationDialog();

  const handleSubmit = async (_values: DeleteDialogValues, { setSubmitting }: FormikHelpers<DeleteDialogValues>) => {
    try {
      await deleteEducationAction(_values?.id);
      toast.success("Education deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={type === "deleteEducation"} onOpenChange={closeDialog}>
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
                <p className="text-lg font-semibold mb-2">Are you sure you want to delete this education?</p>
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
                    "Delete Education"
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
