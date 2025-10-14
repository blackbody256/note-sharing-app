// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Notes from './components/Notes';
import PrivateRoute from './components/PrivateRoute';
import SharedNoteView from './components/SharedNoteView';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/notes" 
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            } 
          />
          
          {/* Public route for shared notes */}
          <Route path="/shared/:shareId" element={<SharedNoteView />} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;