import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  History, 
  Lightbulb, 
  Users, 
  FileText, 
  Activity 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Material', path: '/upload', icon: UploadCloud },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Quiz History', path: '/history', icon: History },
  ];

  const activeStyle = "flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-indigo-300 border border-indigo-500/30 shadow-neonIndigo transition-all";
  const inactiveStyle = "flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all";

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] border-r border-glassborder bg-darkbg/60 backdrop-blur-md flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="space-y-6">
        
        {/* Navigation Group */}
        <div>
          <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3">
            Menu
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink 
                  key={link.path} 
                  to={link.path}
                  className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Recommendations Section */}
        {user.role !== 'admin' && (
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3">
              Personalized
            </p>
            <nav className="space-y-1">
              <NavLink 
                to="/recommendations"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Lightbulb className="h-5 w-5" />
                <span className="font-medium text-sm">Recommendations</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Navigation Group */}
        {user.role === 'admin' && (
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3">
              Admin Controls
            </p>
            <nav className="space-y-1">
              <NavLink 
                to="/admin/users"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium text-sm">Manage Users</span>
              </NavLink>
              <NavLink 
                to="/admin/documents"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium text-sm">All Uploads</span>
              </NavLink>
              <NavLink 
                to="/admin/usage"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Activity className="h-5 w-5" />
                <span className="font-medium text-sm">AI Usage Monitor</span>
              </NavLink>
            </nav>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 rounded-xl bg-slate-900/40 border border-glassborder text-center">
        <p className="text-[10px] text-slate-500 font-medium">AuraQuiz Analytics</p>
        <p className="text-[9px] text-indigo-400/70 font-semibold mt-0.5">v1.0.0 (Beta)</p>
      </div>

    </aside>
  );
};

export default Sidebar;
