import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-glassborder bg-darkbg/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-neonIndigo group-hover:scale-105 transition-all">
            <Brain className="h-5 w-5" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            AuraQuiz
          </span>
        </Link>

        {/* User Utilities */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-slate-800/40 border border-glassborder">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user.username}</p>
              <div className="flex items-center space-x-1">
                {user.role === 'admin' ? (
                  <>
                    <Shield className="h-3 w-3 text-red-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">Admin</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Student</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/40 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
