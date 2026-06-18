"use client";

import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Button, 
  Input, 
  Textarea, 
  NativeSelect, 
  Field, 
  FieldLabel, 
  FieldContent,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/bks/ds-system-sdk";

export type ProfileFormValues = {
  name: string;
  dob?: string | null;
  hometown?: string | null;
  gender?: string | null;
  bio?: string | null;
};

const getProfileSchema = (t: any, vT: any) => z.object({
  name: z.string().min(1, vT("required", { field: t("name") })).max(50, vT("maxLength", { field: t("name"), max: 50 })),
  dob: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }, { message: t("dobMaxError", { defaultValue: "Ngày sinh không được vượt quá ngày hiện tại" }) }),
  hometown: z.string().max(255, vT("maxLength", { field: t("hometown"), max: 255 })).nullable().optional(),
  gender: z.string().nullable().optional(),
  bio: z.string().max(1000, vT("maxLength", { field: t("bio"), max: 1000 })).nullable().optional(),
});

export interface ProfileEditFormProps {
  initialData: Partial<Omit<ProfileFormValues, 'gender'>> & { gender?: string | number | null };
  onSubmit: (data: ProfileFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function ProfileEditForm({ initialData, onSubmit, isSubmitting, onCancel }: ProfileEditFormProps) {
  const t = useTranslations("profile");
  const common = useTranslations("Common");
  const vT = useTranslations("validation");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(getProfileSchema(t, vT)),
    defaultValues: {
      name: initialData.name || "",
      dob: initialData.dob || "",
      hometown: initialData.hometown || "",
      gender: initialData.gender ? String(initialData.gender) : "",
      bio: initialData.bio || "",
    },
  });

  const { register, handleSubmit, formState: { errors }, control } = form;

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{t("editProfile", { defaultValue: "Cập nhật thông tin" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <Field className="gap-1">
            <FieldLabel htmlFor="name" required>{t("name", { defaultValue: "Họ và tên" })}</FieldLabel>
            <FieldContent>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="gap-1">
              <FieldLabel htmlFor="dob">{t("dob", { defaultValue: "Ngày sinh" })}</FieldLabel>
              <FieldContent>
                <Input 
                  id="dob" 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  {...register("dob")} 
                  aria-invalid={!!errors.dob} 
                />
                {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
              </FieldContent>
            </Field>

            <Field className="gap-1">
              <FieldLabel htmlFor="gender">{t("gender", { defaultValue: "Giới tính" })}</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <NativeSelect
                      id="gender"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      aria-invalid={!!errors.gender}
                    >
                      <option value="">{t("selectGender", { defaultValue: "-- Chọn giới tính --" })}</option>
                      <option value="1">{t("male", { defaultValue: "Nam" })}</option>
                      <option value="2">{t("female", { defaultValue: "Nữ" })}</option>
                      <option value="3">{t("other", { defaultValue: "Khác" })}</option>
                    </NativeSelect>
                  )}
                />
                {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
              </FieldContent>
            </Field>
          </div>

          <Field className="gap-1">
            <FieldLabel htmlFor="hometown">{t("hometown", { defaultValue: "Quê quán" })}</FieldLabel>
            <FieldContent>
              <Input id="hometown" {...register("hometown")} aria-invalid={!!errors.hometown} />
              {errors.hometown && <p className="text-sm text-destructive mt-1">{errors.hometown.message}</p>}
            </FieldContent>
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="bio">{t("bio", { defaultValue: "Giới thiệu bản thân" })}</FieldLabel>
            <FieldContent>
              <Textarea 
                id="bio" 
                rows={5} 
                {...register("bio")} 
                aria-invalid={!!errors.bio} 
                placeholder={t("bioPlaceholder", { defaultValue: "Hãy viết vài dòng về bạn (tối đa 1000 ký tự)..." })}
              />
              {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>}
            </FieldContent>
          </Field>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {common("cancel", { defaultValue: "Hủy" })}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? common("saving", { defaultValue: "Đang lưu..." }) : common("save", { defaultValue: "Lưu thay đổi" })}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
