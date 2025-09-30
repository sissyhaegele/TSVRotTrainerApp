import React, { useState } from 'react';
import { Lock, User, Shield, Users } from 'lucide-react';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (password === 'TSVAdmin2024') {
      onLogin('admin');
      localStorage.setItem('tsvrot-role', 'admin');
      localStorage.setItem('tsvrot-isLoggedIn', 'true');
    } else if (password === 'TSVRot2024') {
      onLogin('trainer');
      localStorage.setItem('tsvrot-role', 'trainer');
      localStorage.setItem('tsvrot-isLoggedIn', 'true');
    } else {
      setError('Falsches Passwort');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TSV Rot Trainer-Verwaltung</h1>
          <p className="text-gray-600 mt-2">Bitte melden Sie sich an</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Passwort eingeben"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Anmelden
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>Admin: Vollzugriff</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Trainer: Nur Trainerzuordnung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
