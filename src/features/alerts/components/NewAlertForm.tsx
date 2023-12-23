import { Button } from "@/src/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { api } from "@/src/utils/api";
import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Input } from "@/src/components/ui/input";

const formSchema = z.object({
  name: z.string(),
  alertThreshold: z.number(),
  triggerWebhookUrl: z
    .string()
    .trim()
    .url()
    .regex(/^https?:\/\//, {
      message: "URL must start with http:// or https://",
    }),
});

export const NewAlertForm = (props: {
  projectId: string;
  onFormSuccess?: () => void;
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  const posthog = usePostHog();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      alertThreshold: 100,
    },
  });

  const utils = api.useUtils();
  const createAlertMutation = api.alerts.createAlert.useMutation({
    onSuccess: () => utils.alerts.invalidate(),
    onError: (error) => setFormError(error.message),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    posthog.capture("alerts:new_alert_form_submit");
    createAlertMutation
      .mutateAsync({
        ...values,
        projectId: props.projectId,
        alertMetric: "COST_PER_USER",
      })
      .then(() => {
        props.onFormSuccess?.();
        form.reset();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div>
      <p className="text-red mb-7 text-left italic">
        <span className="font-bold">Note:</span> We currently only support
        alerts on the &apos;Total Token Costs Per User&apos; metric. (Also
        visible as &quot;User Consumption&quot; on the Dashboard.)
      </p>
      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alertThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Alert will be triggered when &apos;Total Token Costs Per
                  User&apos; exceed (in USD):
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    {...form.register("alertThreshold", {
                      valueAsNumber: true,
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="triggerWebhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Webhook URL (HTTP POST) to call when alert is triggered:
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            loading={createAlertMutation.isLoading}
            className="w-full"
          >
            New Alert
          </Button>
        </form>
      </Form>
      {formError ? (
        <p className="text-red text-center">
          <span className="font-bold">Error:</span> {formError}
        </p>
      ) : null}
    </div>
  );
};
