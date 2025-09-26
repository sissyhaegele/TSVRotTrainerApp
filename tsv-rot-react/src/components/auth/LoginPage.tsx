import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      await login(password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-tsv-blue-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">TSV</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Willkommen zurück
            </h2>
            <p className="text-sm text-gray-600">
              TSV 1905 Rot e.V. - Trainer Management System
            </p>
          </div>

          {/* Login Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="form-label">
                  Passwort
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Geben Sie Ihr Passwort ein"
                    className="form-input pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Anmelden...
                    </>
                  ) : (
                    'Anmelden'
                  )}
                </button>
              </div>
            </form>

            {/* Login Hints */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Zugangsdaten:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Admin: <span className="font-mono">TSVAdmin2024</span></li>
                <li>• Trainer: <span className="font-mono">TSVRot2024</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Brand/Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-tsv-blue-600 to-tsv-blue-800">
          <div className="flex flex-col justify-center items-center h-full p-12 text-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8">
                <User className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                TSV 1905 Rot e.V.
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Trainer Management System
              </p>
              <div className="space-y-3 text-left max-w-sm">
                <div className="flex items-center text-sm opacity-80">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  Trainer- und Kursverwaltung
                </div>
                <div className="flex items-center text-sm opacity-80">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  Wochenplanung und Vertretungen
                </div>
                <div className="flex items-center text-sm opacity-80">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  Ausfallmanagement
                </div>
                <div className="flex items-center text-sm opacity-80">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  Qualifikationsverfolgung
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-white border-opacity-20 rounded-full"></div>
            <div className="absolute top-20 right-20 w-16 h-16 border border-white border-opacity-20 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 border border-white border-opacity-20 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-8 h-8 bg-white bg-opacity-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
