import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import QuizSetup from './pages/QuizSetup';
import QuizPlayer from './pages/QuizPlayer';
import QuizResultView from './pages/QuizResultView';
import HistoryPage from './pages/History';
import AnalyticsPage from './pages/Analytics';
import RecommendationsPage from './pages/Recommendations';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import AllUploads from './pages/admin/AllUploads';
import AIUsage from './pages/admin/AIUsage';

// PrivateRoute check
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-darkbg">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// AdminRoute check
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-darkbg">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

// App Layout Wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-darkbg text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-darkbg/80">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Private Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <UploadPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz-setup" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <QuizSetup />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz-player" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <QuizPlayer />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz-results" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <QuizResultView />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <HistoryPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <AnalyticsPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <RecommendationsPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />

          {/* Admin Private Routes */}
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AppLayout>
                  <ManageUsers />
                </AppLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/documents" 
            element={
              <AdminRoute>
                <AppLayout>
                  <AllUploads />
                </AppLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/usage" 
            element={
              <AdminRoute>
                <AppLayout>
                  <AIUsage />
                </AppLayout>
              </AdminRoute>
            } 
          />

          {/* Redirect all unmatched routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
