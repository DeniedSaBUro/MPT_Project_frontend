import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ProfileUpdatePage from './profile/ProfileUpdatePage'
import ProfilePage from './profile/ProfilePage';
import PostPage from './post/PostPage';
import UserSearchModal from './components/SearchPanel';
import './App.css';
import HomePage from './home/Home';
import ExplorePage from './explore/Explore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/edit-profile" element = {
            <ProtectedRoute>
              <ProfileUpdatePage />
            </ProtectedRoute>
          }
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/p/:id" element={<PostPage />} />
          <Route path="/search" element={UserSearchModal}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;