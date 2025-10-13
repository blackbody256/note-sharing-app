// src/components/Notes.js
import React, { useState, useEffect } from 'react';
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
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { LogOut, Plus, Trash2, Edit2, Check, X, Search, Eye, Code, Moon, Sun } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // Markdown preview toggles
  const [previewMode, setPreviewMode] = useState(false);
  const [viewingMarkdown, setViewingMarkdown] = useState({});
  const [editPreviewMode, setEditPreviewMode] = useState(false);
  
  // Dark mode state - persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const colors = [
    '#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb',
    '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed',
  ];

  // Dark mode colors
  const darkColors = [
    '#202124', '#5c2b29', '#635d19', '#7c7c1e', '#345920', '#16504b',
    '#2d555e', '#1e3a5f', '#42275e', '#5b2245', '#442f22', '#3c3f43',
  ];

  const [selectedColor, setSelectedColor] = useState('#ffffff');

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (editingId) {
          e.preventDefault();
          handleSaveEdit(editingId);
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (editingId) {
          setEditPreviewMode(prev => !prev);
        } else {
          setPreviewMode(prev => !prev);
        }
      }
      
      if (e.key === 'Escape' && editingId) {
        cancelEdit();
      }
      
      // Toggle dark mode with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDarkMode(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editingId]);

  useEffect(() => {
    if (!currentUser) return;

    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      notesData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      setNotes(notesData);
    });

    return unsubscribe;
  }, [currentUser]);

  async function handleAddNote(e) {
    e.preventDefault();

    if (!title.trim() && !content.trim()) {
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
        createdAt: serverTimestamp()
      });

      setTitle('');
      setContent('');
      setSelectedColor(darkMode ? '#202124' : '#ffffff');
      setPreviewMode(false);
    } catch (error) {
      alert('Error creating note: ' + error.message);
    }

    setLoading(false);
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      alert('Error deleting note: ' + error.message);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditPreviewMode(false);
  }

  async function handleSaveEdit(noteId) {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        title: editTitle.trim() || 'Untitled',
        content: editContent.trim()
      });
      setEditingId(null);
      setEditPreviewMode(false);
    } catch (error) {
      alert('Error updating note: ' + error.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditPreviewMode(false);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  }

  function toggleNoteMarkdown(noteId) {
    setViewingMarkdown(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  }

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic styles based on dark mode
  const getDynamicStyles = () => ({
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#202124' : '#ffffff',
      color: darkMode ? '#e8eaed' : '#202124',
    },
    header: {
      ...styles.header,
      backgroundColor: darkMode ? '#292a2d' : '#fff',
      borderBottom: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
    },
    headerTitle: {
      ...styles.headerTitle,
      color: darkMode ? '#e8eaed' : '#202124',
    },
    userEmail: {
      ...styles.userEmail,
      color: darkMode ? '#9aa0a6' : '#5f6368',
    },
    logoutButton: {
      ...styles.logoutButton,
      backgroundColor: darkMode ? '#3c4043' : '#f1f3f4',
      color: darkMode ? '#e8eaed' : '#5f6368',
    },
    createCard: {
      ...styles.createCard,
      backgroundColor: selectedColor,
      border: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
    },
    searchInput: {
      ...styles.searchInput,
      backgroundColor: darkMode ? '#3c4043' : '#f1f3f4',
      color: darkMode ? '#e8eaed' : '#202124',
      border: darkMode ? '1px solid #5f6368' : '1px solid #e0e0e0',
    },
    searchIcon: {
      ...styles.searchIcon,
      color: darkMode ? '#9aa0a6' : '#5f6368',
    },
    noteCount: {
      ...styles.noteCount,
      color: darkMode ? '#9aa0a6' : '#5f6368',
    },
    emptyTitle: {
      ...styles.emptyTitle,
      color: darkMode ? '#e8eaed' : '#202124',
    },
    emptyText: {
      ...styles.emptyText,
      color: darkMode ? '#9aa0a6' : '#5f6368',
    },
    noteTitle: {
      ...styles.noteTitle,
      color: darkMode ? '#e8eaed' : '#202124',
    },
    noteContent: {
      ...styles.noteContent,
      color: darkMode ? '#9aa0a6' : '#5f6368',
    },
    noteCard: {
      ...styles.noteCard,
      border: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0',
    },
  });

  const dynamicStyles = getDynamicStyles();

  return (
    <div style={dynamicStyles.container}>
      {/* Header */}
      <header style={dynamicStyles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h1 style={dynamicStyles.headerTitle}>NoteShare</h1>
        </div>

        <div style={styles.headerRight}>
          <span style={dynamicStyles.userEmail}>{currentUser.email}</span>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={styles.themeToggle}
            className="themeToggle"
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode (Ctrl+D)`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={handleLogout} style={dynamicStyles.logoutButton} className="logoutButton">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Create Note Section */}
        <div style={styles.createSection}>
          <form onSubmit={handleAddNote} style={styles.createForm}>
            <div style={dynamicStyles.createCard}>
              {/* Mode Toggle Buttons */}
              <div style={styles.modeToggle}>
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  style={{
                    ...styles.modeButton,
                    ...(previewMode ? styles.modeButtonInactive : styles.modeButtonActive)
                  }}
                  className="modeButton"
                >
                  <Code size={16} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  style={{
                    ...styles.modeButton,
                    ...(previewMode ? styles.modeButtonActive : styles.modeButtonInactive)
                  }}
                  className="modeButton"
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
              </div>

              {!previewMode ? (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.createTitle}
                  />
                  <textarea
                    placeholder="Write your note... (Markdown supported)&#10;&#10;Try:&#10;# Heading&#10;**bold** or *italic*&#10;- List item&#10;[Link](https://example.com)&#10;```code```"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="6"
                    style={styles.createContent}
                  />
                </>
              ) : (
                <div style={styles.previewContainer}>
                  <h3 style={styles.previewTitle}>{title || 'Untitled'}</h3>
                  <MarkdownPreview content={content} backgroundColor={selectedColor} />
                </div>
              )}
              
              {/* Color Picker */}
              <div style={styles.colorPicker}>
                {(darkMode ? darkColors : colors).map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: color,
                      border: selectedColor === color ? '3px solid #667eea' : darkMode ? '2px solid #5f6368' : '2px solid #ddd',
                      transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                    className="colorButton"
                    title={`Select color ${index + 1}`}
                  />
                ))}
              </div>

              <div style={styles.createActions}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={styles.addButton}
                  className="addButton"
                >
                  <Plus size={18} />
                  <span>{loading ? 'Adding...' : 'Add Note'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Markdown Cheatsheet */}
          <div style={styles.cheatsheet}>
            <details style={{...styles.cheatsheetDetails, backgroundColor: darkMode ? '#292a2d' : '#f8f9fa', border: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0'}} className="cheatsheetDetails">
              <summary style={{...styles.cheatsheetSummary, color: darkMode ? '#9aa0a6' : '#5f6368'}}>📝 Markdown Guide - Click to expand</summary>
              <div style={{...styles.cheatsheetContent, borderTop: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0'}}>
                <div style={styles.cheatsheetGrid}>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Headers</strong>
                    <code># Heading 1</code>
                    <code>## Heading 2</code>
                    <code>### Heading 3</code>
                  </div>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Emphasis</strong>
                    <code>**bold text**</code>
                    <code>*italic text*</code>
                    <code>~~strikethrough~~</code>
                  </div>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Lists</strong>
                    <code>- Unordered item</code>
                    <code>1. Ordered item</code>
                    <code>- [ ] Checkbox</code>
                  </div>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Links & Images</strong>
                    <code>[Link text](url)</code>
                    <code>![Alt text](image.jpg)</code>
                  </div>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Code</strong>
                    <code>`inline code`</code>
                    <code>```language</code>
                    <code>code block</code>
                    <code>```</code>
                  </div>
                  <div style={styles.cheatsheetItem}>
                    <strong style={styles.cheatsheetHeader}>Other</strong>
                    <code>&gt; Blockquote</code>
                    <code>--- (Horizontal rule)</code>
                    <code>| Table | Cell |</code>
                  </div>
                </div>
                <div style={{...styles.cheatsheetFooter, borderTop: darkMode ? '1px solid #3c4043' : '1px solid #e0e0e0', color: darkMode ? '#9aa0a6' : '#5f6368'}}>
                  <strong>Shortcuts:</strong> Ctrl/Cmd+P (Toggle Preview) • Ctrl/Cmd+Enter (Save) • Ctrl/Cmd+D (Dark Mode) • Esc (Cancel)
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchSection}>
          <div style={styles.searchBar}>
            <Search size={20} style={dynamicStyles.searchIcon} />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={dynamicStyles.searchInput}
              className="searchInput"
            />
          </div>
          <span style={dynamicStyles.noteCount}>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3 style={dynamicStyles.emptyTitle}>
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p style={dynamicStyles.emptyText}>
              {searchTerm 
                ? 'Try searching with different keywords' 
                : 'Create your first note above with markdown support!'
              }
            </p>
          </div>
        ) : (
          <div style={styles.notesGrid}>
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                style={{
                  ...dynamicStyles.noteCard,
                  backgroundColor: note.color || (darkMode ? '#202124' : '#ffffff')
                }}
                className="noteCard"
              >
                {editingId === note.id ? (
                  <div style={styles.editMode}>
                    <div style={styles.modeToggle}>
                      <button
                        type="button"
                        onClick={() => setEditPreviewMode(false)}
                        style={{
                          ...styles.modeButton,
                          ...(editPreviewMode ? styles.modeButtonInactive : styles.modeButtonActive)
                        }}
                        className="modeButton"
                      >
                        <Code size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPreviewMode(true)}
                        style={{
                          ...styles.modeButton,
                          ...(editPreviewMode ? styles.modeButtonActive : styles.modeButtonInactive)
                        }}
                        className="modeButton"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>
                    </div>

                    {!editPreviewMode ? (
                      <>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={styles.editTitle}
                          className="editTitle"
                          autoFocus
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows="8"
                          style={styles.editContent}
                          className="editContent"
                        />
                      </>
                    ) : (
                      <div style={styles.previewContainer}>
                        <h3 style={styles.previewTitle}>{editTitle || 'Untitled'}</h3>
                        <MarkdownPreview content={editContent} backgroundColor={note.color} />
                      </div>
                    )}

                    <div style={styles.editActions}>
                      <button 
                        onClick={() => handleSaveEdit(note.id)}
                        style={{...styles.actionButton, ...styles.saveButton}}
                        className="actionButton"
                      >
                        <Check size={16} />
                        <span>Save</span>
                      </button>
                      <button 
                        onClick={cancelEdit}
                        style={{...styles.actionButton, ...styles.cancelButton}}
                        className="actionButton"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={dynamicStyles.noteTitle}>{note.title}</h3>
                    
                    {viewingMarkdown[note.id] ? (
                      <div style={styles.markdownView} className="markdownView">
                        <MarkdownPreview content={note.content} backgroundColor={note.color} />
                      </div>
                    ) : (
                      <p style={dynamicStyles.noteContent}>{note.content}</p>
                    )}

                    {note.createdAt && (
                      <p style={styles.noteDate}>
                        {new Date(note.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                    <div style={styles.noteActions}>
                      <button 
                        onClick={() => toggleNoteMarkdown(note.id)}
                        style={{...styles.actionButton, ...styles.viewButton}}
                        className="actionButton"
                      >
                        {viewingMarkdown[note.id] ? <Code size={14} /> : <Eye size={14} />}
                        <span>{viewingMarkdown[note.id] ? 'Raw' : 'Preview'}</span>
                      </button>
                      <button 
                        onClick={() => startEdit(note)}
                        style={{...styles.actionButton, ...styles.editButton}}
                        className="actionButton"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        className="actionButton"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
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
    margin: 0,
    transition: 'color 0.3s ease',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    fontSize: '14px',
    transition: 'color 0.3s ease',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
  },
  createSection: {
    marginBottom: '40px',
  },
  createForm: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  createCard: {
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '12px',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  modeButtonInactive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    color: '#5f6368',
  },
  createTitle: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    marginBottom: '8px',
    fontFamily: 'inherit',
  },
  createContent: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    backgroundColor: 'transparent',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    minHeight: '150px',
  },
  previewContainer: {
    minHeight: '150px',
    padding: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#202124',
  },
  colorPicker: {
    display: 'flex',
    gap: '8px',
    padding: '12px 8px',
    borderTop: '1px solid #e0e0e0',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  createActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '8px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  cheatsheet: {
    maxWidth: '800px',
    margin: '16px auto 0',
  },
  cheatsheetDetails: {
    borderRadius: '8px',
    padding: '12px 16px',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  cheatsheetSummary: {
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    userSelect: 'none',
    transition: 'color 0.3s ease',
  },
  cheatsheetContent: {
    marginTop: '12px',
    paddingTop: '12px',
    transition: 'border-color 0.3s ease',
  },
  cheatsheetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    fontSize: '13px',
  },
  cheatsheetItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cheatsheetHeader: {
    color: '#667eea',
    marginBottom: '4px',
    fontSize: '14px',
  },
  cheatsheetFooter: {
    marginTop: '16px',
    paddingTop: '12px',
    fontSize: '12px',
    transition: 'border-color 0.3s ease, color 0.3s ease',
  },
  searchSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '16px',
  },
  searchBar: {
    position: 'relative',
    flex: 1,
    maxWidth: '600px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    transition: 'color 0.3s ease',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    fontSize: '14px',
    borderRadius: '24px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  noteCount: {
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    transition: 'color 0.3s ease',
  },
  emptyText: {
    fontSize: '14px',
    lineHeight: '1.6',
    transition: 'color 0.3s ease',
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  },
  noteCard: {
    borderRadius: '8px',
    padding: '16px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    wordBreak: 'break-word',
    transition: 'color 0.3s ease',
  },
  noteContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '12px',
    flex: 1,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    transition: 'color 0.3s ease',
  },
  markdownView: {
    flex: 1,
    marginBottom: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  noteDate: {
    fontSize: '11px',
    color: '#80868b',
    marginBottom: '12px',
  },
  noteActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  viewButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    color: '#2196f3',
  },
  editButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    color: '#f44336',
  },
  saveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#4caf50',
  },
  cancelButton: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
    color: '#616161',
  },
  editMode: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  editTitle: {
    width: '100%',
    padding: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'rgba(255,255,255,0.5)',
    fontFamily: 'inherit',
  },
  editContent: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    backgroundColor: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    lineHeight: '1.6',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
  },
};

// Enhanced hover effects
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .themeToggle:hover {
    background-color: rgba(102, 126, 234, 0.2) !important;
    transform: scale(1.1);
  }

  .logoutButton:hover {
    opacity: 0.8;
  }

  .addButton:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  }

  .addButton:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .colorButton:hover {
    transform: scale(1.15) !important;
  }

  .searchInput:focus {
    box-shadow: 0 1px 6px rgba(32,33,36,0.28);
  }

  .noteCard:hover {
    box-shadow: 0 3px 8px rgba(0,0,0,0.15) !important;
    transform: translateY(-2px);
  }

  .actionButton:hover {
    opacity: 0.8;
  }

  .editTitle:focus,
  .editContent:focus {
    border-color: #667eea !important;
    background-color: white !important;
  }

  .modeButton:hover {
    opacity: 0.9;
  }

  .cheatsheetDetails summary:hover {
    color: #667eea;
  }

  .markdownView::-webkit-scrollbar,
  .previewContainer::-webkit-scrollbar {
    width: 6px;
  }

  .markdownView::-webkit-scrollbar-track,
  .previewContainer::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
    border-radius: 3px;
  }

  .markdownView::-webkit-scrollbar-thumb,
  .previewContainer::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
  }

  .markdownView::-webkit-scrollbar-thumb:hover,
  .previewContainer::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.3);
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 12px;
      padding: 16px !important;
    }

    .headerLeft,
    .headerRight {
      width: 100%;
      justify-content: space-between;
    }

    .main {
      padding: 16px !important;
    }

    .searchSection {
      flex-direction: column;
      align-items: stretch !important;
    }

    .notesGrid {
      grid-template-columns: 1fr !important;
    }

    .createForm {
      max-width: 100% !important;
    }

    .cheatsheetGrid {
      grid-template-columns: 1fr !important;
    }

    .modeToggle {
      flex-wrap: wrap;
    }
  }

  @media (max-width: 480px) {
    .headerTitle {
      font-size: 20px !important;
    }

    .colorPicker {
      gap: 6px !important;
    }

    .colorButton {
      width: 28px !important;
      height: 28px !important;
    }

    .editActions,
    .noteActions {
      flex-direction: column;
    }

    .actionButton {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Notes;