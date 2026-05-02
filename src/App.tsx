import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SharePage from './pages/SharePage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <Routes>
          {/* Dashboard and Login show Navbar */}
          <Route
            path="/"
            element={
              <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen overflow-hidden">
                  <Navbar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <Login />
              </div>
            }
          />

          {/* Share page is standalone */}
          <Route path="/share/:userId/:noteId" element={<SharePage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
