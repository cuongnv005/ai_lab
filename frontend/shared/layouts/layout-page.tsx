'use client';

import React from 'react';

interface LayoutPageProps {
  heading?: string;
  children: React.ReactNode;
}

export function LayoutPage({ heading, children }: LayoutPageProps) {
  return (
    <div className="w-full space-y-6">
      {heading && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        </div>
      )}
      {children}
    </div>
  );
}
