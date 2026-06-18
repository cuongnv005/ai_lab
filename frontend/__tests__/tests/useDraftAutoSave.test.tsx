import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraftAutoSave } from '../../hooks/useDraftAutoSave';
import { postRepository } from '../../features/posts/services/http-post.repository';

// Mock postRepository methods used by hook
vi.mock('../../features/posts/services/http-post.repository', () => ({
  postRepository: {
    autoSaveDraft: vi.fn(),
    getDraft: vi.fn(),
  },
}));

// Mock next-intl translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('useDraftAutoSave hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
    // Default mock behavior
    vi.mocked(postRepository.autoSaveDraft).mockResolvedValue({ success: true });
    vi.mocked(postRepository.getDraft).mockResolvedValue({ data: null });
    
    // Mock window.confirm
    global.window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should auto-save draft every 30 seconds if dirty and category_id/title exist', async () => {
    const formData = {
      title: 'Bài viết test',
      category_id: 1,
      content: 'Nội dung test',
      tags: ['test'],
    };
    
    const onRestoreDraft = vi.fn();

    const { result, rerender } = renderHook(
      (props) => useDraftAutoSave(props),
      {
        initialProps: {
          formData,
          isDirty: true,
          onRestoreDraft,
        },
      }
    );

    // Initial state: not saved yet
    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.hasError).toBe(false);

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Check if autoSaveDraft was called
    expect(postRepository.autoSaveDraft).toHaveBeenCalledWith({
      category_id: 1,
      title: 'Bài viết test',
      content: 'Nội dung test',
      tags: ['test'],
    });

    expect(result.current.lastSaved).toBeInstanceOf(Date);
    expect(result.current.hasError).toBe(false);
  });

  it('should set hasError to true if auto-save fails', async () => {
    vi.mocked(postRepository.autoSaveDraft).mockRejectedValueOnce(new Error('Network error'));
    
    const formData = {
      title: 'Bài viết lỗi',
      category_id: 2,
      content: 'Nội dung lỗi',
      tags: [],
    };
    
    const { result } = renderHook(() =>
      useDraftAutoSave({
        formData,
        isDirty: true,
        onRestoreDraft: vi.fn(),
      })
    );

    // Fast-forward 30 seconds to trigger save
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.isSaving).toBe(false);
  });

  it('should prompt to restore draft when category_id changes and a draft exists', async () => {
    const mockDraft = {
      title: 'Bản nháp đã lưu',
      category_id: 3,
      content: 'Nội dung bản nháp',
      tags: ['nhap'],
    };

    vi.mocked(postRepository.getDraft).mockResolvedValueOnce({
      status_code: 200,
      message: 'Draft loaded',
      errors: null,
      data: mockDraft,
    });

    const onRestoreDraft = vi.fn();
    
    // Render initially with category_id: null
    const { result, rerender } = renderHook(
      (props) => useDraftAutoSave(props),
      {
        initialProps: {
          formData: { title: '', category_id: null, content: '', tags: [] },
          isDirty: false,
          onRestoreDraft,
        },
      }
    );

    // Change category_id to 3
    rerender({
      formData: { title: '', category_id: 3, content: '', tags: [] },
      isDirty: false,
      onRestoreDraft,
    });

    // Wait for async useEffect fetch
    await act(async () => {
      await Promise.resolve();
    });

    expect(postRepository.getDraft).toHaveBeenCalledWith(3);
    
    // Check that pendingDraft is set and onRestoreDraft is not called yet
    expect(result.current.pendingDraft).toEqual(mockDraft);
    expect(onRestoreDraft).not.toHaveBeenCalled();

    // Call confirmRestore
    act(() => {
      result.current.confirmRestore();
    });

    // Check that onRestoreDraft is called and pendingDraft is cleared
    expect(onRestoreDraft).toHaveBeenCalledWith(mockDraft);
    expect(result.current.pendingDraft).toBeNull();
  });
});
