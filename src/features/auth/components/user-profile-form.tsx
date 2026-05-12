"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Calendar,
  Save,
  Trash2,
  ImageIcon,
  ArrowLeftIcon,
  Loader2,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useUpdateUser } from "../api/use-update-user";
import { updateProfileSchema } from "../schemas";
import { useCurrent } from "../api/use-current";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageLoader } from "@/components/page-loader";
import { SecurityActionModal, SecurityActionType } from "./security-action-modal";

export const UserProfileForm = () => {
  const { data: user, isLoading } = useCurrent();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateUser();
  const [activeAction, setActiveAction] = useState<SecurityActionType>(null);
  const [imageSizeError, setImageSizeError] = useState(false);

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        imageUrl: user.image || "",
      });
    }
  }, [user, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setImageSizeError(true);
      } else {
        setImageSizeError(false);
      }
      form.setValue("imageUrl", file);
    }
  };

  const onSubmit = (values: z.infer<typeof updateProfileSchema>) => {
    if (imageSizeError) return;

    const finalValues = {
      name: values.name,
      imageFile: values.imageUrl instanceof File ? values.imageUrl : null,
      imageUrl: typeof values.imageUrl === "string" ? values.imageUrl : null,
    };

    mutate(finalValues);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-8">

      <SecurityActionModal 
        isOpen={activeAction !== null} 
        actionType={activeAction} 
        onClose={() => setActiveAction(null)} 
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button size="sm" variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4 mr-2" />
          Back to App
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <div className="flex flex-col items-center gap-4">
                      {field.value ? (
                        <div className="size-28 relative rounded-full overflow-hidden border-4 border-background shadow-md">
                          <Image
                            alt="User Profile"
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
                        <Avatar className="size-28 border-4 border-background shadow-md">
                          <AvatarFallback className="bg-muted">
                            <ImageIcon className="size-10 text-muted-foreground/50" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col items-center gap-2">
                        <input
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .jpeg, .svg"
                          ref={inputRef}
                          onChange={handleImageChange}
                        />
                        {field.value ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              field.onChange(null);
                              setImageSizeError(false);
                              if (inputRef.current) inputRef.current.value = "";
                            }}
                          >
                            Remove Image
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload Photo
                          </Button>
                        )}
                        {imageSizeError ? (
                          <p className="text-xs text-destructive font-medium">Max file size is 1MB</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">JPG, PNG or SVG (max. 1MB)</p>
                        )}
                      </div>
                    </div>
                  )}
                />

                <div className="flex-1 w-full space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your full name"  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    className="mt-4 f"
                    disabled={isPending || imageSizeError}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isPending ? "Saving changes..." : "Save Changes"}
                  </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <CardTitle>Security & Access</CardTitle>
          </div>
          <CardDescription>Manage your email address and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Email Address</span>
                <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                  {user.email}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveAction("email")}>
              Change Email
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <KeyRound className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Password</span>
                <span className="text-sm text-muted-foreground">
                  ••••••••••••
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveAction("password")}>
              Update Password
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="p-2 bg-muted rounded-full">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Account Created</span>
              <span className="text-sm text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "N/A"}
              </span>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="shadow-sm border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Irreversible actions regarding your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                Permanently delete your account and remove all your active access from workspaces. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setActiveAction("delete")}
              className="shrink-0"
            >
              <Trash2 className="size-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};