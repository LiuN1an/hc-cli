import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

async function checkEmailAvailable(email: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const takenEmails = ["test@example.com", "admin@example.com"];
  return !takenEmails.includes(email.toLowerCase());
}

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  age: z.coerce
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Age must be less than 120"),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: undefined,
      bio: "",
    },
  });

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsSubmitting(true);
      try {
        setIsCheckingEmail(true);
        const isEmailAvailable = await checkEmailAvailable(data.email);
        setIsCheckingEmail(false);

        if (!isEmailAvailable) {
          form.setError("email", {
            type: "manual",
            message: t("form.validation.emailTaken"),
          });
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Form submitted:", data);
        toast.success(t("form.submitSuccess"));
        form.reset();
      } catch (error) {
        toast.error(t("form.submitError"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, t]
  );

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
          <CardDescription>{t("form.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.placeholders.firstName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.placeholders.lastName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.email")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder={t("form.placeholders.email")}
                          {...field}
                        />
                        {isCheckingEmail && (
                          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Try test@example.com to see async validation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.age")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("form.placeholders.age")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.bio")}</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder={t("form.placeholders.bio")}
                        rows={4}
                        className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("common.submit")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
