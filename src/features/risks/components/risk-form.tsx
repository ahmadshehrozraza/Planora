"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiskLevel, RiskStatus } from "@prisma/client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createRiskSchema } from "../schemas";
import { useCreateRisk, useUpdateRisk } from "../api/use-risks";

interface RiskFormProps {
  projectId: string;
  workspaceId: string;
  initialValues?: any;
  onCancel: () => void;
}

export const RiskForm = ({ projectId, workspaceId, initialValues, onCancel }: RiskFormProps) => {
  const isEditing = !!initialValues;
  const { mutate: createRisk, isPending: isCreating } = useCreateRisk();
  const { mutate: updateRisk, isPending: isUpdating } = useUpdateRisk();

  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof createRiskSchema>>({
    resolver: zodResolver(createRiskSchema),
    defaultValues: {
      title: initialValues?.title || "",
      probability: initialValues?.probability || RiskLevel.MEDIUM,
      impact: initialValues?.impact || RiskLevel.MEDIUM,
      mitigation: initialValues?.mitigation || "",
      status: initialValues?.status || RiskStatus.OPEN,
      projectId,
      workspaceId,
    },
  });

  const onSubmit = (values: z.infer<typeof createRiskSchema>) => {
    if (isEditing) {
      updateRisk({ id: initialValues.id, ...values }, { onSuccess: onCancel });
    } else {
      createRisk(values, { onSuccess: onCancel });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Title</FormLabel>
              <FormControl><Input {...field} disabled={isPending} placeholder="e.g. API Rate Limits Exceeded" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(RiskLevel).map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(RiskLevel).map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(RiskStatus).map((status) => (
                      <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="mitigation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mitigation Plan</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} disabled={isPending} placeholder="How will we prevent or handle this?" className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isEditing ? "Save Changes" : "Log Risk"}</Button>
        </div>
      </form>
    </Form>
  );
};