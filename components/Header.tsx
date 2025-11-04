
import React from 'react';
import { ShieldIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex justify-center items-center py-4 border-b border-border-color">
      <div className="flex items-center gap-3">
        <ShieldIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          Cyber Decompiler
        </h1>
      </div>
    </header>
  );
};
