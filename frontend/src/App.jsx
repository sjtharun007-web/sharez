import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import useAuthStore          from './store/authStore.jsx';
import Navbar                from './components/layout/Navbar.jsx';
import LandingPage           from './pages/LandingPage.jsx';
import HomePage              from './pages/HomePage.jsx';
import LoginPage             from './pages/LoginPage.jsx';
import RegisterPage          from './pages/RegisterPage.jsx';
import QuestionDetailPage    from './pages/QuestionDetailPage.jsx';
import AskQuestionPage       from './pages/AskQuestionPage.jsx';
import MyQuestionsPage       from './pages/MyQuestionsPage.jsx';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  return (user && isAuthenticated()) ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  return !(user && isAuthenticated()) ? children : <Navigate to="/questions" replace />;
};

function App() {
  const { user, isAuthenticated } = useAuthStore();
  const loggedIn = user && isAuthenticated();

  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={loggedIn ? <Navigate to="/questions" replace /> : <LandingPage />} />
          <Route path="/login"         element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"      element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/questions"     element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/questions/:id" element={<PrivateRoute><QuestionDetailPage /></PrivateRoute>} />
          <Route path="/ask"           element={<PrivateRoute><AskQuestionPage /></PrivateRoute>} />
          <Route path="/my-questions"  element={<PrivateRoute><MyQuestionsPage /></PrivateRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
