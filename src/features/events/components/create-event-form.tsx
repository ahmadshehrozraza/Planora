"use client";

import React, { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { DatePicker } from "@/components/date-picker";
import { ScrollTimePicker } from "@/components/time-picker";
import { createEventSchema } from "../schemas";

import { useCreateEvent } from "@/features/events/api/use-create-event";
import { uploadFileAction } from "@/lib/upload-file";
import { MapPin, CloudUpload, Paperclip, X, Loader2 } from "lucide-react";

interface CreateEventFormProps {
  onCancel?: () => void;
  workspaceId: string; 
  projects: any[];    
  sprints?: any[];
}

export const CreateEventForm = ({ onCancel, workspaceId, projects, sprints }: CreateEventFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent();

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      date: new Date(), 
      endDate: null,
      workspaceId: workspaceId,
      projectId: "none", 
      sprintId: "none",
      description: "",
      location: "",
      notes: "",
      status: "SCHEDULED",
      attachments: [],
    },
  });

  const selectedProjectId = form.watch("projectId");
  const attachments = form.watch("attachments") || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    const newAttachments = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFileAction(formData, "files");
        
        if (res.success && res.fileUrl) {
          newAttachments.push({
            name: res.fileName,
            url: res.fileUrl,
            size: res.fileSize,
            type: res.fileType,
          });
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      form.setValue("attachments", [...attachments, ...newAttachments]);
    } catch (error) {
      toast.error("Upload process failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    form.setValue("attachments", newAttachments);
  };

  const onSubmit = (values: z.infer<typeof createEventSchema>) => {
    const finalPayload = {
      ...values,
      projectId: values.projectId === "none" ? undefined : values.projectId,
      sprintId: values.sprintId === "none" ? undefined : values.sprintId,
    };

    createEvent(finalPayload, { 
      onSuccess: () => {
        form.reset();
        onCancel?.();
      } 
    });
  };

  const isPending = isCreatingEvent || isUploading;

  return (
    <Card className="w-full h-fit border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Create New Event</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Sprint Review" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date & Time</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              if (!date) return;
                              const newDate = new Date(date);
                              const currentTime = field.value || new Date();
                              newDate.setHours(currentTime.getHours());
                              newDate.setMinutes(currentTime.getMinutes());
                              field.onChange(newDate);
                            }}
                            disabled={isPending}
                            placeholder="Select date"
                            className="w-full h-10 px-3"
                          />
                        </FormControl>
                      </div>
                      <div className="flex-shrink-0 w-full sm:w-[120px]">
                        <FormControl>
                          <ScrollTimePicker date={field.value} setDate={field.onChange} className="h-10 px-3" />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date & Time (Optional)</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <FormControl>
                          <DatePicker
                            value={field.value || undefined}
                            onChange={(date) => {
                              if (!date) { field.onChange(null); return; }
                              const newDate = new Date(date);
                              const currentTime = field.value || new Date();
                              newDate.setHours(currentTime.getHours());
                              newDate.setMinutes(currentTime.getMinutes());
                              field.onChange(newDate);
                            }}
                            disabled={isPending}
                            placeholder="Select date"
                            className="w-full h-10 px-3"
                          />
                        </FormControl>
                      </div>
                      <div className="flex-shrink-0 w-full sm:w-[120px]">
                        <FormControl>
                          <ScrollTimePicker 
                            date={field.value || undefined} 
                            setDate={(d) => field.onChange(d)} 
                            className="h-10 px-3" 
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location or Meeting Link</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input {...field} value={field.value || ""} placeholder="Zoom link or Room 204" className="pl-9" disabled={isPending} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope (Project)</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("sprintId", "none");
                      }}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="text-muted-foreground font-medium italic">Entire Workspace</SelectItem>
                        {projects?.map((proj) => (
                          <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProjectId && selectedProjectId !== "none" && sprints && sprints.length > 0 && (
                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Sprint (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sprint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" className="text-muted-foreground font-medium italic">No Sprint (Project Level)</SelectItem>
                          {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} placeholder="What is this event about?" className="min-h-[80px] resize-none" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Attachments & Pre-reads</FormLabel>
              <div className="flex flex-col gap-3">
                <div 
                  onClick={() => !isPending && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center transition ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50 hover:border-primary/50'}`}
                >
                  {isUploading ? (
                    <Loader2 className="size-8 text-primary animate-spin mb-2" />
                  ) : (
                    <CloudUpload className="size-8 text-muted-foreground mb-2" />
                  )}
                  <p className="text-sm font-medium text-foreground">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDFs, presentations, or images</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange}
                  disabled={isPending} 
                />

                {attachments.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border border-border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="size-4 shrink-0 text-primary" />
                          <span className="text-xs font-medium truncate">{file.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="size-6 text-muted-foreground hover:text-destructive shrink-0" 
                          onClick={() => removeAttachment(idx)}
                          disabled={isPending}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormItem>

            <Separator className="my-4" />

            <div className="flex items-center justify-end gap-3">
              {onCancel && (
                <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px] bg-blue-600 hover:bg-blue-700">
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};