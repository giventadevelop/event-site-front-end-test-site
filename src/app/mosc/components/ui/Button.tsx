'use client';

import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import AppIcon from '../AppIcon';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-syro-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "syro-primary-button",
        destructive: "bg-syro-red text-white hover:opacity-90",
        outline: "border border-syro-table-border hover:bg-syro-bg-gray hover:text-syro-blue",
        secondary: "bg-syro-blue text-white hover:opacity-90",
        ghost: "hover:bg-syro-bg-gray hover:text-syro-red",
        link: "text-syro-red underline-offset-4 hover:underline",
        success: "bg-syro-success text-white hover:opacity-90",
        warning: "bg-syro-warning text-white hover:opacity-90",
        danger: "bg-syro-red text-white hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-8 rounded-md px-2 text-xs",
        xl: "h-12 rounded-md px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  children,
  loading = false,
  iconName = null,
  iconPosition = 'left',
  iconSize = null,
  fullWidth = false,
  disabled = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";

  const iconSizeMap: Record<string, number> = {
    xs: 12,
    sm: 14,
    default: 16,
    lg: 18,
    xl: 20,
    icon: 16,
  };

  const calculatedIconSize = iconSize ?? (size ? iconSizeMap[size] : 16);

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const renderIcon = () => {
    if (!iconName) return null;
    try {
      return (
        <AppIcon
          name={iconName}
          size={calculatedIconSize}
          className={cn(
            children && iconPosition === 'left' && "mr-2",
            children && iconPosition === 'right' && "ml-2"
          )}
        />
      );
    } catch {
      return null;
    }
  };

  const renderFallbackButton = () => (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        fullWidth && "w-full"
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {iconName && iconPosition === 'left' && renderIcon()}
      {children}
      {iconName && iconPosition === 'right' && renderIcon()}
    </button>
  );

  if (asChild) {
    try {
      if (!children || React.Children?.count(children) !== 1) {
        return renderFallbackButton();
      }
      const child = React.Children?.only(children);
      if (!React.isValidElement(child)) {
        return renderFallbackButton();
      }
      const content = (
        <>
          {loading && <LoadingSpinner />}
          {iconName && iconPosition === 'left' && renderIcon()}
          {child?.props?.children}
          {iconName && iconPosition === 'right' && renderIcon()}
        </>
      );
      const clonedChild = React.cloneElement(child, {
        className: cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          child?.props?.className
        ),
        disabled: disabled || loading || child?.props?.disabled,
        children: content,
      });
      return <Comp ref={ref} {...props}>{clonedChild}</Comp>;
    } catch {
      return renderFallbackButton();
    }
  }

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        fullWidth && "w-full"
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {iconName && iconPosition === 'left' && renderIcon()}
      {children}
      {iconName && iconPosition === 'right' && renderIcon()}
    </Comp>
  );
});

Button.displayName = "Button";
export default Button;
