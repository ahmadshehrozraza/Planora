"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import  Image   from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "../schemas";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}   from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "../api/use-create-project";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";



interface CreateProjectFormProps {
    onCancel?: () => void;
};

export const CreateProjectForm = ({ onCancel}: CreateProjectFormProps) => {

    const workspaceId = useWorkspaceId();

    if( !workspaceId ) return;

    const router = useRouter();
    const { mutate, isPending } = useCreateProject();

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            workspaceId,
        }, 
    });

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            imageUrl: values.imageUrl instanceof File ? values.imageUrl : "",
        };

        mutate({ form: finalValues}, {
            onSuccess: ( { data }) => {
                form.reset();
                router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            form.setValue("imageUrl", file); 
        }
    }
    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">
                    Create a new Project
                </CardTitle>
            </CardHeader>

            <div className="px-3">
                <Separator/>
            </div>
            <CardContent className="p-4 ">
                <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex h-full flex-col gap-y-9">
                    <FormField 
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Project Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                className="mb-4"
                                    {...field}
                                    placeholder="Enter project name"
                                 />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />   
                    <FormField 
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <div className="flex flex-col gap-y-2">
                                <div className="flex items-center gap-x-5">
                                    {field.value ? (
                                        <div className="size-[72px] relative rounded-md overflow-hidden">
                                            <Image
                                            alt="Logo"
                                                fill
                                                className="object-cover"
                                                src={
                                                    typeof field.value === "string"
                                                        ? field.value
                                                        : field.value
                                                        ? URL.createObjectURL(field.value as File)
                                                        : ""
                                                    }
                                            />
                                        </div>
                                    ): (
                                        <Avatar className="size-[72px]">
                                            <AvatarFallback>
                                                <ImageIcon className="size-[36px] text-neutral-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex flex-col">
                                        <p className="text-sm">Project Icon</p>
                                        <p className="text-sm text-muted-foreground">
                                            JPG, PNG, SVG, JPEG max 1mb
                                            </p>
                                            <input
                                                className="hidden"
                                                type="file"
                                                accept=".jpg, .png, .jpeg, .svg"
                                                ref={inputRef}
                                                onChange={handleImageChange}
                                                disabled={isPending}
                                                />

                                                {field.value ? (
                                                <Button
                                                type="button"
                                                disabled={isPending}
                                                variant="destructive"
                                                size="xs"
                                                className="w-fit mt-2"
                                                onClick={() => {
                                                    field.onChange(null);
                                                    if (inputRef.current){
                                                        inputRef.current.value = "";
                                                    }
                                                }}
                                                >
                                                    Remove Image
                                                </Button>
                                                ) : ( 
                                                <Button
                                                type="button"
                                                disabled={isPending}
                                                variant="teritrary"
                                                size="xs"
                                                className="w-fit mt-2"
                                                onClick={() => inputRef.current?.click()}
                                                >
                                                    Upload Image
                                                </Button>)}
                                        </div>
                                </div>
                            </div>
                        )}
                        />
                    </div>

                    <div className="mb-5 mt-5">
                        <Separator  />
                    </div>

                    <div className="flex items-center justify-between">
                    <Button
                    type="button"
                    size="sm"
                    variant="secondry"
                    onClick={onCancel}
                    disabled={isPending}
                    className={cn(!onCancel && "invisible")}
                    >
                    Cancel
                    </Button>

                    <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    >
                    Create Project
                    </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
    )
};