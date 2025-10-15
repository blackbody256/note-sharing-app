# NoteShare 📝

A modern, responsive note-taking application with cloud sync and public sharing capabilities. Built with React and Firebase.

**Live Demo:** [https://note-sharing-app-brown.vercel.app](https://note-sharing-app-brown.vercel.app/login)

## ✨ Features

- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **🔐 Secure Authentication** - Email/password login with Firebase Auth
- **☁️ Cloud Sync** - All notes automatically saved to Firebase Firestore
- **✍️ Markdown Support** - Write notes with markdown formatting and live preview
- **🎨 Customizable Colors** - Choose from 12 color themes for each note
- **🔗 Public Sharing** - Generate shareable links for any note
- **🌙 Dark Mode** - Toggle between light and dark themes
- **🔍 Search** - Quickly find notes by title or content
- **⚡ Real-time Updates** - Changes sync instantly across all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project (for backend)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd note-sharing-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Firebase (Authentication, Firestore Database)
- **Styling:** Inline styles with responsive design
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Markdown:** react-markdown
- **Hosting:** Vercel

## 📱 Mobile Support

The application is fully optimized for mobile devices with:
- Touch-friendly UI (48px minimum touch targets)
- Responsive layouts for all screen sizes
- iOS-specific optimizations (prevents zoom on input focus)
- Support for notched devices (iPhone X+)
- Landscape mode support

## 🔒 Security

- Firebase Security Rules configured for user-specific data access
- Public notes only accessible via share link
- Environment variables for sensitive configuration
- Authenticated routes protected with PrivateRoute wrapper

## 📄 License

This project was created as an assignment and is available for educational purposes.

## 🙏 Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- Icons by [Lucide](https://lucide.dev)
- Hosted on [Vercel](https://vercel.com)

---

**Author:** Akanga Andrew  
**Date:** October 15th, 2025
