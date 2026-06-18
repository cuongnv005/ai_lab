import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card } from '@bks/ds-system-sdk/components/ui/card';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ImageUploadBlock() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('ImageUpload');

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalidImage', { defaultValue: 'Vui lòng chọn file ảnh hợp lệ' }));
      return;
    }

    setIsUploading(true);
    setUploadedUrl(null);
    setIsCopied(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        toast.error(t('missingApiKey', { defaultValue: 'Lỗi cấu hình: Thiếu API key tải ảnh' }));
        setIsUploading(false);
        return;
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedUrl(data.data.url);
        toast.success(t('uploadSuccess', { defaultValue: 'Tải ảnh lên thành công' }));
      } else {
        toast.error(t('uploadError', { defaultValue: 'Có lỗi xảy ra khi tải ảnh lên' }));
      }
    } catch (error) {
      toast.error(t('networkError', { defaultValue: 'Lỗi kết nối khi tải ảnh lên' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setIsCopied(true);
      toast.success(t('copiedLink', { defaultValue: 'Đã copy link ảnh' }));
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          {t('title', { defaultValue: 'Tải ảnh lên' })}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t('desc', { defaultValue: 'Kéo thả ảnh vào đây để tải lên và lấy link nhúng vào bài viết.' })}
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-muted/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadImage(e.target.files[0]);
            }
          }}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-medium">{t('uploading', { defaultValue: 'Đang tải lên...' })}</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-xs font-medium text-foreground">
              {t('clickOrDrag', { defaultValue: 'Nhấn hoặc kéo thả ảnh' })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              JPG, PNG, GIF
            </p>
          </>
        )}
      </div>

      {uploadedUrl && (
        <div className="bg-muted/50 p-3 rounded-lg flex flex-col gap-2">
          <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" /> {t('successText', { defaultValue: 'Tải lên thành công!' })}
          </div>
          <div className="relative">
            <input 
              type="text" 
              readOnly 
              value={uploadedUrl} 
              className="w-full text-xs p-2 pr-10 rounded border border-border bg-background focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleCopy}
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <img 
            src={uploadedUrl} 
            alt="Preview" 
            className="mt-2 rounded-md max-h-32 object-contain mx-auto border border-border bg-background" 
          />
        </div>
      )}
    </Card>
  );
}
