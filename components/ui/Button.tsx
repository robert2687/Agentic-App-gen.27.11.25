import React from 'react';
import { LoaderIcon } from '../Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-gradient-to-r from-brand-primary to-blue-600 hover:from-sky-400 hover:to-blue-500 text-brand-surface font-bold shadow-neon-primary hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] border border-transparent",
    secondary: "bg-brand-surface-light border border-slate-600 hover:bg-slate-600 text-brand-text-primary hover:border-slate-500 shadow-lg hover:shadow-xl",
    ghost: "bg-transparent hover:bg-white/5 text-brand-text-secondary hover:text-brand-text-primary",
    danger: "bg-accent-error/10 hover:bg-accent-error/20 text-accent-error border border-accent-error/20 hover:border-accent-error/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="mr-2 animate-spin"><LoaderIcon /></span> : icon ? <span className="mr-2">{icon}</span> : null}
      {children}
    </button>
  );
};