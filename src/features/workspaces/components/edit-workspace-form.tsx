"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema } from "../schemas";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {
  const { mutate, isPending } = useUpdateWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSizeError, setImageSizeError] = useState(false);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      imageUrl: initialValues?.imageUrl ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    if (imageSizeError) return;

    const finalValues = {
      name: values.name,
      imageFile: values.imageUrl instanceof File ? values.imageUrl : null,
      imageUrl: typeof values.imageUrl === "string" ? values.imageUrl : null,
    };

    mutate({
      workspaceId: initialValues.id,
      values: finalValues
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 1024 * 1024; 
      if (file.size > maxSize) {
        setImageSizeError(true);
        form.setValue("imageUrl", file);
      } else {
        setImageSizeError(false);
        form.setValue("imageUrl", file);
      }
    }
  };

  return (
    <Card className="w-full border-border shadow-sm bg-card">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-xl">General Information</CardTitle>
        <CardDescription>Update your workspace name and logo.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex h-full flex-col gap-y-8">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <div className="space-y-2 flex items-center gap-x-8">
                    {field.value ? (
                      <div className="size-20 lg:size-24 relative rounded-full overflow-hidden border">
                        <Image
                          alt="Workspace Logo"
                          fill
                          className="object-cover"
                          src={
                            typeof field.value === "string"
                              ? field.value
                              : URL.createObjectURL(field.value as File)
                          }
                        />
                      </div>
                    ) : (
                      <Avatar className="size-20 lg:size-24 border">
                        <AvatarFallback>
                          <ImageIcon className="size-10 text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col gap-y-2">
                      <p className="text-sm font-medium">Workspace Icon</p>
                      {imageSizeError ? (
                        <p className="text-xs text-red-600 font-medium">Image exceeds 1MB limit</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">JPG, PNG, SVG, JPEG max 1mb</p>
                      )}
                      <input
                        className="hidden"
                        type="file"
                        accept=".jpg, .png, .jpeg, .svg"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="outline"
                          size="sm"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                        {field.value && (
                          <Button
                            type="button"
                            disabled={isPending}
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              field.onChange(null);
                              setImageSizeError(false);
                              if (inputRef.current) inputRef.current.value = "";
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter workspace name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "hidden")}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending || imageSizeError}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};