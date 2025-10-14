// src/components/Notes.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import MarkdownPreview from './MarkdownPreview';
import { LogOut, Plus, Trash2, Edit2, Check, X, Search, Eye, Code, Share2, Sun, Moon } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [markdownMode, setMarkdownMode] = useState('edit');
  const [viewingMarkdown, setViewingMarkdown] = useState({});
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isDarkMode, setIsDarkMode] = useDarkMode();

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const colors = [
    '#ffffff', '#f28b82', '#fbbc04', '#fff475', 
    '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa',
    '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
  ];

  const darkColors = [
    '#202124', '#5c2b29', '#614a19', '#635d19',
    '#345920', '#16504b', '#2d555e', '#1e3a5f',
    '#42275e', '#5b2245', '#442f19', '#3c3f43'
  ];

  useEffect(() => {
    if (!currentUser) return;

    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesData);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleSaveEdit = useCallback(async () => {
    if (!editTitle.trim() && !editContent.trim()) {
      alert('Please enter a title or content for your note.');
      return;
    }

    try {
      const noteRef = doc(db, 'notes', editingId);
      await updateDoc(noteRef, {
        title: editTitle.trim() || 'Untitled',
        content: editContent.trim(),
        updatedAt: serverTimestamp(),
      });

      setEditingId(null);
      setEditTitle('');
      setEditContent('');
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Error updating note: ' + error.message);
    }
  }, [editingId, editTitle, editContent]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && editingId) {
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && editingId) {
        handleSaveEdit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editingId, handleSaveEdit]);

  async function handleAddNote(e) {
    e.preventDefault();

    if (!title.trim() && !content.trim()) {
      alert('Please enter a title or content for your note.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'notes'), {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        color: selectedColor,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        isPublic: false,
        shareId: null
      });

      setTitle('');
      setContent('');
      setSelectedColor(colors[0]);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note: ' + error.message);
    }
  }

  async function handleShareNote(noteId) {
    try {
      const shareId = Math.random().toString(36).substring(2, 10);
      
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        isPublic: true,
        shareId: shareId
      });
      
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard! ✓\n\n' + shareUrl);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied! ✓\n\n' + shareUrl);
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      alert('Error sharing note: ' + error.message);
    }
  }

  async function handleStopSharing(noteId) {
    if (!window.confirm('Stop sharing this note? The link will no longer work.')) {
      return;
    }
    
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        isPublic: false,
        shareId: null
      });
      
      alert('Note is no longer shared ✓');
    } catch (error) {
      console.error('Error stopping share:', error);
      alert('Error stopping share: ' + error.message);
    }
  }

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out: ' + error.message);
    }
  }

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower)
    );
  });

  const toggleNoteMarkdown = (noteId) => {
    setViewingMarkdown(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#202124' : '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.3s ease',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      backgroundColor: isDarkMode ? '#292a2d' : 'white',
      borderBottom: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
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
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: '600',
      color: isDarkMode ? '#e8eaed' : '#202124',
      margin: 0,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    userInfo: {
      fontSize: '14px',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    iconButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDarkMode ? '#e8eaed' : '#5f6368',
      transition: 'background-color 0.2s',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 20px',
    },
    createSection: {
      backgroundColor: isDarkMode ? '#292a2d' : 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: isDarkMode 
        ? '0 2px 8px rgba(0,0,0,0.3)' 
        : '0 2px 8px rgba(0,0,0,0.1)',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: isDarkMode ? '#e8eaed' : '#202124',
      marginBottom: '16px',
    },
    colorPicker: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap',
    },
    colorOption: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      cursor: 'pointer',
      border: '2px solid transparent',
      transition: 'all 0.2s',
    },
    colorOptionSelected: {
      transform: 'scale(1.2)',
      borderColor: '#667eea',
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '12px',
      backgroundColor: isDarkMode ? '#202124' : 'white',
      color: isDarkMode ? '#e8eaed' : '#202124',
      fontFamily: 'inherit',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '12px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
      backgroundColor: isDarkMode ? '#202124' : 'white',
      color: isDarkMode ? '#e8eaed' : '#202124',
    },
    modeToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    modeButton: {
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '500',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    modeButtonActive: {
      backgroundColor: '#667eea',
      color: 'white',
    },
    modeButtonInactive: {
      backgroundColor: isDarkMode ? '#3c4043' : '#f1f3f4',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    markdownPreview: {
      minHeight: '120px',
      padding: '12px',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '12px',
      backgroundColor: isDarkMode ? '#202124' : 'white',
      color: isDarkMode ? '#e8eaed' : '#202124',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    },
    markdownHelp: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: isDarkMode ? '#202124' : '#f8f9fa',
      borderRadius: '8px',
      fontSize: '13px',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    helpToggle: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      padding: '4px 0',
      marginBottom: '8px',
    },
    searchSection: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    searchContainer: {
      position: 'relative',
      flex: 1,
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      padding: '10px 10px 10px 36px',
      fontSize: '14px',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      borderRadius: '24px',
      backgroundColor: isDarkMode ? '#292a2d' : 'white',
      color: isDarkMode ? '#e8eaed' : '#202124',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    noteCount: {
      fontSize: '14px',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
      fontWeight: '500',
    },
    notesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
    },
    noteCard: {
      borderRadius: '12px',
      padding: '16px',
      boxShadow: isDarkMode 
        ? '0 2px 8px rgba(0,0,0,0.3)' 
        : '0 2px 8px rgba(0,0,0,0.1)',
      border: isDarkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
      transition: 'all 0.2s',
      cursor: 'pointer',
      position: 'relative',
    },
    sharedBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '12px',
    },
    noteTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDarkMode ? '#e8eaed' : '#202124',
      marginBottom: '8px',
      wordBreak: 'break-word',
    },
    noteContent: {
      fontSize: '14px',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
      lineHeight: '1.5',
      marginBottom: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    noteDate: {
      fontSize: '12px',
      color: isDarkMode ? '#80868b' : '#80868b',
      marginBottom: '12px',
    },
    noteActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '500',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    viewButton: {
      backgroundColor: isDarkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
    },
    shareButton: {
      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
    },
    stopShareButton: {
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
    },
    editButton: {
      backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
      color: '#ff9800',
    },
    deleteButton: {
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
    },
    saveButton: {
      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? 'rgba(158, 158, 158, 0.2)' : 'rgba(158, 158, 158, 0.1)',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: isDarkMode ? '#9aa0a6' : '#5f6368',
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyStateText: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
      color: isDarkMode ? '#e8eaed' : '#202124',
    },
    emptyStateSubtext: {
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h1 style={styles.headerTitle}>NoteShare</h1>
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={styles.iconButton}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span style={styles.userInfo}>{currentUser.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.createSection}>
          <h2 style={styles.sectionTitle}>Create New Note</h2>
          
          <div style={styles.colorPicker}>
            {(isDarkMode ? darkColors : colors).map((color) => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  border: color === '#ffffff' || color === '#202124' 
                    ? `2px solid ${isDarkMode ? '#3c4043' : '#e0e0e0'}` 
                    : '2px solid transparent',
                  ...(selectedColor === color ? styles.colorOptionSelected : {}),
                }}
                title={color}
              />
            ))}
          </div>

          <form onSubmit={handleAddNote}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            <div style={styles.modeToggle}>
              <button
                type="button"
                onClick={() => setMarkdownMode('edit')}
                style={{
                  ...styles.modeButton,
                  ...(markdownMode === 'edit' ? styles.modeButtonActive : styles.modeButtonInactive),
                }}
              >
                <Code size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setMarkdownMode('preview')}
                style={{
                  ...styles.modeButton,
                  ...(markdownMode === 'preview' ? styles.modeButtonActive : styles.modeButtonInactive),
                }}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>

            {markdownMode === 'edit' ? (
              <textarea
                placeholder="Write your note... (Markdown supported)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.textarea}
              />
            ) : (
              <div style={styles.markdownPreview}>
                {content ? (
                  <MarkdownPreview content={content} backgroundColor={selectedColor} />
                ) : (
                  <p style={{ color: isDarkMode ? '#9aa0a6' : '#5f6368' }}>
                    Nothing to preview yet. Start writing in Edit mode!
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.addButton}>
              <Plus size={18} />
              <span>{loading ? 'Adding...' : 'Add Note'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
              style={styles.helpToggle}
            >
              {showMarkdownHelp ? 'Hide' : 'Show'} Markdown Guide
            </button>

            {showMarkdownHelp && (
              <div style={styles.markdownHelp}>
                <strong>Markdown Quick Reference:</strong>
                <br />
                <code># Heading 1</code> → <strong>Heading 1</strong>
                <br />
                <code>**bold**</code> → <strong>bold</strong>
                <br />
                <code>*italic*</code> → <em>italic</em>
                <br />
                <code>- List item</code> → • List item
                <br />
                <code>[Link](url)</code> → Link
                <br />
                <code>`code`</code> → <code>code</code>
              </div>
            )}
          </form>
        </div>

        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <span style={styles.noteCount}>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {filteredNotes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📝</div>
            <div style={styles.emptyStateText}>
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </div>
            <div style={styles.emptyStateSubtext}>
              {searchTerm
                ? 'Try a different search term'
                : 'Create your first note above to get started!'}
            </div>
          </div>
        ) : (
          <div style={styles.notesGrid}>
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  ...styles.noteCard,
                  backgroundColor: isDarkMode
                    ? note.color === '#ffffff'
                      ? darkColors[0]
                      : darkColors[colors.indexOf(note.color)] || note.color
                    : note.color,
                }}
              >
                {note.isPublic && note.userId === currentUser.uid && (
                  <div style={styles.sharedBadge}>
                    <Share2 size={14} />
                    <span>Publicly Shared</span>
                  </div>
                )}

                {editingId === note.id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={styles.input}
                      autoFocus
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={styles.textarea}
                      rows="6"
                    />
                    <div style={styles.noteActions}>
                      <button
                        onClick={handleSaveEdit}
                        style={{ ...styles.actionButton, ...styles.saveButton }}
                      >
                        <Check size={14} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ ...styles.actionButton, ...styles.cancelButton }}
                      >
                        <X size={14} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={styles.noteTitle}>{note.title}</h3>
                    {viewingMarkdown[note.id] ? (
                      <div style={styles.noteContent}>
                        <MarkdownPreview content={note.content} backgroundColor={note.color} />
                      </div>
                    ) : (
                      <p style={styles.noteContent}>
                        {note.content.length > 200
                          ? note.content.substring(0, 200) + '...'
                          : note.content}
                      </p>
                    )}
                    {note.createdAt && (
                      <p style={styles.noteDate}>
                        {new Date(note.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                    <div style={styles.noteActions}>
                      <button
                        onClick={() => toggleNoteMarkdown(note.id)}
                        style={{ ...styles.actionButton, ...styles.viewButton }}
                      >
                        {viewingMarkdown[note.id] ? <Code size={14} /> : <Eye size={14} />}
                        <span>{viewingMarkdown[note.id] ? 'Raw' : 'Preview'}</span>
                      </button>

                      {note.userId === currentUser.uid && (
                        note.isPublic ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleShareNote(note.id)}
                              style={{ ...styles.actionButton, ...styles.shareButton }}
                            >
                              <Share2 size={14} />
                              <span>Copy Link</span>
                            </button>
                            <button
                              onClick={() => handleStopSharing(note.id)}
                              style={{ ...styles.actionButton, ...styles.stopShareButton }}
                            >
                              <X size={14} />
                              <span>Stop Sharing</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleShareNote(note.id)}
                            style={{ ...styles.actionButton, ...styles.shareButton }}
                          >
                            <Share2 size={14} />
                            <span>Share</span>
                          </button>
                        )
                      )}

                      <button
                        onClick={() => startEdit(note)}
                        style={{ ...styles.actionButton, ...styles.editButton }}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notes;

