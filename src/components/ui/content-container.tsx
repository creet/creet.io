import React from 'react';
import { cn } from '@/lib/utils';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ContentContainer = ({ children, className }: ContentContainerProps) => {
  return (
    <div className={cn(
      "mx-auto flex w-full max-w-3xl flex-col items-stretch px-6 sm:px-16",
      className
    )}>
      {children}
    </div>
  );
};

export default ContentContainer;
