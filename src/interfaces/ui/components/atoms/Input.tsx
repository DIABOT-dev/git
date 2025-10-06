import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search';
  'data-testid'?: string;
}

export default function Input({ 
  inputSize = 'md', 
  variant = 'default',
  className, 
  'data-testid': testId,
  ...props 
}: InputProps) {
  return (
    <input
      className={cn(
        'input',
        `input-${inputSize}`,
        variant === 'search' && 'pl-10',
        className
      )}
      data-testid={testId}
      {...props}
    />
  );
}