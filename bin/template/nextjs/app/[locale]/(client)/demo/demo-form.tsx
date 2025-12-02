/**
 * Demo 表单组件
 * 
 * 展示 react-hook-form + zod + sonner + nuqs + usehooks-ts 的综合使用
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQueryState, parseAsString } from "nuqs";
import { useLocalStorage, useDebounceValue } from "usehooks-ts";
import { useState, useEffect } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect } from "@/components/ui/select";
import {
  demoFormSchema,
  type DemoFormData,
  demoFormDefaultValues,
  ROLE_OPTIONS,
} from "@/lib/validation/demo-form";

export function DemoForm() {
  const t = useTranslations("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========== nuqs: URL 状态管理 ==========
  // 将 utm_campaign 参数同步到 URL
  const [utmCampaign] = useQueryState("utm_campaign", parseAsString);

  // ========== usehooks-ts: useLocalStorage ==========
  // 将表单草稿保存到 localStorage
  const [savedDraft, setSavedDraft] = useLocalStorage<Partial<DemoFormData>>(
    "demo-form-draft",
    {}
  );

  // ========== usehooks-ts: useDebounceValue ==========
  // 防抖保存草稿
  const [formValues, setFormValues] = useState<Partial<DemoFormData>>({});
  const [debouncedFormValues] = useDebounceValue(formValues, 500);

  // 当防抖值变化时保存到 localStorage
  useEffect(() => {
    if (Object.keys(debouncedFormValues).length > 0) {
      setSavedDraft(debouncedFormValues);
    }
  }, [debouncedFormValues, setSavedDraft]);

  // ========== react-hook-form + zod ==========
  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      ...demoFormDefaultValues,
      ...savedDraft, // 恢复草稿
    },
  });

  // 监听表单值变化
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value as Partial<DemoFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // 表单提交
  const onSubmit = async (data: DemoFormData) => {
    setIsSubmitting(true);

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 如果有 utm_campaign，添加到数据中
      const submitData = {
        ...data,
        utm_campaign: utmCampaign || undefined,
      };

      console.log("Form submitted:", submitData);

      // ========== sonner: Toast 通知 ==========
      toast.success(t("successMessage"));

      // 清除草稿
      setSavedDraft({});
      form.reset(demoFormDefaultValues);
    } catch (error) {
      toast.error(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 显示 URL 参数（nuqs 演示） */}
      {utmCampaign && (
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm">
            <span className="font-medium">UTM Campaign: </span>
            <code className="px-1 bg-background rounded">{utmCampaign}</code>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            (This value is read from URL using nuqs)
          </p>
        </div>
      )}

      {/* 草稿恢复提示 */}
      {Object.keys(savedDraft).length > 0 && savedDraft.name && (
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">
            ✨ Your draft has been restored from local storage
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.namePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("fields.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.role")}</FormLabel>
                <FormControl>
                  <SimpleSelect
                    placeholder={t("fields.rolePlaceholder")}
                    options={ROLE_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: t(`roles.${opt.value}`),
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subscribe Checkbox */}
          <FormField
            control={form.control}
            name="subscribe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("fields.subscribe")}
                  </FormLabel>
                  <FormDescription>
                    (usehooks-ts: useDebounceValue saves draft to localStorage)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submitButton")}
          </Button>
        </form>
      </Form>

      {/* 技术说明 */}
      <div className="mt-12 p-6 rounded-lg border bg-card">
        <h3 className="font-semibold mb-4">📚 技术栈说明</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>react-hook-form + zod:</strong> 表单状态管理和验证
          </li>
          <li>
            <strong>sonner:</strong> Toast 通知 (提交成功/失败时显示)
          </li>
          <li>
            <strong>nuqs:</strong> URL 状态管理 (尝试添加 ?utm_campaign=test 到 URL)
          </li>
          <li>
            <strong>usehooks-ts:</strong> useLocalStorage (草稿保存), useDebounceValue (防抖)
          </li>
        </ul>
      </div>
    </div>
  );
}

