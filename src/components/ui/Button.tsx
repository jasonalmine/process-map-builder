'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'secondary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const theme = useThemeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: isDark
        ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-offset-gray-900'
        : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-offset-white',
      secondary: isDark
        ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-750 hover:border-gray-600 focus:ring-offset-gray-900'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-offset-white',
      ghost: isDark
        ? 'text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-offset-gray-900'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-offset-white',
      destructive: isDark
        ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 focus:ring-red-500 focus:ring-offset-gray-900'
        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500 focus:ring-offset-white',
    };

    const sizeStyles = {
      sm: 'px-2 py-1.5 text-xs gap-1.5',
      md: 'px-3 py-2 text-sm gap-2',
      icon: 'p-2 w-8 h-8',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
