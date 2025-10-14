import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MarkdownPreview from './MarkdownPreview';
import { Eye, Code, Home } from 'lucide-react';

function SharedNoteView() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('preview');

  useEffect(() => {
    async function fetchSharedNote() {
      try {
        setLoading(true);
        
        const notesRef = collection(db, 'notes');
        const q = query(
          notesRef, 
          where('shareId', '==', shareId),
          where('isPublic', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Note not found or no longer shared');
        } else {
          const noteData = snapshot.docs[0].data();
          setNote(noteData);
        }
      } catch (err) {
        console.error('Error fetching shared note:', err);
        setError('Error loading note: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedNote();
  }, [shareId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading shared note...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>😕 {error}</h2>
          <p style={styles.errorText}>
            This note may have been deleted or is no longer being shared.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={styles.homeButton}
          >
            <Home size={18} />
            <span>Go to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.headerTitle}>NoteShare</h1>
            <p style={styles.headerSubtitle}>Viewing Shared Note</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={styles.signupButton}
        >
          Create Free Account
        </button>
      </header>

      <main style={styles.main}>
        <div style={{...styles.noteCard, backgroundColor: note.color || '#ffffff'}}>
          <div style={styles.modeToggle}>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                ...styles.modeButton,
                ...(viewMode === 'preview' ? styles.modeButtonActive : styles.modeButtonInactive)
              }}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                ...styles.modeButton,
                ...(viewMode === 'raw' ? styles.modeButtonActive : styles.modeButtonInactive)
              }}
            >
              <Code size={16} />
              <span>Raw Text</span>
            </button>
          </div>

          <h1 style={styles.noteTitle}>{note.title || 'Untitled'}</h1>

          {viewMode === 'preview' ? (
            <div style={styles.markdownContent}>
              <MarkdownPreview content={note.content} backgroundColor={note.color} />
            </div>
          ) : (
            <pre style={styles.rawContent}>{note.content}</pre>
          )}

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Created {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : 'recently'}
            </p>
            <p style={styles.footerCTA}>
              Like this? <span style={styles.link} onClick={() => navigate('/login')}>Create your own notes →</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666',
  },
  errorContainer: {
    maxWidth: '500px',
    margin: '100px auto',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  errorTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  homeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    padding: '6px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#5f6368',
    margin: 0,
  },
  signupButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  main: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 20px',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  modeButtonInactive: {
    backgroundColor: '#f1f3f4',
    color: '#5f6368',
  },
  noteTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#202124',
    marginBottom: '24px',
    wordBreak: 'break-word',
  },
  markdownContent: {
    minHeight: '200px',
    marginBottom: '32px',
  },
  rawContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#5f6368',
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '32px',
  },
  footer: {
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  footerText: {
    fontSize: '13px',
    color: '#80868b',
    marginBottom: '12px',
  },
  footerCTA: {
    fontSize: '14px',
    color: '#5f6368',
  },
  link: {
    color: '#667eea',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default SharedNoteView;