import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@bks/ds-system-sdk/components/ui/badge';
import { Input } from '@bks/ds-system-sdk/components/ui/input';
import { useTranslations } from 'next-intl';

interface TagsInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  error?: boolean;
  maxLength?: number;
}

export const TagsInput = ({ value = [], onChange, error, maxLength = 20 }: TagsInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const t = useTranslations('Post.editor');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^,|,$/g, '');
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div 
      className={`flex flex-wrap items-center gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
        error ? 'border-destructive ring-1 ring-destructive' : 'border-input'
      }`}
    >
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            className="hover:bg-muted rounded-full p-0.5 focus:outline-none"
            onClick={() => removeTag(index)}
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Remove tag</span>
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        maxLength={maxLength}
        placeholder={value.length === 0 ? t('tagsPlaceholder') : ''}
        className="flex-1 min-w-[120px] border-0 h-7 p-0 focus-visible:ring-0 shadow-none"
      />
    </div>
  );
};
