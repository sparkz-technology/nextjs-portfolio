"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, type FieldProps, FieldArray } from "formik";
import * as Yup from "yup";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Mail, Phone, Globe, User, FileText, PhoneCall, Loader, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateAboutAction } from "./action";
import { Label } from "@/components/ui/label";
import { type Option, SearchableSelect } from "@/components/searchable-select";
import type { IIcon } from "@/lib/type";
import { addIconAction, deleteIconAction } from "../action";
import IconRenderer from "@/components/icon-renderer";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must not exceed 50 characters.")
    .required("Name is required"),
  initials: Yup.string()
    .matches(/^[A-Z]{2}$/, "Initials must be two uppercase letters.")
    .required("Initials are required"),
  url: Yup.string().url("Please enter a valid URL.").required("Website URL is required"),
  location: Yup.string()
    .min(2, "Location must be at least 2 characters.")
    .max(100, "Location must not exceed 100 characters.")
    .required("Location is required"),
  locationLink: Yup.string().url("Please enter a valid location URL.").required("Location link is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must not exceed 1000 characters.")
    .required("Description is required"),
  summary: Yup.string()
    .min(50, "Summary must be at least 50 characters.")
    .max(500, "Summary must not exceed 500 characters.")
    .required("Summary is required"),
  avatarUrl: Yup.string().url("Please enter a valid avatar URL.").required("Avatar URL is required"),
  email: Yup.string().email("Please enter a valid email address.").required("Email is required"),
  tel: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number.")
    .required("Phone number is required"),
  socialLinks: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Name is required"),
        href: Yup.string().url("Invalid URL").required("URL is required"),
        icon: Yup.object()
          .shape({
            id: Yup.string().required("Icon is required"),
          })
          .required("Icon is required"),
      })
    )
    .required("Social links are required"),
});

type AdminDataType = {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  email: string;
  tel: string;
  socialLinks: {
    id: string;
    name: string;
    href: string;
    icon: {
      id: string;
      value: string;
    };
  }[];
};

type IAbout = {
  name?: string | null;
  initials?: string | null;
  url?: string | null;
  location?: string | null;
  locationLink?: string | null;
  description?: string | null;
  summary?: string | null;
  avatarUrl?: string | null;
  Contact?: {
    email?: string | null;
    tel?: string | null;
    social?: {
      id?: string | null;
      name?: string | null;
      url?: string | null;
      icon?: {
        id?: string | null;
        value?: string | null;
      };
    }[];
  };
};

export function AdminDataManager({
  initialData,
  iconList = [],
}: {
  initialData: IAbout | undefined | null;
  iconList: IIcon[];
}) {
  const [formState, setFormState] = useState({ isEditing: false, isSubmitting: false });
  const initialValues = {
    name: initialData?.name || "",
    initials: initialData?.initials || "",
    url: initialData?.url || "",
    location: initialData?.location || "",
    locationLink: initialData?.locationLink || "",
    description: initialData?.description || "",
    summary: initialData?.summary || "",
    avatarUrl: initialData?.avatarUrl || "",
    email: initialData?.Contact?.email || "",
    tel: initialData?.Contact?.tel || "",
    socialLinks: initialData?.Contact?.social?.map((link) => ({
      id: link.id || "",
      name: link.name || "",
      href: link.url || "",
      icon: { id: link?.icon?.id || "", value: link?.icon?.value || "" },
    })) || [
      {
        id: "",
        name: "",
        href: "",
        icon: { id: "", value: "" },
      },
    ],
  };
  const handleSubmit = async (values: AdminDataType) => {
    try {
      setFormState({ isEditing: true, isSubmitting: true });
      const { success, message } = await updateAboutAction(values);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Your changes have been saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setFormState({ isEditing: false, isSubmitting: false });
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleAddOption = async (value: { value: string; label: string }) => {
    try {
      setIsLoading(true);
      const { message, success } = await addIconAction(value, "dashboard/about");
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
      const { message, success } = await deleteIconAction(value, "dashboard/about");
      if (!success) throw new Error(message);

      toast.info("Icon deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-4 sm:space-y-0">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">About</CardTitle>
        <div className="flex items-center space-x-4">
          {formState.isEditing && (
            <Button type="submit" form="admin-data-form" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader className="w-6 h-6 animate-spin" /> : null} Update
            </Button>
          )}
          <Button onClick={() => setFormState((prev) => ({ ...prev, isEditing: !prev.isEditing }))}>
            {formState.isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {formState.isEditing ? (
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ setFieldValue, values }) => (
              <Form id="admin-data-form" className="space-y-8 mb-20">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="w-full flex justify-start mb-6 overflow-x-auto">
                    <TabsTrigger value="basic" className="flex items-center justify-center ">
                      <User className="w-4 h-4 mr-2" />
                      <span>Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center justify-center ">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center justify-center ">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      <span>Contact & Social</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-6">
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                          </Label>
                          <Field name="name" as={Input} placeholder="Your full name" />
                          <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div>
                          <Label
                            htmlFor="initials"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Initials
                          </Label>
                          <Field name="initials" as={Input} placeholder="SG" maxLength={2} />
                          <ErrorMessage name="initials" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="avatarUrl"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Avatar URL
                        </Label>
                        <Field name="avatarUrl" as={Input} placeholder="/images/me.jpg" />
                        <ErrorMessage name="avatarUrl" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Location
                        </Label>
                        <Field name="location" as={Input} placeholder="City, State, Country" />
                        <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label
                          htmlFor="locationLink"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Location Link
                        </Label>
                        <Field name="locationLink" as={Input} placeholder="https://maps.google.com/..." />
                        <ErrorMessage name="locationLink" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </TabsContent>
                    <TabsContent value="content" className="space-y-4">
                      <div>
                        <Label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Summary (Markdown)
                        </Label>
                        <Field name="summary">
                          {({ field }: FieldProps) => (
                            <MDEditor
                              value={field.value}
                              onChange={(value) => setFieldValue("summary", value)}
                              preview="edit"
                              height={200}
                              visibleDragbar={false}
                              textareaProps={{
                                placeholder: "Write your summary here...",
                              }}
                            />
                          )}
                        </Field>
                        <ErrorMessage name="summary" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Description
                        </Label>
                        <Field
                          name="description"
                          as={Textarea}
                          placeholder="A detailed description of your skills and experience"
                          className="resize-none h-40"
                        />
                        <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </TabsContent>
                    <TabsContent value="contact" className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </Label>
                          <Field name="email" as={Input} placeholder="you@example.com" />
                          <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="tel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </Label>
                          <Field name="tel" as={Input} placeholder="+1234567890" />
                          <ErrorMessage name="tel" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Website
                          </Label>
                          <Field name="url" as={Input} placeholder="https://example.com" />
                          <ErrorMessage name="url" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                      <FieldArray name="socialLinks">
                        {({ push, remove }) => (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {values.socialLinks.map((_, index) => (
                              <div key={index} className="space-y-2 mt-2 p-2 border rounded-md">
                                <div className="flex space-x-2">
                                  <div className="flex-1">
                                    <Label htmlFor={`socialLinks.${index}.name`} className="text-xs">
                                      Name
                                    </Label>
                                    <Field name={`socialLinks.${index}.name`} as={Input} className="mt-1" />
                                    <ErrorMessage
                                      name={`socialLinks.${index}.name`}
                                      component="div"
                                      className="text-red-500 text-xs mt-1"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label htmlFor={`socialLinks.${index}.icon`} className="text-xs">
                                      Icon
                                    </Label>
                                    <div className="mt-1">
                                      <Field name={`socialLinks.${index}.icon`}>
                                        {({ field }: FieldProps) => (
                                          <SearchableSelect
                                            loading={isLoading}
                                            options={iconList.map((icon) => ({ value: icon.id, label: icon.name }))}
                                            value={field.value?.id || ""}
                                            onChange={(selectedOption) =>
                                              setFieldValue(`socialLinks.${index}.icon`, {
                                                id: (selectedOption as Option)?.value,
                                              })
                                            }
                                            onAddOption={handleAddOption}
                                            onDeleteOption={handleDeleteOption}
                                          />
                                        )}
                                      </Field>
                                    </div>
                                    <ErrorMessage
                                      name={`socialLinks.${index}.icon.id`}
                                      component="div"
                                      className="text-red-500 text-xs ml-1 mt-1"
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
                                  <Label htmlFor={`socialLinks.${index}.href`} className="text-xs">
                                    URL
                                  </Label>
                                  <Field name={`socialLinks.${index}.href`} as={Input} className="mt-1" />
                                  <ErrorMessage
                                    name={`socialLinks.${index}.href`}
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
                              onClick={() => push({ type: "", href: "", icon: { id: "" } })}
                              className="w-full mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Link
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </TabsContent>
                  </div>
                </Tabs>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="space-y-8 mb-20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={initialValues.avatarUrl} alt={initialValues.name} />
                <AvatarFallback>{initialValues.initials}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold">{initialValues.name}</h2>
                <a
                  href={initialValues.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center justify-center sm:justify-start mt-2"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {initialValues.location}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{initialValues.summary}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">About Me</h3>
                <p className="text-muted-foreground">{initialValues.description}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`mailto:${initialValues.email}`}
                  className="flex items-center text-muted-foreground hover:text-primary"
                >
                  <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{initialValues.email}</span>
                </a>
                <a
                  href={`tel:${initialValues.tel}`}
                  className="flex items-center text-muted-foreground hover:text-primary"
                >
                  <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{initialValues.tel}</span>
                </a>
                <a
                  href={initialValues.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted-foreground hover:text-primary"
                >
                  <Globe className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{initialValues.url}</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Social Links</h3>
              <div className="flex flex-wrap gap-4">
                {initialValues.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary flex items-center"
                  >
                    <IconRenderer iconName={link.icon?.value as string} />
                    <span className="ml-2">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
