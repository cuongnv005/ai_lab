"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  Input,
} from "@bks/ds-system-sdk";
import { useAuth } from "../hooks/use-auth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { mapBackendErrors } from "@/shared/utils/map-backend-errors";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const t = useTranslations("ChangePassword");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,44rem)] w-[min(calc(100vw-2rem),28rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(calc(100vw-2rem),28rem)]"
      >
        <DialogHeader className="gap-2 border-b border-border px-6 py-5 text-left">
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
            <Lock className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <DialogTitle className="typo-heading-3 pr-8 text-foreground mt-2">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="typo-body text-muted-foreground">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ChangePasswordForm onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations("ChangePassword");
  const { changePassword, isLoading } = useAuth();
  
    const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Validation Schema
  const changePasswordSchema = z
    .object({
      oldPassword: z.string().min(1, t("errors.oldPasswordRequired")),
      newPassword: z
        .string()
        .min(1, t("errors.newPasswordRequired"))
        .min(8, t("errors.newPasswordLength"))
        .max(32, t("errors.newPasswordLength")),
      confirmNewPassword: z.string().min(1, t("errors.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      message: t("errors.newPasswordDifferent"),
      path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("errors.confirmPasswordMismatch"),
      path: ["confirmNewPassword"],
    });

  type FormValues = z.infer<typeof changePasswordSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isFormSubmitting || useAuthStore.getState().isLoading) return;
    setIsFormSubmitting(true);
    try {
      const success = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      // Extract field errors: server returns them in data.data (422 envelope)
      const rawErrors =
        (responseData?.errors as Record<string, string[]> | null) ??
        (responseData?.data as Record<string, string[]> | null);
      if (rawErrors) {
        mapBackendErrors(rawErrors, setError, {
          old_password: "oldPassword",
          new_password: "newPassword",
          current_password: "oldPassword",
          password: "newPassword",
        });
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden" noValidate>
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
        {/* Old Password */}
        <Field className="gap-1">
          <FieldLabel className="text-muted-foreground" htmlFor="oldPassword">
            {t("oldPasswordLabel")}
          </FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder={t("placeholder")}
                className="pr-10"
                {...register("oldPassword")}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowOldPassword(!showOldPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.oldPassword && (
              <FieldError>{errors.oldPassword.message}</FieldError>
            )}
          </FieldContent>
        </Field>

        {/* New Password */}
        <Field className="gap-1">
          <FieldLabel className="text-muted-foreground" htmlFor="newPassword">
            {t("newPasswordLabel")}
          </FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={t("placeholder")}
                className="pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowNewPassword(!showNewPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <FieldError>{errors.newPassword.message}</FieldError>
            )}
          </FieldContent>
        </Field>

        {/* Confirm New Password */}
        <Field className="gap-1">
          <FieldLabel className="text-muted-foreground" htmlFor="confirmNewPassword">
            {t("confirmNewPasswordLabel")}
          </FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={t("placeholder")}
                className="pr-10"
                {...register("confirmNewPassword")}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <FieldError>{errors.confirmNewPassword.message}</FieldError>
            )}
          </FieldContent>
        </Field>
      </div>

      <DialogFooter className="m-0 -mx-0 -mb-0 shrink-0 flex-row justify-end gap-2 border-t border-border bg-muted/50 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="min-w-24"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="min-w-24"
        >
          {t("submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}
