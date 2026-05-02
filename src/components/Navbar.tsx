import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, BookOpen, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="border-b bg-white px-4 py-3 shadow-sm" id="navbar">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600" id="nav-logo">
          <BookOpen size={28} />
          <span>CloudNotes</span>
        </Link>

        <div className="flex items-center gap-4" id="nav-actions">
          {user ? (
            <div className="flex items-center gap-4" id="nav-user-info">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 leading-none mt-1">{user.email}</p>
              </div>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt="Profile"
                className="h-10 w-10 rounded-full border border-gray-200"
                id="user-avatar"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                id="btn-logout"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
              id="btn-login-nav"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
