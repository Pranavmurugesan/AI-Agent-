import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, error, clearError, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form state
  const [loginSlug, setLoginSlug] = useState('apex-academy');
  const [loginEmail, setLoginEmail] = useState('admin@apexacademy.in');
  const [loginPassword, setLoginPassword] = useState('SecurePass123!');

  // Register form state
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgSlug, setRegOrgSlug] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegOrgName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setRegOrgSlug(slug);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!loginSlug.trim()) {
      setFormError('Please enter your Institute Slug.');
      return;
    }
    if (!loginEmail.trim()) {
      setFormError('Please enter your work email.');
      return;
    }
    if (!loginPassword) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      await login({
        organizationSlug: loginSlug.trim(),
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (onClose) onClose();
    } catch {
      // Error handled by AuthContext
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!regOrgName.trim()) {
      setFormError('Please provide your Institute / Academy Name.');
      return;
    }
    if (!regName.trim()) {
      setFormError('Please provide your Administrator Full Name.');
      return;
    }
    if (!regEmail.trim()) {
      setFormError('Please provide your administrative email.');
      return;
    }
    if (regPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await register({
        organizationName: regOrgName.trim(),
        organizationSlug: regOrgSlug.trim() || undefined,
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      if (onClose) onClose();
    } catch {
      // Error handled by AuthContext
    }
  };

  const displayError = formError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
        {/* Header with Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {isRegisterMode ? 'Register Coaching Institute' : 'Institute Portal Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegisterMode 
                ? 'Create a new multi-tenant instance for your institute' 
                : 'Sign in to access your leads and student conversions'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              clearError();
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegisterMode 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff & Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              clearError();
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegisterMode 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Institute
          </button>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Form Body */}
        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Institute Identifier (Slug)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={loginSlug}
                  onChange={(e) => setLoginSlug(e.target.value)}
                  placeholder="e.g. apex-academy"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@institute.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Institute Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Coaching Institute / Academy Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={regOrgName}
                  onChange={handleOrgNameChange}
                  placeholder="e.g. Apex IIT-JEE & NEET Academy"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              {regOrgSlug && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Slug: <span className="text-blue-400">{regOrgSlug}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rajesh@apexacademy.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Password (min 8 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-900/30 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Institute...</span>
                </>
              ) : (
                <>
                  <span>Create Institute Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Assurance Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HttpOnly Cookie JWT + CSRF Protected</span>
          </div>
          <span className="font-mono text-slate-600">Multi-Tenant</span>
        </div>
      </div>
    </div>
  );
};
