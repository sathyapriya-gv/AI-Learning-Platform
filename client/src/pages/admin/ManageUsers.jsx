import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { Users, Trash2, Calendar, Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setErrorMsg('Failed to load registered users database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? All their uploaded files, extracted texts, quizzes, and learning metrics will be permanently erased. This cannot be undone.')) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await api.delete(`/analytics/admin/users/${userId}`);
      setSuccessMsg(response.data.message || 'User deleted successfully.');
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans flex items-center space-x-2">
          <span>Manage Platform Users</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Administrator panel to monitor user databases, assign roles, and clean up inactive profiles.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <GlassCard className="border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-slate-500 text-xs">No registered users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-glassborder">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">User Details</th>
                  <th className="py-3.5 px-4 font-semibold">Email Address</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassborder bg-slate-900/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-glassborder flex items-center justify-center font-bold text-indigo-400 text-xs uppercase">
                          {u.username.charAt(0)}
                        </div>
                        <span>{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold uppercase">
                      {u.role === 'admin' ? (
                        <span className="flex items-center text-red-400">
                          <Shield className="h-3.5 w-3.5 mr-1" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-indigo-400">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>Student</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {new Date(u.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/25 transition-all text-xs font-bold inline-flex items-center space-x-1"
                        title="Delete User & Data"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default ManageUsers;
