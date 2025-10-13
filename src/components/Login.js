// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);

      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      navigate('/notes');
    } catch (err) {
      // Friendlier error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message);
      }
    }

    setLoading(false);
  }

  return (
    <div style={styles.pageContainer}>
      {/* Left Side - Branding */}
      <div style={styles.brandingSide}>
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
          </div>
          <h1 style={styles.brandTitle}>NoteShare</h1>
          <p style={styles.brandSubtitle}>
            Capture your thoughts, organize your ideas, and share your creativity with the world.
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span>Secure cloud storage</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span>Access anywhere, anytime</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span>Simple and intuitive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={styles.formSide}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={styles.formSubtitle}>
              {isSignup 
                ? 'Sign up to start organizing your notes' 
                : 'Log in to access your notes'
              }
            </p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span style={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading && styles.submitButtonDisabled)
              }}
            >
              {loading ? (
                <span style={styles.spinner}></span>
              ) : (
                isSignup ? 'Create Account' : 'Log In'
              )}
            </button>
          </form>

          {/* Toggle Signup/Login */}
          <div style={styles.toggleSection}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>
            <p style={styles.toggleText}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              style={styles.toggleButton}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Evernote-inspired styles
const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Left Side - Branding
  brandingSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandingContent: {
    maxWidth: '500px',
    color: 'white',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: '30px',
  },
  logo: {
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  brandTitle: {
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '20px',
    letterSpacing: '-0.5px',
  },
  brandSubtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    opacity: 0.95,
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    gap: '12px',
  },
  checkmark: {
    width: '24px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },

  // Right Side - Form
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#fafafa',
  },
  formContainer: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.1)',
  },
  formHeader: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  formSubtitle: {
    fontSize: '15px',
    color: '#666',
  },

  // Error Banner
  errorBanner: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#c33',
  },
  errorIcon: {
    fontSize: '18px',
  },

  // Form Elements
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#999',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '15px',
    border: '2px solid #e5e5e5',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
    fontFamily: 'inherit',
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },

  // Toggle Section
  toggleSection: {
    marginTop: '32px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    marginBottom: '24px',
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 16px',
    color: '#999',
    fontSize: '13px',
    fontWeight: '600',
    position: 'relative',
    zIndex: 1,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  toggleButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#f0f3ff',
    border: '2px solid #e0e7ff',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add CSS for spinner animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #667eea !important;
    background-color: white !important;
  }
  
  button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }
  
  @media (max-width: 768px) {
    .brandingSide {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;