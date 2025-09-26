import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, isAdmin: boolean) => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Bitte Benutzername und Passwort eingeben');
      return;
    }

    let isAdmin = false;
    let loginSuccessful = false;

    if (password === 'TSVAdmin2024') {
      isAdmin = true;
      loginSuccessful = true;
    } else if (password === 'TSVRot2024') {
      isAdmin = false;
      loginSuccessful = true;
    } else {
      setError('Falsches Passwort');
      return;
    }

    if (loginSuccessful) {
      onLogin(username, isAdmin);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="/tsv-logo.jpg" 
            alt="TSV Rot Logo" 
            className="login-logo"
          />
          <h1 className="login-title">TSV Rot</h1>
          <p className="login-subtitle">Trainer-Verwaltung</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="login-input"
              placeholder="Name eingeben..."
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="login-input"
              placeholder="Passwort eingeben..."
            />
          </div>

          <button type="submit" className="login-button">
            <Lock className="w-4 h-4 mr-2" />
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
