"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { AlertTriangle, Loader, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as Yup from "yup";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSkillAction, deleteSkillAction, updateSkillAction } from "@/app/dashboard/skill/action";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSkillDialog } from "@/lib/zustand/use-dialog-store";

export const skillSchema = Yup.object().shape({
  name: Yup.string().required("Please enter a name"),
});

export const SkillDialog: React.FC = () => {
  const { type, closeDialog, data, openDialog } = useSkillDialog();

  const isCreate = !data?.hasOwnProperty("id");
  const skillData = data as { id: string; name: string };

  const handleSubmit = async (
    values: { name: string },
    { setSubmitting }: FormikHelpers<{ name: string }>
  ) => {
    try {
      let success = false;
      let message = "";
  
      if (isCreate) {
        const result = await createSkillAction(values.name);
        success = result.success;
        message = result.message;
      } else if (data?.id) {
        const result = await updateSkillAction({ id: data.id, name: values.name });
        success = result.success;
        message = result.message;
      } else {
        throw new Error("Skill ID is missing or invalid");
      }
  
      if (!success) {
        throw new Error(message);
      }
  
      if (isCreate) {
        toast.info("Skill created successfully");
      } else {
        toast.info("Skill updated successfully");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };
  

  return (
    <Dialog open={type == "skill"} onOpenChange={closeDialog}>
      <Button type="button" variant="outline" onClick={() => openDialog("skill")}>
        Create
      </Button>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create" : "Update"} skill</DialogTitle>
          <DialogDescription>
            {isCreate ? "Enter" : "Update"} the details of your skill here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Formik
          key={type}
          initialValues={{ name: skillData?.name ?? "" }}
          validationSchema={skillSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, submitForm }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="message">Skill name</Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  className={cn(errors.name && touched.name ? "border-red-500" : "", "w-full")}
                  rows={3}
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
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
};

export const DeleteDialog: React.FC = () => {
  const { type, closeDialog, data } = useSkillDialog();

  interface DeleteDialogValues {
    id: string;
  }

  const handleSubmit = async (_values: DeleteDialogValues, { setSubmitting }: FormikHelpers<DeleteDialogValues>) => {
    try {
      await deleteSkillAction(_values?.id);
      toast.info("Skill deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={type === "deleteSkill"} onOpenChange={closeDialog}>
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
                <p className="text-lg font-semibold mb-2">Are you sure you want to delete this skill?</p>
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
                    "Delete Skill"
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
