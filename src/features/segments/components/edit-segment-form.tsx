"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { ImageIcon, AlertCircle, Divide, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@/features/projects/schemas";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { ProjectStatus } from "@/features/projects/types";
import { DummySegment, SegmentStatus } from "../types";
import { createSegmentSchema, editSegmentSchema } from "../schemas";

interface EditSegmentFormProps {
    initialValues: DummySegment;
    onCancel?: () => void;
}

export const EditSegmentForm = ({ onCancel, initialValues }: EditSegmentFormProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateProject();
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageSizeError, setImageSizeError] = useState(false);

    // if (!workspaceId) return;

    const form = useForm<z.infer<typeof editSegmentSchema>>({
    resolver: zodResolver(editSegmentSchema),
    defaultValues: {
        ...initialValues,
    },
});

    const onSubmit = (values: z.infer<typeof createSegmentSchema>) => {
        if (imageSizeError) {
            return; 
        }

        console.log(values);

        // mutate({ form: finalValues }, {
        //   onSuccess: ({ data }) => {
        //     form.reset();
        //     router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
        //   }
        // });
    };

    return(
            <Card className="w-full h-fit border-none shadow-none">

                <CardContent className="">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Segment Name *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter segment name"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="segmentStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Segment Status</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={isPending}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={SegmentStatus.ACTIVE}>
                                                            <div className="flex items-center gap-x-2">
                                                                Active
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={SegmentStatus.ON_HOLD}>
                                                            <div className="flex items-center gap-x-2">
                                                                On Hold
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={SegmentStatus.OVER_DUE}>
                                                            <div className="flex items-center gap-x-2">
                                                                Over Due
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={SegmentStatus.COMPLETED}>
                                                            <div className="flex items-center gap-x-2">
                                                                Completed
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="Select start date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Due Date *</FormLabel>
                                                <FormControl>
                                                    <DatePicker
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="Select due date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>Segment Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Describe the Segment's objectives, and requirements..."
                                                        className="min-h-[130px] resize-none"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            <div className="mb-3 mt-3">
                                <Separator />
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
                                    // disabled={isPending}
                                    className="min-w-[120px]"
                                >
                                    {isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>

                <Card className="shadow-none  border border-destructive/20 bg-destructive/5 rounded-lg">
                        <CardHeader>
                          <h3 className="font-bold text-destructive dark:text-red-600">Danger Zone</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive/80  dark:text-red-600">
                              Deleting a segment is irreversible and will remove all
                              associated data.
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending}
                            // onClick={handleDelete}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Segment
                          </Button>
                        </CardFooter>
                      </Card>
            </Card>
    );
};