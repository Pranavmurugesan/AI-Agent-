import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Menu, 
  PlusCircle, 
  LogOut, 
  Building, 
  User as UserIcon,
  Shield
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenQuickLead?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  onOpenQuickLead,
  onOpenAuthModal 
}) => {
  const { user, organization, isAuthenticated, logout, isLoading } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'COUNSELOR':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'STAFF':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Institute Info */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isAuthenticated && organization ? (
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-950/60 border border-blue-800/40 rounded-lg text-blue-400">
              <Building className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {organization.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                /{organization.slug}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Phase 3 Lead Management Engine</span>
          </div>
        )}
      </div>

      {/* Right: Quick Action & User Session */}
      <div className="flex items-center space-x-3">
        {/* Quick New Lead Action */}
        {onOpenQuickLead && (
          <button
            onClick={onOpenQuickLead}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-blue-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Enquiry</span>
            <span className="sm:hidden">New</span>
          </button>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-medium text-slate-200">{user.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono uppercase ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={() => logout()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-900/40 transition-colors"
              title="Sign Out (Clear HttpOnly Session)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
