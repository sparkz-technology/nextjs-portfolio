"use client";

import { useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import dayjs from 'dayjs';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, ChevronRight, ChevronLeft, CalendarIcon, Loader, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/image-uploader";
import { VideoUploader } from "@/components/video-uploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { Option, SearchableSelect } from "@/components/searchable-select";
import { toast } from "sonner";
import {
  addIconAction,
  createProjectAction,
  deleteIconAction,
  deleteProjectAction,
  updateProjectAction,
} from "./action";
import { useProjectDialog } from "@/lib/zustand/use-dialog-store";
import { IIcon, IProject } from "@/lib/type";

const projectLinkSchema = Yup.object().shape({
  type: Yup.string().required("Type is required"), // Validating type field
  href: Yup.string().url("Invalid URL").required("URL is required"), // Validating URL
  icon: Yup.object({
    id: Yup.string().required("Icon is required"), // Validating icon object with an `id` property
  }).required("Icon is required"), // Ensuring the `icon` field itself is present
});

const basicInfoSchema = Yup.object().shape({
  title: Yup.string().required("Required"),
  href: Yup.string().url("Invalid URL").required("Required"),
  startDate: Yup.string().required("Required"),
  endDate: Yup.string().required("Required"),
  active: Yup.boolean(),
});

const detailsSchema = Yup.object().shape({
  description: Yup.string().required("Required"),
  technologies: Yup.string().required("Required"),
});

const imgageBase64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;
const videoBase64Regex = /^data:video\/(mp4);base64,[A-Za-z0-9+/=]+$/;

const mediaSchema = Yup.object().shape({
  image: Yup.string()
    .trim()
    .test("is-url-or-base64", "Invalid", (value) => {
      if (!value) return false; // required validation
      const isUrl = Yup.string().url().isValidSync(value);
      const isBase64 = imgageBase64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Required."),
  video: Yup.string()
    .trim()
    .test("is-url-or-base64", "Invalid", (value) => {
      if (!value) return false; // required validation
      const isUrl = Yup.string().url().isValidSync(value);
      const isBase64 = videoBase64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Required."),
});

const linksSchema = Yup.object().shape({
  projectLinks: Yup.array().of(projectLinkSchema),
});

export function ProjectDialog({ iconList }: { iconList: IIcon[] }) {
  const { type, closeDialog, data, openDialog } = useProjectDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const isCreate = !data?.hasOwnProperty("id");

  const initialValues = {
    id: data?.id ?? "",
    title: data?.title ?? "",
    href: data?.href ?? "",
    startDate: dayjs(`1-${data?.startDate}`, "D-MMM-YY").format("YYYY-MM-DD") ?? "",
    endDate: dayjs(`1-${data?.endDate}`, "D-MMM-YY").format("YYYY-MM-DD") ?? "",
    description: data?.description ?? "",
    active: data?.active ?? false,
    technologies: Array.isArray(data?.technologies) ? data.technologies.join(",") : data?.technologies ?? "",
    projectLinks: data?.projectLinks?.map((link) => ({
      id: link?.id ?? "",
      type: link?.type ?? "",
      href: link?.href ?? "",
      icon: {
        id: link?.icon?.id ?? "",
        name: link?.icon?.name ?? "",
        value: link?.icon?.value ?? "",
      },
    })) ?? [
      {
        id: "",
        icon: { id: "", name: "", value: "" },
        href: "",
      },
    ],
    image: data?.image ?? "",
    video: data?.video ?? "",
    visibility: typeof data?.visibility === "boolean" ? data.visibility : false,
    sequenceValue: data?.sequenceValue ?? 0,
  };
  // @ts-expect-error - `initialValues` is not compatible with `IProject`
  const [formData, setFormData] = useState<IProject>(initialValues);

  const tabs = ["basic", "details", "media", "links"];
  const currentTabIndex = tabs.indexOf(activeTab);

  const handleTabSubmit = (
    values: Partial<typeof formData>,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setFormData((prevData) => ({ ...prevData, ...values }));
    setSubmitting(false);

    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    } else {
      handleFinalSubmit(values);
    }
  };

  const handleFinalSubmit = async (values: Partial<IProject>) => {
    try {
      const formvalues = {
        ...formData,
        ...values,
      };
      setIsLoading(true);
      const payload = {
        ...formvalues,
        id: data?.id,
        startDate: formvalues.startDate ? format(formvalues.startDate, "MMM-yy") : "",
        endDate: formvalues.endDate
          ? isToday(formvalues.endDate)
            ? "Present"
            : format(formvalues.endDate, "MMM-yy")
          : "",
        technologies:
          typeof formvalues.technologies === "string"
            ? (formvalues.technologies as string).split(",").map((tech) => tech.trim())
            : [],
        projectLinks: formvalues.projectLinks.map((link) => ({
          ...link,
          icon: link.icon ? { id: link.icon.id } : null,
        })),
      };
      if (isCreate) {
        // @ts-expect-error - `createProjectAction` is not compatible with `IProject`
        const { message, success } = await createProjectAction(payload);
        if (!success) throw new Error(message);
        toast.info("Project created  successfully");
      } else {
        // @ts-expect-error - `updateProjectAction` is not compatible with `IProject`
        const { message, success } = await updateProjectAction(payload);
        if (!success) throw new Error(message);
      }
      toast.info("Project updated  successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      // @ts-expect-error - `initialValues` is not compatible with `IProject`
      setFormData(initialValues);
      closeDialog();
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  return (
    <Dialog open={type == "project"} onOpenChange={closeDialog}>
      <Button type="button" variant="outline" onClick={() => openDialog("project")}>
        Create
      </Button>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle> {isCreate ? "Create" : "Update"} Project</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="px-4 py-2 border-b justify-between">
            {tabs.map((tab, index) => (
              <TabsTrigger key={tab} value={tab} disabled={index > currentTabIndex} className="flex-1 capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="flex-1 h-72">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                <TabsContent value="basic" className="mt-0 border-none p-0">
                  {/* @ts-expect-error -  `initialValues` is not compatible with `IProject` */}
                  <BasicInfoForm initialValues={initialValues} onSubmit={handleTabSubmit} />
                </TabsContent>
                <TabsContent value="details" className="mt-0 border-none p-0">
                  {/* @ts-expect-error -  `initialValues` is not compatible with `IProject` */}
                  <DetailsForm initialValues={initialValues} onSubmit={handleTabSubmit} />
                </TabsContent>
                <TabsContent value="media" className="mt-0 border-none p-0">
                    {/* @ts-expect-error -  `initialValues` is not compatible with `IProject` */}
                  <MediaForm initialValues={initialValues} onSubmit={handleTabSubmit} />
                </TabsContent>
                <TabsContent value="links" className="mt-0 border-none p-0 h-72">
                  {/* @ts-expect-error -  `initialValues` is not compatible with `IProject` */}
                  <LinksForm initialValues={initialValues} onSubmit={handleTabSubmit} iconList={iconList} />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
        <div className="px-4 py-2 border-t flex justify-between">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentTabIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button type="submit" form={`${activeTab}-form`}>
            {currentTabIndex === tabs.length - 1 ? (
              isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Loading...{" "}
                </>
              ) : isCreate ? (
                "Create"
              ) : (
                "Update"
              )
            ) : (
              "Next"
            )}
            {currentTabIndex < tabs.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type BasicInfoFormProps = {
  initialValues: Partial<IProject>;
  onSubmit: (
    values: {
      title: string | undefined;
      href: string | undefined;
      startDate: string | undefined;
      endDate: string | undefined;
      active: boolean | undefined;
    },
    formikHelpers: FormikHelpers<{
      title: string | undefined;
      href: string | undefined;
      startDate: string | undefined;
      endDate: string | undefined;
      active: boolean | undefined;
    }>
  ) => void;
};

function BasicInfoForm({ initialValues, onSubmit }: BasicInfoFormProps) {
  return (
    <Formik
      initialValues={{
        title: initialValues.title,
        href: initialValues.href,
        startDate: initialValues.startDate,
        endDate: initialValues.endDate,
        active: initialValues.active,
      }}
      enableReinitialize
      validationSchema={basicInfoSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form id="basic-form" className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Project Title
            </Label>
            <Field name="title" as={Input} id="title" className="mt-1" />
            <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <Label htmlFor="href" className="text-sm font-medium">
              Project URL
            </Label>
            <Field name="href" as={Input} id="href" className="mt-1" />
            <ErrorMessage name="href" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
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
            <div>
              <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
              <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={values.active}
              onCheckedChange={(checked) => setFieldValue("active", checked)}
            />
            <Label htmlFor="active" className="text-sm">
              Project is currently active
            </Label>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function DetailsForm({
  initialValues,
  onSubmit,
}: {
  initialValues: Partial<IProject>;
  onSubmit: (
    values: { description: string | undefined; technologies: string },
    formikHelpers: FormikHelpers<{ description: string | undefined; technologies: string }>
  ) => void;
}) {
  return (
    <Formik
      initialValues={{
        description: initialValues.description,
        technologies: Array.isArray(initialValues?.technologies)
          ? initialValues.technologies.join(",")
          : initialValues?.technologies ?? "",
      }}
      enableReinitialize
      validationSchema={detailsSchema}
      onSubmit={onSubmit}
    >
      {({}) => (
        <Form id="details-form" className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Project Description
            </Label>
            <Field name="description" as={Textarea} id="description" className="mt-1 h-32" />
            <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <Label htmlFor="technologies" className="text-sm font-medium">
              Technologies Used
            </Label>
            <Field
              name="technologies"
              as={Input}
              id="technologies"
              className="mt-1"
              placeholder="e.g., React, Node.js, MongoDB"
            />
            <div className="text-xs text-muted-foreground mt-1">Separate technologies with commas</div>
            <ErrorMessage name="technologies" component="div" className="text-red-500 text-xs mt-1" />
          </div>
        </Form>
      )}
    </Formik>
  );
}

function MediaForm({
  initialValues,
  onSubmit,
}: {
  initialValues: Partial<IProject>;
  onSubmit: (
    values: Partial<IProject>,
    formikHelpers: FormikHelpers<{
      image: string | undefined;
      video: string | undefined;
    }>
  ) => void;
}) {
  return (
    <Formik
      initialValues={{
        image: initialValues.image,
        video: initialValues.video,
      }}
      enableReinitialize
      validationSchema={mediaSchema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue, values }) => (
        <Form id="media-form" className="space-y-4">
          <div>
            <Label htmlFor="logo">Project Image</Label>
            <ImageUploader
              onUpload={(file) => setFieldValue("image", file)}
              imageUrl={values.image}
              fileName="project-image"
              onDelete={() => setFieldValue("image", null)}
            />
            <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
          </div>
          <div>
            <Label htmlFor="logo">Project Video</Label>
            <VideoUploader
              fileName="project-video"
              onUpload={(file) => setFieldValue("video", file)}
              videoUrl={values.video}
              onDelete={() => setFieldValue("video", null)}
            />
            <ErrorMessage name="video" component="div" className="text-red-500 text-sm" />
          </div>
        </Form>
      )}
    </Formik>
  );
}
interface Icon {
  id: string;
  name: string;
}

interface ProjectLink {
  type: string;
  href: string;
  icon: Icon | null;
}

interface LinksFormProps {
  initialValues: {
    projectLinks: ProjectLink[];
  };
  onSubmit: (values: { projectLinks: ProjectLink[] }) => void;
  iconList: Icon[];
}

function LinksForm({ initialValues, onSubmit, iconList }: LinksFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleAddOption = async (value: { value: string; label: string }) => {
    try {
      setIsLoading(true);
      const { message, success } = await addIconAction(value);
      if (!success) throw new Error(message);

      toast.info("Icon  created successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteOption = async (value: string) => {
    try {
      setIsLoading(true);
      const { message, success } = await deleteIconAction(value);
      if (!success) throw new Error(message);

      toast.info("Icon deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        projectLinks: initialValues.projectLinks,
      }}
      enableReinitialize
      validationSchema={linksSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form id="links-form" className="space-y-4">
          <FieldArray name="projectLinks">
            {({ push, remove }) => (
              <div>
                <Label className="text-sm font-medium">Project Links</Label>
                {values.projectLinks.map((_, index) => (
                  <div key={index} className="space-y-2 mt-2 p-2 border rounded-md">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label htmlFor={`projectLinks.${index}.type`} className="text-xs">
                          Type
                        </Label>
                        <Field name={`projectLinks.${index}.type`} as={Input} className="mt-1" />
                        <ErrorMessage
                          name={`projectLinks.${index}.type`}
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`projectLinks.${index}.icon`} className="text-xs">
                          Icon
                        </Label>
                        <div className="mt-1">
                          <SearchableSelect
                            loading={isLoading}
                            name={`projectLinks.${index}.icon`}
                            options={iconList.map((icon) => ({ value: icon.id, label: icon.name }))}
                            value={values.projectLinks[index].icon?.id || ""}
                            onAddOption={handleAddOption}
                            onDeleteOption={handleDeleteOption}
                            onChange={(selectedOption) =>
                              setFieldValue(`projectLinks.${index}.icon`, { id: (selectedOption as Option)?.value })
                            }
                          />
                        </div>
                        <ErrorMessage
                          name={`projectLinks.${index}.icon`}
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="self-end"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`projectLinks.${index}.href`} className="text-xs">
                        URL
                      </Label>
                      <Field name={`projectLinks.${index}.href`} as={Input} className="mt-1" />
                      <ErrorMessage
                        name={`projectLinks.${index}.href`}
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => push({ type: "", href: "", icon: "" })}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
            )}
          </FieldArray>
        </Form>
      )}
    </Formik>
  );
}

interface DeleteDialogValues {
  id: string;
}

export const DeleteDialog: React.FC = () => {
  const { type, closeDialog, data } = useProjectDialog();

  const handleSubmit = async (_values: DeleteDialogValues, { setSubmitting }: FormikHelpers<DeleteDialogValues>) => {
    try {
      await deleteProjectAction(_values?.id);
      toast.success("Project deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={type === "deleteProject"} onOpenChange={closeDialog}>
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
                <p className="text-lg font-semibold mb-2">Are you sure you want to delete this project?</p>
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
                    "Delete Project"
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
