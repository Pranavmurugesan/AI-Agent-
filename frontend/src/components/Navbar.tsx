import React, { useState } from 'react';
import { apiService } from '../services/api';
import { User, Organization } from '../types/api';
import { 
  Menu, 
  GraduationCap, 
  UserCheck, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  Building2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentUser: User | null;
  currentOrg: Organization | null;
  onAuthChange: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  currentUser, 
  currentOrg, 
  onAuthChange 
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form states
  const [orgSlug, setOrgSlug] = useState('abc-coaching');
  const [orgName, setOrgName] = useState('ABC Coaching Institute');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('director@abc.test');
  const [password, setPassword] = useState('password123');

  const handleQuickLogin = async (slug: string, userEmail: string, pass: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      await apiService.login({
        organizationSlug: slug,
        email: userEmail,
        password: pass,
      });
      setIsAuthModalOpen(false);
      onAuthChange();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAuthError(null);
      if (authMode === 'login') {
        await apiService.login({
          organizationSlug: orgSlug.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await apiService.register({
          organizationName: orgName.trim(),
          organizationSlug: orgSlug.trim() || undefined,
          name: name.trim(),
          email: email.trim(),
          password,
        });
      }
      setIsAuthModalOpen(false);
      onAuthChange();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      onAuthChange();
    } catch {
      // Ignored
    }
  };

  return (
    <>
      <header className="h-16 glass-panel border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
        {/* Left: Mobile Menu & Institute Brand */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{currentOrg ? currentOrg.name : 'AI Lead Conversion SaaS'}</span>
                {currentOrg && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-800">
                    {currentOrg.slug}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Coaching Institute Lead Engine</p>
            </div>
          </div>
        </div>

        {/* Right: User Status & Session Switcher */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentUser.role === 'ADMIN' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-all"
                title="Switch between Admin and Counselors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Switch Account</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Logout session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Demo Accounts</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth & Demo Account Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  {authMode === 'login' ? 'Account Login & Demo Profiles' : 'Register New Institute'}
                </h2>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Quick Demo Selector for ABC Coaching Institute */}
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick 1-Click Demo Profiles (ABC Coaching)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('abc-coaching', 'director@abc.test', 'password123')}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-left transition-colors"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>Pranav Director</span>
                    <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">ADMIN</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">director@abc.test</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('abc-coaching', 'priya@abc.test', 'password123')}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 text-left transition-colors"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>Priya Sharma</span>
                    <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">COUNSELOR</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">priya@abc.test</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('abc-coaching', 'rahul@abc.test', 'password123')}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 text-left transition-colors"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>Rahul Verma</span>
                    <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">COUNSELOR</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">rahul@abc.test</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('abc-coaching', 'sneha@abc.test', 'password123')}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 text-left transition-colors"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>Sneha Reddy</span>
                    <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">COUNSELOR</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">sneha@abc.test</div>
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {authError}
              </div>
            )}

            {/* Custom Credentials Form */}
            <form onSubmit={handleCustomAuth} className="space-y-3 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Custom Credentials:
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Institute Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Academy"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Institute Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. abc-coaching"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                {authMode === 'register' ? (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Director / Admin Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. director@abc.test"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. director@apex.test"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-blue-400 hover:underline text-xs"
                >
                  {authMode === 'login' ? '+ Register New Institute' : '← Back to Login'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition-all"
                  >
                    {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
