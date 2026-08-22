import React from 'react';
import { Menu, Terminal, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="h-16 glass-panel border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">System Foundation</span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">
            Local Dev Environment
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-950/40 border border-blue-800/40 rounded-full text-xs text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Phase 1 Standard</span>
        </div>
      </div>
    </header>
  );
};
