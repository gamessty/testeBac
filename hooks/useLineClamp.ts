import { useEffect, useRef, useState } from 'react';

export function useLineClamp(lines: number) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [clampedText, setClampedText] = useState<string>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fullText = el.textContent ?? '';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '0');
    const maxHeight = lineHeight * lines;

    // Check if the text already fits without truncation
    el.textContent = fullText;
    if (el.scrollHeight <= maxHeight) {
      setClampedText(fullText);
      return;
    }

    let low = 0;
    let high = fullText.length;
    let mid;
    let truncated = '';

    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      el.textContent = fullText.slice(0, mid) + '…';

      if (el.scrollHeight <= maxHeight) {
        truncated = el.textContent;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setClampedText(truncated);
  }, [lines]);

  return { ref, clampedText };
}