"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { InputUploadImage, type InputUploadImageChange } from "@/bks/ds-system-sdk";
import { toast } from "sonner";

export interface AvatarUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function AvatarUpload({ value, onChange, disabled, isSubmitting }: AvatarUploadProps) {
  const t = useTranslations("Common");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (change: InputUploadImageChange) => {
    const { file } = change;
    if (!file) {
      onChange?.(null);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) throw new Error("Missing ImgBB API Key");

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onChange?.(data.data.url);
        toast.success(t("uploadSuccess", { defaultValue: "Upload thành công" }));
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t("uploadFailed", { defaultValue: "Lỗi tải ảnh lên" }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <InputUploadImage
      value={value}
      onValueChange={handleUpload}
      disabled={disabled || isUploading || isSubmitting}
      loading={isUploading || isSubmitting}
      placeholder={(isUploading || isSubmitting) ? t("uploading", { defaultValue: "Đang tải lên..." }) : t("uploadAvatar", { defaultValue: "Tải ảnh đại diện" })}
      description={t("avatarDescription", { defaultValue: "JPG, PNG hoặc WebP. Max 2MB." })}
      browseLabel={t("chooseImage", { defaultValue: "Chọn ảnh" })}
      removeLabel={t("removeImage", { defaultValue: "Xoá ảnh" })}
      allowRemove={false}
      accept="image/png, image/jpeg, image/webp"
      maxSize={2 * 1024 * 1024}
      onFileReject={(file, reason) => {
        if (reason === "size") {
          toast.error(t("fileTooLarge", { defaultValue: "Kích thước tệp quá lớn (Tối đa 2MB)" }));
        } else {
          toast.error(t("invalidFileType", { defaultValue: "Định dạng không được hỗ trợ" }));
        }
      }}
    />
  );
}
