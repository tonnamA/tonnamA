import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLang } from '../context/LangContext';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label, className = '' }) => {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } finally {
        document.body.removeChild(area);
      }
    }
  };

  return (
    <button
      type="button"
      className={`copy-chip ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      aria-label={copied ? t('copied') : label || t('copy')}
    >
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      <span>{copied ? t('copied') : label || t('copy')}</span>
    </button>
  );
};
