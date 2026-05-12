"use client";

import React, { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { ScrollTimePicker } from "@/components/time-picker";

import { createEventSchema } from "../schemas";
import { useConfirm } from "@/hooks/use-confirm";

import { useUpdateEvent } from "@/features/events/api/use-update-event";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { uploadFileAction } from "@/lib/upload-file";
import { cn } from "@/lib/utils";
import { Trash2, MapPin, CloudUpload, Paperclip, X, Loader2 } from "lucide-react";

interface EditEventFormProps {
  onCancel?: () => void;
  workspaceId: string;
  projects: any[];
  sprints?: any[];
  initialValues: any;
}

export const EditEventForm = ({ onCancel, workspaceId, projects, sprints, initialValues }: EditEventFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateEvent, isPending: isUpdatingEvent } = useUpdateEvent();
  const { mutate: deleteEvent, isPending: isDeletingEvent } = useDeleteEvent();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Event",
    "Are you sure you want to delete this event? This action cannot be undone.",
    "destructive"
  );

  const isPending = isUpdatingEvent || isDeletingEvent || isUploading;

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: initialValues.title || "",
      date: initialValues.date ? new Date(initialValues.date) : new Date(),
      endDate: initialValues.endDate ? new Date(initialValues.endDate) : null,
      workspaceId: workspaceId,
      projectId: initialValues.projectId || "none", 
      sprintId: initialValues.sprintId || "none",
      description: initialValues.description || "",
      location: initialValues.location || "",
      notes: initialValues.notes || "",
      status: initialValues.status || "SCHEDULED",
      attachments: initialValues.attachments || [],
    },
  });

  const selectedProjectId = form.watch("projectId");
  const selectedStatus = form.watch("status");
  const attachments = form.watch("attachments") || [];

  const { data: permissions } = useGetPermissions( workspaceId );
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
  const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.EVENT_UPDATE);

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

    updateEvent(
      { eventId: initialValues.id, json: finalPayload },
      { onSuccess: () => onCancel?.() }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteEvent({ eventId: initialValues.id, workspaceId });
  };

  return (
    <Card className="w-full h-fit border-none shadow-none mb-4">
      <ConfirmDialog />
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Edit Event</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Sprint Review" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="MISSED">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormLabel>End Date & Time</FormLabel>
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
                          <ScrollTimePicker date={field.value || undefined} setDate={(d) => field.onChange(d)} className="h-10 px-3" />
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
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input {...field} value={field.value || ""} placeholder="Zoom link or Physical Room" className="pl-9" disabled={isPending} />
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
                      <FormLabel>Link to Sprint</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sprint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" className="text-muted-foreground font-medium italic">No Sprint</SelectItem>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agenda & Meeting Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""} 
                      placeholder={selectedStatus === "COMPLETED" ? "What was decided in the meeting?" : "Agenda items for this meeting..."} 
                      className={cn("min-h-[100px] resize-none", selectedStatus === "COMPLETED" && "bg-emerald-50/30 dark:bg-emerald-900/10")} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Attachments</FormLabel>
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
                  <p className="text-sm font-medium text-foreground">Click to add new files</p>
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

            {allowed && (
              <>
            <Separator className="my-4" />
            <div className="flex items-center justify-end gap-3">
              {onCancel && (
                <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={isPending}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isPending} className="min-w-[120px]">
                {isUpdatingEvent ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            </>
            )}
          </form>
        </Form>
      </CardContent>

    </Card>
  );
};