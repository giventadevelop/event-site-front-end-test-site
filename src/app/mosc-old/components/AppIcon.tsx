'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  [key: string]: any;
}

function AppIcon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  ...props
}: AppIconProps) {
  const IconComponent = (LucideIcons as any)?.[name];

  if (!IconComponent) {
    return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
  }

  return <IconComponent
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    className={className}
    {...props}
  />;
}

export default AppIcon;













